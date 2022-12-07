import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const participants: SheetConfig = {
    sheetName: 'Participants',
    root: null,
    columns: [
        { field: 'participant_id' },
        { field: 'submitter_participant_id' },
        { field: 'familyRelationships.family_id', header: 'Family ID' },
        // FIXME Submitter Family ID????
        // { field: 'familyRelationships.submitter_participant_id', header: 'Submitter Participant ID' },
        { field: 'familyRelationships.relationship_to_proband', header: 'Relationship to Proband' },
        { field: 'study.name', header: 'Study Name' },
        // FIXME Study Code missing...
        { field: 'study.code', header: 'Study Name' },
        { field: 'familyRelationships.family_type', header: 'Family Type' },
        { field: 'gender' },
        // FIXME missing race
        { field: 'ethnicity' },
        // FIXME vital_status is boolean, should be changed to string?
        { field: 'vital_status' },
        // FIXME affected_status is missing for now
        { field: 'age_at_recruitment' },
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
    root: null,
    columns: [
        { field: 'participant_id' },
        { field: 'submitter_participant_id' },
        { field: 'familyRelationships.family_id', header: 'Family ID' },
        // FIXME Submitter Family ID????
        // { field: 'familyRelationships.submitter_participant_id', header: 'Submitter Participant ID' },
        { field: 'familyRelationships.relationship_to_proband', header: 'Relationship to Proband' },
        {
            field: 'observed_phenotype_tagged.name',
            additionalFields: ['non_observed_phenotype_tagged.name'],
            header: 'Phenotype (HPO)',
            transform: (value, row) => {
                if (!row || (!row.observed_phenotype_tagged?.name && !row.non_observed_phenotype_tagged?.name)) {
                    return;
                }
                return value || row.non_observed_phenotype_tagged.name;
            },
        },
        {
            field: 'observed_phenotype_tagged.source_text',
            additionalFields: ['non_observed_phenotype_tagged.source_text'],
            header: 'Phenotype (Source Text)',
            transform: (value, row) => {
                if (
                    !row ||
                    (!row.observed_phenotype_tagged?.source_text && !row.non_observed_phenotype_tagged?.source_text)
                ) {
                    return;
                }
                return value || row.non_observed_phenotype_tagged.name;
            },
        },
        {
            field: 'observed_phenotype_tagged',
            header: 'Interpretation',
            transform: (value, row) => (value ? 'Observed' : 'Not Observed'),
        },
        {
            field: 'observed_phenotype_tagged.age_at_event',
            header: 'Age at Phenotype (days)',
        },
    ],
    sort: [],
};

const diagnoses: SheetConfig = {
    sheetName: 'Diagnoses',
    root: 'mondo_tagged',
    columns: [
        { field: 'participant_id' },
        { field: 'submitter_participant_id' },
        { field: 'familyRelationships.family_id', header: 'Family ID' },
        // FIXME Submitter Family ID????
        { field: 'familyRelationships.submitter_participant_id', header: 'Submitter Participant ID' },
        { field: 'familyRelationships.relationship_to_proband', header: 'Relationship to Proband' },
        { field: 'mondo_tagged.name', header: 'Diagnosis (MONDO)' },
        { field: 'icd_tagged.name', header: 'Diagnosis (ICD)' },
        { field: 'diagnosis_source_text', header: 'Diagnosis (Source Text)' },
        { field: 'age_at_diagnosis', header: 'Age at Diagnosis (days)' },
    ],
    sort: [],
};

const familyRelationship: SheetConfig = {
    sheetName: 'Family Relationship',
    root: 'familyRelationships',
    columns: [
        { field: 'participant_id' },
        { field: 'submitter_participant_id' },
        { field: 'familyRelationships.family_id', header: 'Family ID' },
        // FIXME Submitter Family ID????
        { field: 'familyRelationships.submitter_participant_id', header: 'Submitter Participant ID' },
        { field: 'familyRelationships.relationship_to_proband', header: 'Relationship to Proband' },
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
