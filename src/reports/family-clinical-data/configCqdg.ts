import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const participants: SheetConfig = {
    sheetName: 'Participants',
    root: null,
    columns: [
        { field: 'participant_id' },
        { field: 'external_id' },
        { field: 'families_id', header: 'Family ID' },
        { field: 'family_type' },
        { field: 'family.father_id', header: 'Father ID' },
        { field: 'family.mother_id', header: 'Mother ID' },
        { field: 'family.family_relations.relation', header: 'Family Relationship' },
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
        { field: 'families_id', header: 'Family ID' },
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
    sort: [{ families_id: 'asc' }, { fhir_id: 'asc' }],
};

const diagnoses: SheetConfig = {
    sheetName: 'Diagnoses',
    root: 'diagnosis',
    columns: [
        { field: 'participant_id' },
        { field: 'external_id' },
        { field: 'families_id', header: 'Family ID' },
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
        { field: 'diagnoses.source_text_tumor_location' },
    ],
    sort: [{ 'families_id': 'asc' }, { participant_id: 'asc' }],
};

export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'participant_centric',
};

export const sheetConfigs: SheetConfig[] = [participants, phenotypes, diagnoses];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
