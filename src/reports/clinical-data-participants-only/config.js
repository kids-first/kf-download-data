const participants = {
  sheetName: 'Participants',
  root: null,
  columns: [
    { field: 'kf_id' },
    { field: 'external_id' },
    { field: 'family.father_id' },
    { field: 'family.mother_id' },
    { field: 'family.family_id' },
    { field: 'family.external_id' },
    { field: 'is_proband' },
    { field: 'study.name' },
    { field: 'study.external_id' },
    { field: 'gender' },
    { field: 'race' },
    { field: 'ethnicity' },
    { field: 'phenotype.hpo_phenotype_observed' },
    { field: 'phenotype.hpo_phenotype_not_observed' },
    { field: 'diagnoses.diagnosis' },
    { field: 'diagnoses.external_id' },
    { field: 'diagnoses.age_at_event_days' },
    { field: 'diagnoses.diagnosis_category' },
    { field: 'diagnoses.icd_id_diagnosis' },
    { field: 'diagnoses.mondo_id_diagnosis' },
    { field: 'diagnoses.ncit_id_diagnosis' },
    { field: 'diagnoses.source_text_diagnosis' },
    { field: 'diagnoses.source_text_tumor_location' },
    { field: 'diagnoses.spatial_scriptor' },
    { field: 'diagnoses.uberon_id_tumor_location' },
  ],
  sort: [
    // does not work:
    // see https://www.elastic.co/guide/en/elasticsearch/reference/current/fielddata.html
    {
      family_id: {
        order: 'asc',
      },
    },
    {
      kf_id: {
        order: 'asc',
      },
    },
    {
      'diagnoses.age_at_event_days': {
        order: 'desc',
      },
    },
  ],
};

export const queryConfigs = {
  indexName: 'participant',
  alias: 'participant_centric',
};

export const sheetConfigs = [participants];
