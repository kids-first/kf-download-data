import { buildQuery } from '@kfarranger/middleware';
import xl from 'excel4node';
import flattenDeep from 'lodash/flattenDeep';
import uniq from 'lodash/uniq';

import * as env from '../../env';
import {
  getExtendedConfigs,
  getNestedFields,
  findValueInField,
  reduceAndMerge,
} from '../../utils/arrangerUtils';
import { executeSearchAfterQuery } from '../../utils/esUtils';
import { normalizeConfigs } from '../../utils/configUtils';

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

export default async (es, res, projectId, sqon, reportConfigs) => {
  // create the Excel Workbook
  const wb = new xl.Workbook();

  // decorated the configs with default values , values from arranger's project, etc...
  const normalizedConfigs = await normalizeConfigs(es, projectId, reportConfigs);

  // generate the report for each sheet
  await Promise.all(
    normalizedConfigs.sheets.map(async sheetConfig => {
      const ws = wb.addWorksheet(sheetConfig.sheetName);

      // prepare the ES query
      const extendedConfig = await getExtendedConfigs(es, projectId, sheetConfig.indexName);
      const searchParams = makeReportQuery(extendedConfig, sqon, sheetConfig);

      // add the header row
      sheetConfig.columns.forEach(addHeaderCellByType(ws, extendedConfig));

      // wrap in an object to avoid closure shenanigans
      // row index is one based, 1 is the header row
      const wrapper = { rowIndex: 2 };
      try {
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
          size: env.ES_PAGESIZE,
        });
      } catch (err) {
        console.error(`Error while fetching the data for sheet "${sheetConfig.sheetName}"`);
        throw err;
      }
    }),
  );

  // finalize the file here and stream it back
  // TODO : REMOVE dependency on `res` : return a readable stream instead
  wb.write('ExcelFile.xlsx', res);
};
