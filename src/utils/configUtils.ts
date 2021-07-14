import { Client } from '@elastic/elasticsearch';

import { getExtendedConfigs } from './arrangerUtils';

import ExtendedReportSheetConfigs from './extendedReportSheetConfigs';
import ExtendedReportConfigs from './extendedReportConfigs';
import { ReportConfig } from '../reports/types';

/**
 * Decorates the raw reports configs with default values, values from arranger's project, etc...
 * @param {object} es - an `elasticsearch.Client` instance
 * @param {string} projectId - the id of the arranger project
 * @param {object} reportConfigs - the raw report configurations
 * @returns {ReportConfigs}
 */
export const normalizeConfigs = async (es: Client, projectId: string, reportConfigs: ReportConfig): Promise<ExtendedReportConfigs> => {
    return Promise.all(
        reportConfigs.sheetConfigs.map(async sheetConfigs => {
            const extendedConfigs = await getExtendedConfigs(es, projectId, reportConfigs.queryConfigs.indexName);
            return new ExtendedReportSheetConfigs(sheetConfigs, extendedConfigs);
        }),
    ).then(sheets => new ExtendedReportConfigs(reportConfigs, sheets));
};

export default normalizeConfigs;
