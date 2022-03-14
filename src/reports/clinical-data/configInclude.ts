import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const participants: SheetConfig = {
    sheetName: 'Participants',
    root: null,
    columns: [
        { field: 'participant_id' },
        { field: 'external_id' },
        { field: 'family.family_id', header: 'Family ID' },
        { field: 'family_type' },
        { field: 'study.study_name', header: 'Study Name' },
        { field: 'study.study_id', header: 'Study Code' },
        { field: 'sex' },
        { field: 'race' },
        { field: 'ethnicity' },
        { field: 'down_syndrome_status' },
        { field: 'outcomes.vital_status' },
        {
            field: 'outcomes.age_at_event_days.value',
            header: 'Age at the Last Vital Status (Days)',
        },
    ],
    sort: [
        {
            fhir_id: {
                order: 'asc',
            },
        },
        {
            'diagnosis.age_at_event_days': {
                order: 'desc',
            },
        },
    ],
};

const phenotypes: SheetConfig = {
    sheetName: 'Phenotypes',
    root: 'phenotype',
    columns: [
        { field: 'participant_id' },
        { field: 'external_id' },
        {
            field: 'phenotype.hpo_phenotype_observed',
            additionalFields: ['phenotype.hpo_phenotype_not_observed'],
            header: 'Phenotype (HPO)',
            transform: (value, row) => {
                if (!row.phenotype) {
                    return;
                }
                return value || row.phenotype.hpo_phenotype_not_observed;
            },
        },
        {
            field: 'phenotype.hpo_phenotype_observed_text',
            additionalFields: ['phenotype.hpo_phenotype_not_observed_text'],
            header: 'Phenotype (Source Text)',
            transform: (value, row) => {
                if (!row.phenotype) {
                    return;
                }
                return value || row.phenotype.hpo_phenotype_not_observed_text;
            },
        },
        {
            field: 'phenotype.hpo_phenotype_observed',
            header: 'Interpretation',
            transform: (value, row) => (value ? 'Observed' : 'Not Observed'),
        },
        {
            field: 'phenotype.age_at_event_days',
            header: 'Age at Phenotype Assignment (Days)',
        },
    ],
    sort: [{ fhir_id: 'asc' }],
};

const diagnoses: SheetConfig = {
    sheetName: 'Diagnoses',
    root: 'diagnosis',
    columns: [
        { field: 'participant_id' },
        { field: 'external_id' },
        {
            field: 'fhir_id',
            header: 'Diagnosis Type',
            transform: () => 'Clinical',
        },
        { field: 'diagnosis.mondo_id_diagnosis', header: ' Diagnosis (MONDO)' },
        { field: 'diagnosis.ncit_id_diagnosis', header: 'Diagnosis (NCIT)' },
        { field: 'diagnosis.icd_id_diagnosis', header: 'Diagnosis (ICD)' },
        { field: 'diagnosis.source_text', header: 'Diagnosis (Source Text)' },
        {
            field: 'diagnosis.age_at_event_days',
            header: 'Age at Diagnosis (Days)',
        },
        { field: 'diagnosis.source_text_tumor_location' },
    ],
    sort: [{ fhir_id: 'asc' }],
};

const histologicalDiagnoses: SheetConfig = {
    sheetName: 'Histological Diagnoses',
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
    sort: [{ fhir_id: 'asc' }],
};

const familyRelationship: SheetConfig = {
    sheetName: 'Family Relationship',
    root: 'family.family_relations',
    columns: [
        { field: 'participant_id' },
        {
            field: 'family.family_relations',
            header: 'Family Members ID',
            transform: (value, row) => (row.family ? row.family.family_relations.related_participant_id : ''),
        },
        {
            field: 'family.family_relations',
            header: 'Relationship',
            transform: (value, row) => (row.family ? row.family.family_relations.relation : ''),
        },
    ],
    sort: [{ participant_id: 'asc' }],
};

export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'participant_centric',
};

export const sheetConfigs: SheetConfig[] = [
    participants,
    phenotypes,
    diagnoses,
    // histologicalDiagnoses,
    familyRelationship,
];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
