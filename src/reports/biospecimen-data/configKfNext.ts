import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const biospecimens: SheetConfig = {
    sheetName: 'Biospecimens',
    root: 'biospecimens',
    columns: [
        { field: 'participant.participant_id' },
        { field: 'sample_id' },
        { field: 'sample_type' },
        { field: 'study.study_name' },
        { field: 'study.study_code' },
        { field: 'age_at_biospecimen_collection' },
        { field: 'volume_ul' },
        { field: 'participant.diagnosis.mondo_id_diagnosis' },
        { field: 'participant.diagnosis.ncit_id_diagnosis' },
    ],
    sort: [
        {
            'participant.participant_id': {
                order: 'asc',
            },
        },
    ],
};

const queryConfigs: QueryConfig = {
    indexName: 'biospecimens',
    alias: 'next_biospecimen_centric',
};

const sheetConfigs: SheetConfig[] = [biospecimens];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
