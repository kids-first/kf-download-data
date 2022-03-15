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
        { field: 'fhir_id' },
        { field: 'external_id' },
        { field: 'families_id' },
        { field: 'is_proband' },
        {
            field: 'phenotype.hpo_phenotype_observed_text',
            header: 'Phenotype (HPO)',
        },
        {
            field: 'phenotype.observed',
            additionalFields: ['phenotype.hpo_phenotype_observed_text', 'phenotype.hpo_phenotype_not_observed_text'],
            header: 'Source Text Phenotype',
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
        { field: 'phenotype.age_at_event_days', header: 'Age at Phenotype Assignment (Days)' },
    ],
    sort: [{ families_id: 'asc' }, { fhir_id: 'asc' }],
};

const diagnoses: SheetConfig = {
    sheetName: 'Diagnoses',
    root: 'diagnoses',
    columns: [
        { field: 'fhir_id' },
        { field: 'external_id' },
        { field: 'families_id' },
        { field: 'is_proband' },
        {
            field: 'fhir_id',
            header: 'Diagnosis Type',
            transform: () => 'Clinical',
        },
        { field: 'diagnoses.mondo_id_diagnosis' },
        { field: 'diagnoses.ncit_id_diagnosis' },
        { field: 'diagnoses.source_text' },
        {
            field: 'diagnoses.age_at_event_days',
            header: 'Age at Diagnosis (Days)',
        },
        { field: 'diagnoses.source_text_tumor_location' },
    ],
    sort: [{ families_id: 'asc' }, { fhir_id: 'asc' }],
};

export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'participant_centric',
};

// export const sheetConfigs: SheetConfig[] = [participants, phenotypes, diagnoses];
export const sheetConfigs: SheetConfig[] = [participants];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
