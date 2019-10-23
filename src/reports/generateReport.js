import { buildQuery } from '@kfarranger/middleware';
import xl from 'excel4node';
import flattenDeep from 'lodash/flattenDeep';
import uniq from 'lodash/uniq';

import * as env from '../env';
import {
  getExtendedConfigs,
  getNestedFields,
  findValueInField,
  reduceAndMerge,
} from '../utils/arrangerUtils';
import { executeSearchAfterQuery } from '../utils/esUtils';
import { normalizeConfigs } from '../utils/configUtils';

const EMPTY_HEADER = '--';

const makeReportQuery = (extendedConfig, sqon, sheetConfig) => {
  const nestedFields = getNestedFields(extendedConfig);
  const query = buildQuery({ nestedFields, filters: sqon });
  const source = uniq(
    flattenDeep(sheetConfig.columns.map(col => col.additionalFields.concat(col.field))),
  );
  const sort = sheetConfig.sort; // "sort" is necessary to activate "search_after"
  return { query, _source: source, sort };
};

const addHeaderCellByType = ws => (columnConfig, columnIndex) => {
  ws.cell(1, columnIndex + 1).string(columnConfig.header || EMPTY_HEADER);
};

const emptyCell = (val, cell) => cell.string(String());
const setCellValueByType = {
  string: (val, cell) => cell.string(String(val)),
  boolean: (val, cell) => cell.bool(val),
  number: (val, cell) => cell.number(val),
  object: (val, cell) => cell.string(String(val)),
};

const addCellByType = (ws, rowIndex, resultRow) => {
  // use the correct type of cell
  return (columnConfig, columnIndex) => {
    // Cells are one based, first parameter being the row, second the column
    //  e.g. ws.cell(1, 3) is C1
    const rawValue = findValueInField(resultRow, columnConfig.field);
    const value = columnConfig.transform(rawValue, resultRow);
    const cell = ws.cell(rowIndex, columnIndex + 1);
    const setter = value === null ? emptyCell : setCellValueByType[typeof value] || emptyCell;
    setter(value, cell);
  };
};

/**
 * Returns a default filename for the report, in case none was provided.
 * @param {object} reportConfigs - the raw report configuration.
 */
const getDefaultFilename = () => {
  // report_YYYYMMDD.xlsx
  const dateStamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  return `report_${dateStamp}.xlsx`;
};

/**
 * Generate and stream a report to `res`.
 * @param {object} es - an `elasticsearch.Client` instance.
 * @param {object} res - the `http.ServerResponse` in which to stream the report.
 * @param {string} projectId - the id of the arranger project.
 * @param {object} sqon - the sqon used to filter the results.
 * @param {string} filename - the desired filename for the report.
 * @param {object} reportConfigs - the raw report configuration.
 * @returns {Promise<void>} - A `Promise` that resolve to `void` once the report has been sent.
 */
export default async function generateReport(es, res, projectId, sqon, filename, reportConfigs) {
  // create the Excel Workbook
  const wb = new xl.Workbook();

  // decorated the configs with default values , values from arranger's project, etc...
  const normalizedConfigs = await normalizeConfigs(es, projectId, reportConfigs);

  // generate the report for each sheet
  await Promise.all(
    normalizedConfigs.sheets.map(async sheetConfig => {
      const ws = wb.addWorksheet(sheetConfig.sheetName);

      // prepare the ES query
      console.time(`getExtendedConfigs-${projectId}-${sheetConfig.sheetName}`);
      const extendedConfig = await getExtendedConfigs(es, projectId, sheetConfig.indexName);
      console.timeEnd(`getExtendedConfigs-${projectId}-${sheetConfig.sheetName}`);

      const searchParams = makeReportQuery(extendedConfig, sqon, sheetConfig);

      // add the header row
      sheetConfig.columns.forEach(addHeaderCellByType(ws, extendedConfig));

      // wrap in an object to avoid closure shenanigans
      // row index is one based, 1 is the header row
      const wrapper = { rowIndex: 2 };
      try {
        console.time(`executeSearchAfterQuery ${sheetConfig.sheetName}`);
        await executeSearchAfterQuery(es, sheetConfig.alias, searchParams, {
          onPageFetched: chunk => {
            // bring back nested nodes to the root document to have a flat array to handle
            const effectiveRows = sheetConfig.root
              ? chunk.reduce((rows, row) => rows.concat(reduceAndMerge(row, sheetConfig.root)), [])
              : chunk;

            // add data to the worksheet
            effectiveRows.forEach(row => {
              const cellAppender = addCellByType(ws, wrapper.rowIndex, row);
              sheetConfig.columns.forEach(cellAppender);
              wrapper.rowIndex += 1;
            });
          },
          pageSize: env.ES_PAGESIZE,
        });
        console.timeEnd(`executeSearchAfterQuery ${sheetConfig.sheetName}`);
      } catch (err) {
        console.error(`Error while fetching the data for sheet "${sheetConfig.sheetName}"`);
        throw err;
      }
    }),
  );

  // finalize the file here and stream it back
  console.time(`write report`);
  const reportFilename = filename || getDefaultFilename();
  wb.write(reportFilename, res);
  console.timeEnd(`write report`);
}
