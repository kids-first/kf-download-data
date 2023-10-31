import { QueryConfig, ReportConfig, SheetConfig } from '../types';

export const contact: SheetConfig = {
    sheetName: 'Contact Info',
    root: null,
    columns: [
        { field: 'study.study_code', header: 'Study Code' },
        { field: 'study.biobank_contact', header: 'Biobank Contact' },
        { field: 'study.biobank_request_link', header: 'Request Weblink' },
    ],
    sort: [
        {
            'study.study_code': {
                order: 'asc',
            },
        },
    ],
};

export const generateStudyTab: (study_code: string) => SheetConfig = study_code =>
    ({
        sheetName: study_code,
        root: null,
        columns: [
            { field: 'external_sample_id', header: 'External Sample ID' },
            { field: 'sample_id', header: 'INCLUDE Sample ID' },
            { field: 'sample_type', header: 'Sample Type' },
            { field: 'external_parent_sample_id', header: 'External Parent Sample ID' },
            { field: 'parent_sample_id', header: 'INCLUDE Parent Sample ID' },
            { field: 'parent_sample_type', header: 'Parent Sample Type' },
            { field: 'external_collection_sample_id', header: 'External Collection ID' },
            { field: 'collection_sample_id', header: 'INCLUDE Collection ID' },
            { field: 'collection_sample_type', header: 'Collection Sample Type' },
            { field: 'external_container_id', header: 'External Container ID' },
            { field: 'container_id', header: 'INCLUDE Container ID' },
            { field: 'participant.external_id', header: 'External Participant ID' },
            { field: 'participant.participant_id', header: 'INCLUDE Participant ID' },
            { field: 'study.study_code', header: 'Study Code' },
            { field: 'participant.down_syndrome_status', header: 'Down Syndrome Status' },
            { field: 'participant.sex', header: 'Sex' },
            { field: 'participant.race', header: 'Race' },
            { field: 'age_at_biospecimen_collection', header: 'Age at Biospecimen Collection (Days)' },
        ],
        sort: [
            {
                sample_id: {
                    order: 'asc',
                },
            },
        ],
    } as SheetConfig);

const queryConfigs: QueryConfig = {
    indexName: 'biospecimen',
    alias: 'biospecimen_centric',
};

export const wantedFields = [
    'external_sample_id',
    'sample_id',
    'sample_type',
    'external_parent_sample_id',
    'parent_sample_id',
    'parent_sample_type',
    'external_collection_sample_id',
    'collection_sample_id',
    'collection_sample_type',
    'container_id',
    'external_container_id',
    'participant.external_id',
    'participant.participant_id',
    'study.study_code',
    'study.biobank_contact',
    'study.biobank_request_link',
    'study.note',
    'participant.down_syndrome_status',
    'participant.sex',
    'participant.race',
    'age_at_biospecimen_collection',
];

const sheetConfigs: SheetConfig[] = [contact];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
