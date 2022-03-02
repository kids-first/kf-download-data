import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const participants: SheetConfig = {
    sheetName: 'Participants',
    root: null,
    columns: [
        { field: 'fhir_id' },
        { field: 'external_id' },
        { field: 'family.family_id', header: 'Family ID' },
        { field: 'family_type' },
        { field: 'is_proband' },
        { field: 'study.study_name', header: 'Study Name' },
        { field: 'sex' },
        { field: 'race' },
        { field: 'ethnicity' },
        { field: 'karyotype' },
        { field: 'down_syndrome_status' },
        { field: 'outcomes.vital_status' },
        {
            field: 'outcomes.age_at_event_days.value',
            header: 'Age at the Last Vital Status (Days)',
        },
        // { field: 'outcome.disease_related' }, //TODO TBD
        // { field: 'affected_status' }, //TODO TBD
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
        { field: 'fhir_id' },
        { field: 'external_id' },
        { field: 'is_proband' },
        {
            field: 'phenotype.observed',
            additionalFields: ['phenotype.hpo_phenotype_observed', 'phenotype.hpo_phenotype_not_observed'],
            header: 'Phenotype (HPO)',
            transform: (observed, row) => {
                if (!row.phenotype) {
                    return;
                }
                return observed ? row.phenotype.hpo_phenotype_observed : row.phenotype.hpo_phenotype_not_observed;
            },
        },
        {
            field: 'phenotype.observed',
            additionalFields: ['phenotype.hpo_phenotype_observed_text', 'phenotype.hpo_phenotype_not_observed_text'],
            header: 'Phenotype (Source Text)',
            transform: (observed, row) => {
                if (!row.phenotype) {
                    return;
                }
                return observed
                    ? row.phenotype.hpo_phenotype_observed_text
                    : row.phenotype.hpo_phenotype_not_observed_text;
            },
        },
        {
            field: 'phenotype.observed',
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
    root: 'diagnoses',
    columns: [
        { field: 'fhir_id' },
        { field: 'external_id' },
        { field: 'is_proband' },
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
    root: 'biospecimens.diagnoses',
    columns: [
        { field: 'fhir_id' },
        { field: 'external_id' }, //TODO TBD biospecimen fields
        // { field: 'biospecimens.kf_id' },
        // { field: 'biospecimens.external_sample_id' },
        // { field: 'biospecimens.external_aliquot_id' },
        // { field: 'is_proband' },
        // {
        //     // This allows to do a cell with a static value.
        //     // The value will be formatted like the value of `field` would have.
        //     field: 'kf_id',
        //     header: 'Diagnosis Type',
        //     transform: () => 'Histological',
        // },
        // { field: 'biospecimens.diagnoses.diagnosis_category' },
        // { field: 'biospecimens.diagnoses.mondo_id_diagnosis' },
        // { field: 'biospecimens.diagnoses.ncit_id_diagnosis' },
        // { field: 'biospecimens.diagnoses.source_text_diagnosis' },
        // {
        //     field: 'biospecimens.diagnoses.age_at_event_days',
        //     header: 'Age at Diagnosis (Days)',
        // },
        // { field: 'biospecimens.diagnoses.source_text_tumor_location' },
        // { field: 'biospecimens.source_text_anatomical_site' },
        // { field: 'biospecimens.ncit_id_tissue_type' },
        // { field: 'biospecimens.source_text_tissue_type' },
        // { field: 'biospecimens.composition' },
        // { field: 'biospecimens.method_of_sample_procurement' },
        // { field: 'biospecimens.analyte_type' },
    ],
    sort: [
        { fhir_id: 'asc' },
        {
            'biospecimens.diagnoses.age_at_event_days': {
                order: 'desc',
                nested: {
                    path: 'biospecimens',
                    nested: {
                        path: 'biospecimens.diagnoses',
                    },
                },
            },
        },
    ],
};

const familyRelationship: SheetConfig = {
    sheetName: 'Family Relationship',
    root: 'family.family_relations',
    columns: [
        { field: 'fhir_id' },
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
    sort: [{ fhir_id: 'asc' }],
};

export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'participant_centric',
};

export const sheetConfigs: SheetConfig[] = [
    participants,
    phenotypes,
    diagnoses,
    // histologicalDiagnoses, //TODO TBD missing biospecimen
    familyRelationship,
];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
