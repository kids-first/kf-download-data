import { Client } from '@elastic/elasticsearch';

import { ReportConfig, SheetConfig } from '../reports/types';
import { getExtendedConfigs } from './arrangerUtils';
import ExtendedReportConfigs from './extendedReportConfigs';
import ExtendedReportSheetConfigs from './extendedReportSheetConfigs';

/**
 * Decorates the raw reports configs with default values, values from arranger's project, etc...
 */
export const normalizeConfigs = async (
    es: Client,
    projectId: string,
    reportConfigs: ReportConfig,
): Promise<ExtendedReportConfigs> => {
    const sheets = await Promise.all(
        reportConfigs.sheetConfigs.map((sc) =>
            normalizeSheetConfig(sc, es, projectId, reportConfigs.queryConfigs.indexName),
        ),
    );
    return new ExtendedReportConfigs(reportConfigs, sheets);
};

const normalizeSheetConfig = async (
    sheetConfigs: SheetConfig,
    es: Client,
    projectId: string,
    indexName: string,
): Promise<ExtendedReportSheetConfigs> => {
    const extendedConfigs = await getExtendedConfigs(es, projectId, indexName);
    return new ExtendedReportSheetConfigs(sheetConfigs, extendedConfigs);
};

export default normalizeConfigs;
