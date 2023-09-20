import { QueryConfig, ReportConfig } from '../types';
import sheetConfigs from './sheets';

export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'next_participant_centric',
};

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
