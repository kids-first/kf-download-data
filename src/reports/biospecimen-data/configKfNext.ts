import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const biospecimens: SheetConfig = {
    sheetName: 'Biospecimens',
    root: null,
    columns: [
        { field: 'participant.participant_id', header: 'Participant ID' },
        { field: 'participant.external_id', header: 'External Participant ID' },
        { field: 'collection_sample_id', header: 'Collection ID' },
        { field: 'external_collection_sample_id', header: 'External Collection ID' },
        { field: 'collection_sample_type', header: 'Collection Sample Type' },
        { field: 'sample_id', header: 'Sample ID' },
        { field: 'external_sample_id', header: 'External Sample ID' },
        { field: 'sample_type', header: 'Sample Type' },
        { field: 'parent_sample_id', header: 'Parent Sample ID' },
        { field: 'parent_sample_type', header: 'Parent Sample Type' },
        { field: 'study.study_code', header: 'Study Code' },
        { field: 'age_at_biospecimen_collection', header: 'Age at Biospecimen Collection (Days)' },
        { field: 'status', header: 'Sample Availability' },
        { field: 'volume', header: 'Volume' },
        { field: 'volume_unit', header: 'Volume Unit' },
        { field: 'method_of_sample_procurement', header: 'Method of Sample Procurement' },
        { field: 'mondo_code', header: 'Histological Diagnosis (MONDO)' },
        { field: 'ncit_code', header: 'Histological Diagnosis (NCIT)' },
        { field: 'source_text', header: 'Histological Diagnosis (Source Text)' },
        { field: 'source_text_tumor_location', header: 'Tumor Location (Source Text)' },
        //FIXME { field: '', header: 'Tumor Descriptor (Source Text)' },
        { field: 'ncit_anatomy_site_id', header: 'Anatomical Site (NCIT)' },
        { field: 'anatomy_site', header: 'Anatomical Site (Source Text)' },
        { field: 'ncit_id_tissue_type', header: 'Tissue Type (NCIT)' },
        { field: 'tissue_type_source_text', header: 'Tissue Type (Source Text)' },
        { field: 'consent_type', header: 'Consent Type' },
        { field: 'dbgap_consent_code', header: 'dbGaP Consent Code' },
        { field: 'files.sequencing_experiment.sequencing_center_id', header: 'Sequencing Center ID' },
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
    indexName: 'biospecimen',
    alias: 'next_biospecimen_centric',
};

const sheetConfigs: SheetConfig[] = [biospecimens];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
