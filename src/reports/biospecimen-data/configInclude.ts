import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const biospecimens: SheetConfig = {
    sheetName: 'Biospecimens',
    root: null,
    columns: [
        { field: 'participant.participant_id', header: 'Participant ID' },
        { field: 'participant.external_id', header: 'External Participant ID' },
        { field: 'collection_sample_id', header: 'Collection ID' },
        { field: 'collection_sample_type', header: 'Collection Sample Type' },
        { field: 'sample_id', header: 'Sample ID' },
        { field: 'container_id', header: 'Container ID' },
        { field: 'external_sample_id', header: 'External Sample ID' },
        { field: 'sample_type', header: 'Sample Type' },
        { field: 'parent_sample_id', header: 'Parent Sample ID' },
        { field: 'parent_sample_type', header: 'Parent Sample Type' },
        { field: 'study.study_id', header: 'Study Code' },
        { field: 'age_at_biospecimen_collection', header: 'Age At Biospecimen Collection (Days)' },
        { field: 'status', header: 'Sample Availability' },
        { field: 'volume_ul', header: 'Volume' },
        { field: 'volume_unit', header: 'Volume Unit' },
        { field: 'laboratory_procedure', header: 'Laboratory Procedure' },
        { field: 'biospecimen_storage', header: 'Biospecimen Storage' },
    ],
    sort: [
        {
            sample_id: {
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
    indexName: 'biospecimen',
    alias: 'biospecimen_centric',
};

const sheetConfigs: SheetConfig[] = [biospecimens];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
