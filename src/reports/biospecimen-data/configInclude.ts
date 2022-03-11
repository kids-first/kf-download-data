import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const biospecimens: SheetConfig = {
    sheetName: 'Biospecimens',
    root: 'files.biospecimens',
    columns: [
        { field: 'participant_id', header: 'Participant ID' },
        { field: 'files.biospecimens.collection_sample_id', header: 'Collection ID' },
        { field: 'files.biospecimens.collection_sample_type', header: 'Collection Sample Type' },
        { field: 'files.biospecimens.sample_id', header: 'Sample Id' },
        { field: 'files.biospecimens.container_id', header: 'Container Id' },
        { field: 'files.biospecimens.sample_type', header: 'Sample Type' },
        { field: 'files.biospecimens.parent_sample_id', header: 'Parent Sample Id' },
        { field: 'files.biospecimens.parent_sample_type', header: 'Parent Sample Type' },
        { field: 'study.study_code', header: 'Study Code' },
        { field: 'files.biospecimens.age_at_biospecimen_collection', header: 'Age At Biospecimen Collection (Days)' },
        { field: 'files.biospecimens.status', header: 'Sample Availability' },
        { field: 'files.biospecimens.volume_ul', header: 'Volume' },
        { field: 'files.biospecimens.volume_unit', header: 'Volume Unit' },
        { field: 'files.biospecimens.laboratory_procedure', header: 'Laboratory Procedure' },
        { field: 'files.biospecimens.biospecimen_storage', header: 'Biospecimen Storage' },
    ],
    sort: [
        {
            'files.biospecimens.sample_id': {
                order: 'asc',
            },
        },
        {
            fhir_id: {
                order: 'asc',
            },
        },
    ],
};

const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'participant_centric',
};

const sheetConfigs: SheetConfig[] = [biospecimens];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
