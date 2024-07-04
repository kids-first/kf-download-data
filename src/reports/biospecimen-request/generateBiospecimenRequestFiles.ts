import { buildQuery } from '@arranger/middleware';
import { Client } from '@elastic/elasticsearch';
import xl from 'excel4node';
import noop from 'lodash/noop';

import { ES_PAGESIZE } from '../../env';
import { getExtendedConfigs, getNestedFields } from '../../utils/arrangerUtils';
import { executeSearchAfterQuery } from '../../utils/esUtils';
import ExtendedReportConfigs from '../../utils/extendedReportConfigs';
import { Sqon } from '../../utils/setsTypes';
import { resolveSetsInSqon } from '../../utils/sqonUtils';
import { addCellByType, addHeaderCellByType } from '../generateReport';
import { BioRequestConfig, SheetConfig } from '../types';
import generateTxtFile from '../utils/generateTxtFile';
import { addConditionAvailableInSqon } from '../utils/getAvailableBiospecimensFromSqon';

// eslint-disable-next-line max-len
const cbtn_instructions_mock =
    'To request biospecimens from CBTN, please use the request form (https://airtable.com/apperYvVD82ti3021/pagdArwI0TxJQpiVW/form). General inquiries can be directed to research@cbtn.org.';

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
    bioRequestConfig: BioRequestConfig,
): Promise<void> {
    const wb = new xl.Workbook();
    const extendedConfig = await getExtendedConfigs(es, projectId, normalizedConfigs.indexName);
    const workSheets = new Map<string, any>([]);
    const workSheetConfigs = new Map<string, SheetConfig>([]);
    const workSheetWrappers = new Map<string, any>([]);

    const { contact, generateStudyTab, wantedFields } = bioRequestConfig;
    const readmeContents: string[] = [bioRequestConfig.readmeContent];

    // Add Contact sheet in wb
    const wsContact = wb.addWorksheet(contact.sheetName);
    contact.columns.forEach(addHeaderCellByType(wsContact));
    workSheets.set(contact.sheetName, wsContact);
    workSheetConfigs.set(contact.sheetName, contact);
    workSheetWrappers.set(contact.sheetName, { rowIndex: 2 });

    const searchParams = await makeReportQuery(extendedConfig, sqon, wantedFields, userId, accessToken);

    console.time(`biospecimen request search`);
    try {
        await executeSearchAfterQuery(es, normalizedConfigs.alias, searchParams, {
            onPageFetched: (rawChunk) => {
                for (const row of rawChunk) {
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
                            readmeContents.push(`### ${study_code} - ${(row as any).study.study_name}`);
                            readmeContents.push(`${(row as any).study.note}`);

                            // TODO remove this part when instructions will be in FHIR for CBTN.
                        } else if (study_code === 'CBTN') {
                            readmeContents.push(`### ${study_code} - ${(row as any).study.study_name}`);
                            readmeContents.push(cbtn_instructions_mock);
                        }
                    }

                    // Add a line for the biospecimen in its study sheet
                    const currentRowIndex = workSheetWrappers.get(study_code).rowIndex;
                    const cellAppender = addCellByType(workSheets.get(study_code), currentRowIndex, row);
                    workSheetConfigs.get(study_code).columns.forEach(cellAppender);
                    workSheetWrappers.set(study_code, { rowIndex: currentRowIndex + 1 });
                }
            },
            onFinish: noop,
            pageSize: ES_PAGESIZE,
        });
    } catch (err) {
        console.error(`Error while fetching the data for biospecimen request`);
        throw err;
    } finally {
        console.timeEnd(`biospecimen request search`);
    }

    // Writes the file on the server
    console.time(`biospecimen request write files`);
    generateTxtFile(readmeContents.join(`\n\n`), pathFileTxt);
    return new Promise<void>((resolve) => {
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
            {
                biospecimen_id: {
                    order: 'asc',
                },
            },
        ],
    };
};
