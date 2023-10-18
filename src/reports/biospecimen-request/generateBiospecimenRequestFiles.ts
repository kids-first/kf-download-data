/* eslint-disable no-console */
import { Client } from '@elastic/elasticsearch';
import { buildQuery } from '@arranger/middleware';
import xl from 'excel4node';
import { env } from 'process';
import { getExtendedConfigs, getNestedFields } from '../../utils/arrangerUtils';
import { executeSearchAfterQuery } from '../../utils/esUtils';
import ExtendedReportConfigs from '../../utils/extendedReportConfigs';
import { Sqon } from '../../utils/setsTypes';
import { addCellByType, addHeaderCellByType } from '../generateReport';
import { contact, generateStudyTab, wantedFields } from './config';
import { resolveSetsInSqon } from '../../utils/sqonUtils';
import { SheetConfig } from '../types';
import generateTxtFile from '../utils/generateTxtFile';
import { addConditionAvailableInSqon } from '../utils/getAvailableBiospecimensFromSqon';

/**
 * Generate and write locally.
 */
export default async function generateFiles(
    es: Client,
    projectId: string,
    sqon: Sqon,
    pathFileXlsx: string,
    pathFileTxt: string,
    normalizedConfigs: ExtendedReportConfigs,
    userId: string,
    accessToken: string,
): Promise<void> {
    const wb = new xl.Workbook();
    let readmeContent = '';
    const extendedConfig = await getExtendedConfigs(es, projectId, normalizedConfigs.indexName);
    const workSheets = new Map<string, any>([]);
    const workSheetConfigs = new Map<string, SheetConfig>([]);
    const workSheetWrappers = new Map<string, any>([]);

    // Add Contact sheet in wb
    const wsContact = wb.addWorksheet(contact.sheetName);
    contact.columns.forEach(addHeaderCellByType(wsContact));
    workSheets.set(contact.sheetName, wsContact);
    workSheetConfigs.set(contact.sheetName, contact);
    workSheetWrappers.set(contact.sheetName, { rowIndex: 2 });

    const searchParams = await makeReportQuery(extendedConfig, sqon, wantedFields, userId, accessToken);

    console.time(`biospecimen request search`);
    await executeSearchAfterQuery(es, normalizedConfigs.alias, searchParams, {
        onPageFetched: rawChunk => {
            rawChunk.forEach(row => {
                const study_code = (row as any).study.study_code;
                if (!workSheets.has(study_code)) {
                    // Add study sheet in wb
                    const newSheetConfig = generateStudyTab(study_code);
                    const newSheet = wb.addWorksheet(newSheetConfig.sheetName);
                    newSheetConfig.columns.forEach(addHeaderCellByType(newSheet));
                    workSheets.set(study_code, newSheet);
                    workSheetConfigs.set(study_code, newSheetConfig);
                    workSheetWrappers.set(study_code, { rowIndex: 2 });

                    // Add a line for the study in Contact sheet
                    const currentRowIndex = workSheetWrappers.get(contact.sheetName).rowIndex;
                    const cellAppender = addCellByType(wsContact, currentRowIndex, row);
                    workSheetConfigs.get(contact.sheetName).columns.forEach(cellAppender);
                    workSheetWrappers.set(contact.sheetName, { rowIndex: currentRowIndex + 1 });

                    // Add biorepository request note to README content for the study
                    if ((row as any).study.note) {
                        readmeContent += `\n${(row as any).study.note}`;
                    }
                }

                // Add a line for the biospecimen in its study sheet
                const currentRowIndex = workSheetWrappers.get(study_code).rowIndex;
                const cellAppender = addCellByType(workSheets.get(study_code), currentRowIndex, row);
                workSheetConfigs.get(study_code).columns.forEach(cellAppender);
                workSheetWrappers.set(study_code, { rowIndex: currentRowIndex + 1 });
            });
        },
        onFinish: () => {
            // DO NOTHING
        },
        pageSize: Number(env.ES_PAGESIZE),
    });
    console.timeEnd(`biospecimen request search`);

    // Writes the file on the server
    console.time(`biospecimen request write files`);
    generateTxtFile(readmeContent, pathFileTxt);
    return new Promise(resolve => {
        wb.write(pathFileXlsx, () => {
            console.timeEnd(`biospecimen request write files`);
            resolve();
        });
    });
}

const makeReportQuery = async (
    extendedConfig: any,
    sqon: Sqon,
    wantedFields: string[],
    userId: string,
    accessToken: string,
) => {
    const nestedFields = getNestedFields(extendedConfig);
    const newSqon = await resolveSetsInSqon(sqon, userId, accessToken);
    const newSqonForAvailableOnly = addConditionAvailableInSqon(newSqon);
    const query = buildQuery({ nestedFields, filters: newSqonForAvailableOnly });

    return {
        query,
        _source: wantedFields,
        sort: [
            {
                'study.study_code': {
                    order: 'asc',
                },
            },
        ],
    };
};
