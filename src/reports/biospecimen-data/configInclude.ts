import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const biospecimens: SheetConfig = {
    sheetName: 'Biospecimens',
    root: 'biospecimens',
    columns: [
        { field: 'fhir_id' },
        { field: 'external_id' },
        { field: 'files.biospecimens.biospecimen_id', header: 'Biospecimens Biospecimens Id' },
        {
            field: 'files.biospecimens.age_at_biospecimen_collection',
            header: 'Biospecimens Age At Biospecimen Collection',
        },
        { field: 'files.biospecimens.bio_repository', header: 'Biospecimens Bio Repository' },
        { field: 'files.biospecimens.biospecimen_type', header: 'Biospecimens Biospecimen Type' },
        { field: 'files.biospecimens.derived_sample_id', header: 'Biospecimens Derived Sample Id' },
        { field: 'files.biospecimens.derived_sample_type', header: 'Biospecimens Derived Sample Type' },
        { field: 'files.biospecimens.ncit_id_tissue_type', header: 'Biospecimens NCIT Id Tissue Type' },
        { field: 'files.biospecimens.sample_id', header: 'Biospecimens Sample Id' },
        { field: 'files.biospecimens.sample_type', header: 'Biospecimens Sample Type' },
    ],
    sort: [
        {
            'files.biospecimens.biospecimen_id': {
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
