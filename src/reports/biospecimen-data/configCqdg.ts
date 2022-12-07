import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const biospecimens: SheetConfig = {
    sheetName: 'Biospecimens',
    root: 'files.biospecimens',
    columns: [
        { field: 'participant_id' },
        { field: 'submitter_participant_id' },
        { field: 'study.name' },
        //TODO study CODE
        { field: 'files.biospecimens.sample_id' },
        { field: 'files.biospecimens.submitter_sample_id' },
        { field: 'files.biospecimens.sample_type' },
        { field: 'files.biospecimens.fhir_id', header: 'Biospecimen ID' },
        { field: 'files.biospecimens.submitter_biospecimen_id' },
        { field: 'files.biospecimens.biospecimen_tissue_source' },
        {
            field: 'files.biospecimens.age_biospecimen_collection.value',
            header: 'Age at Biospecimen Collection (days)',
        },
    ],
    sort: [],
};

const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'participant_centric',
};

const sheetConfigs: SheetConfig[] = [biospecimens];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
