import { QueryConfig, ReportConfig, SheetConfig } from '../types';

const participants: SheetConfig = {
    sheetName: 'Participants',
    root: null,
    columns: [
        { field: 'participant_id' },
        { field: 'external_id' },
        { field: 'family.family_id' },
        { field: 'is_proband' },
        { field: 'study.study_name' },
        { field: 'study.study_code' },
        { field: 'sex' },
        { field: 'race' },
        { field: 'ethnicity' },
        { field: 'diagnosis.affected_status_text' },
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
        { field: 'participant_id' },
        { field: 'external_id' },
        { field: 'family.family_id' },
        { field: 'is_proband' },
    ],
    sort: [{ participant_id: 'asc' }],
};

const diagnoses: SheetConfig = {
    sheetName: 'Diagnoses',
    root: 'diagnoses',
    columns: [
        { field: 'participant_id' },
        { field: 'external_id' },
        { field: 'family.family_id' },

        { field: 'is_proband' },
    ],
    sort: [{ participant_id: 'asc' }],
};

const familyRelationship: SheetConfig = {
    sheetName: 'Family Relationship',
    root: 'family.family_compositions.family_members',
    columns: [{ field: 'participant_id' }],
    sort: [{ participant_id: 'asc' }],
};

export const queryConfigs: QueryConfig = {
    indexName: 'participant',
    alias: 'next_participant_centric',
};

export const sheetConfigs: SheetConfig[] = [participants, phenotypes, diagnoses, familyRelationship];

const reportConfig: ReportConfig = { queryConfigs, sheetConfigs };

export default reportConfig;
