import { QueryConfig, ReportConfig } from '../types';
import sheetConfigs from './sheets';
export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'participant_centric',
};

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
