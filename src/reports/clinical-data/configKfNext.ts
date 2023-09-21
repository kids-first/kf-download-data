import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const participants: SheetConfig = {
    sheetName: 'Participants',
    root: null,
    columns: [
        { field: 'participant_id', header: 'Participant ID' },
        { field: 'external_id', header: 'External Participant ID' },
        { field: 'families_id', header: 'Family ID' },
        //TODO { field: '?', header: 'External Family ID' },
        { field: 'is_proband', header: 'Proband' },
        { field: 'study.study_name', header: 'Study Name' },
        { field: 'study.study_code', header: 'Study Code' },
        { field: 'family_type', header: 'Family Composition' },
        //TODO { field: '?', header: 'Diagnosis Category' },
        { field: 'sex', header: 'Sex' },
        { field: 'race', header: 'Race' },
        { field: 'ethnicity', header: 'Ethnicity' },
        { field: 'outcomes.vital_status', header: 'Vital Status' },
        //TODO { field: '?', header: 'Age at Last Vital Status (Days)' },
        { field: 'diagnosis.affected_status_text', header: 'Affected Status' },
    ],
    sort: [
        {
            participant_id: {
                order: 'asc',
            },
        },
    ],
};

const phenotypes: SheetConfig = {
    sheetName: 'Phenotypes',
    root: 'phenotype',
    columns: [
        { field: 'participant_id', header: 'Participant ID' },
        { field: 'external_id', header: 'External Participant ID' },
        { field: 'families_id', header: 'Family ID' },
        //TODO { field: '?', header: 'External Family ID'  },
        { field: 'is_proband', header: 'Proband' },
        {
            field: 'phenotype.is_observed',
            additionalFields: ['phenotype.hpo_phenotype_observed', 'phenotype.hpo_phenotype_not_observed'],
            header: 'Phenotype (HPO)',
            transform: (
                isObserved: boolean,
                row: { phenotype: { hpo_phenotype_observed: string; hpo_phenotype_not_observed: string } },
            ) => {
                if (!row.phenotype) {
                    return;
                }
                return isObserved ? row.phenotype.hpo_phenotype_observed : row.phenotype.hpo_phenotype_not_observed;
            },
        },
        { field: 'phenotype.source_text', header: 'Phenotype (Source Text)' },
        {
            field: 'phenotype.is_observed',
            header: 'Interpretation',
            transform: (value: boolean) => (value ? 'Observed' : 'Not Observed'),
        },
        { field: 'phenotype.age_at_event_days', header: 'Age at Phenotype Assignment (Days)' },
    ],
    sort: [{ participant_id: 'asc' }],
};

const diagnoses: SheetConfig = {
    sheetName: 'Diagnoses',
    root: 'diagnosis',
    columns: [
        { field: 'participant_id', header: 'Participant ID' },
        { field: 'external_id', header: 'External Participant ID' },
        { field: 'families_id', header: 'Family ID' },
        { field: 'is_proband', header: 'Proband' },
        //TODO { field: '?', header: 'Diagnosis Category' },

        { field: 'diagnosis.mondo_display_term', header: 'Diagnosis (MONDO)' },

        {
            field: 'diagnosis.ncit_display_term',
            additionalFields: ['diagnosis.ncit_code'],
            header: 'Diagnosis (NCIT)',
            transform: (displayTerm: string, row: { diagnosis: { ncit_code: string } }) => displayTerm || row?.diagnosis?.ncit_code || '',
        },

        { field: 'diagnosis.source_text', header: 'Diagnosis (Source Text)' },
        { field: 'diagnosis.age_at_event_days', header: 'Age at Diagnosis (Days)' },
        { field: 'diagnosis.source_text_tumor_location', header: 'Tumor Location (Source Text)' },
    ],
    sort: [{ participant_id: 'asc' }],
};

const familyRelationship: SheetConfig = {
    sheetName: 'Family Relationship',
    root: 'family.relations_to_proband',
    columns: [
        {
            field: 'family.relations_to_proband.participant_id',
            header: 'Participant ID',
            additionalFields: ['participant_id'],
            transform: (value: string, row: { participant_id: string }) => value ?? row.participant_id,
        },
        {
            field: 'family.family_id',
            header: 'Family ID',
        },
        {
            field: 'family.relations_to_proband.role',
            header: 'Family Role',
        },
    ],
    sort: [{ participant_id: 'asc' }],
};

export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'next_participant_centric',
};

export const sheetConfigs: SheetConfig[] = [participants, phenotypes, diagnoses, familyRelationship];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
