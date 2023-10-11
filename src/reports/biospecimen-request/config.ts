import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const contact: SheetConfig = {
    sheetName: 'Contact Info',
    root: null,
    columns: [
        { field: 'study.study_code', header: 'Study Code' },
        { field: 'study.study_code', header: 'Biobank Contact' },
        { field: 'study.study_code', header: 'Request Weblink' },
    ],
    sort: [
        {
            study_id: {
                order: 'asc',
            },
        },
    ],
};

const queryConfigs: QueryConfig = {
    indexName: 'biospecimen',
    alias: 'biospecimen_centric',
};

const sheetConfigs: SheetConfig[] = [contact];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
