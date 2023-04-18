import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const biospecimens: SheetConfig = {
    sheetName: 'Biospecimens',
    root: null,
    columns: [
        { field: 'participant.participant_id', header: 'Participant ID' },
        { field: 'participant.external_id', header: 'External Participant ID' },
        { field: 'external_collection_sample_id', header: 'External Collection Sample ID' },
        { field: 'collection_sample_type', header: 'Collection Sample Type' },
        { field: 'sample_id', header: 'Sample ID' },
        { field: 'external_sample_id', header: 'Sample External ID' },
        { field: 'sample_type', header: 'Sample Type' },
        { field: 'study.study_name', header: 'Study Name' },
        { field: 'study.study_code', header: 'Study Code' },
        { field: 'age_at_biospecimen_collection', header: 'Age at Biospecimen Collection (Days)' },
        //TODO { field: '?', header: 'Age at Histological Diagnosis (Days)'  },
        //TODO { field: '?', header: 'Concentration (mg/mL)'  },
        { field: 'volume_ul', header: 'Volume (uL)' },
        { field: 'files.sequencing_experiment.sequencing_center_id', header: 'Sequencing Center ID' },
        { field: 'consent_type', header: 'Consent Type' },
        //TODO { field: '?', header: 'dbGaP Consent Code'  },
        { field: 'method_of_sample_procurement', header: 'Method of Sample Procurement' },
        { field: 'diagnosis_mondo', header: 'Histological Diagnosis (MONDO)' },
        { field: 'diagnosis_ncit', header: 'Histological Diagnosis (NCIT)' },
        { field: 'source_text', header: 'Histological Diagnosis (Source Text)' },
        { field: 'source_text_tumor_location', header: 'Tumor Location (Source Text)' },
        //TODO { field: '?', header: 'Tumor Descriptor (Source Text)'},
        { field: 'ncit_anatomy_site_id', header: 'Anatomical Site (NCIT)' },
        { field: 'anatomy_site', header: 'Anatomical Site (Source Text)' },
        { field: 'ncit_id_tissue_type', header: 'Tissue Type (NCIT)' },
        { field: 'tissue_type_source_text', header: 'Tissue Type (Source Text)' },
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
