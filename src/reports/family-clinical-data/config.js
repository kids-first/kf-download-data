const participants = {
  sheetName: 'Participants',
  root: null,
  columns: [
    { field: 'kf_id' },
    { field: 'external_id' },
    { field: 'family_id' },
    { field: 'is_proband' },
    { field: 'study.short_name' },
    { field: 'family.family_compositions.composition' },
    { field: 'diagnoses.diagnosis_category' },
    { field: 'gender' },
    { field: 'race' },
    { field: 'ethnicity' },
    { field: 'outcome.vital_status' },
    {
      field: 'outcome.age_at_event_days',
      header: 'Age at the Last Vital Status (Days)',
    },
    { field: 'outcome.disease_related' },
    { field: 'affected_status' },
  ],
  sort: [
    // `family.family_id` would not work.
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

const phenotypes = {
  sheetName: 'Phenotypes',
  root: 'phenotype',
  columns: [
    { field: 'kf_id' },
    { field: 'external_id' },
    { field: 'family_id' },
    { field: 'is_proband' },
    {
      field: 'phenotype.hpo_phenotype_observed_text',
      header: 'Phenotype (HPO)',
    },
    {
      field: 'phenotype.observed',
      additionalFields: [
        'phenotype.snomed_phenotype_observed',
        'phenotype.snomed_phenotype_not_observed',
      ],
      header: 'Phenotype (SNOMED)',
      transform: (observed, row) => {
        if (!row.phenotype) {
          return;
        }
        return observed
          ? row.phenotype.snomed_phenotype_observed
          : row.phenotype.snomed_phenotype_not_observed;
      },
    },
    { field: 'phenotype.source_text_phenotype' },
    {
      field: 'phenotype.observed',
      header: 'Interpretation',
      transform: (value, row) => (value ? 'Observed' : 'Not Observed'),
    },
    { field: 'phenotype.age_at_event_days', header: 'Age at Phenotype Assignment (Days)' },
  ],
  sort: [{ family_id: 'asc' }, { kf_id: 'asc' }],
};

const diagnoses = {
  sheetName: 'Diagnoses',
  root: 'diagnoses',
  columns: [
    { field: 'kf_id' },
    { field: 'external_id' },
    { field: 'family_id' },
    { field: 'is_proband' },
    {
      field: 'kf_id',
      header: 'Diagnosis Type',
      transform: () => 'Clinical',
    },
    { field: 'diagnoses.diagnosis_category' },
    { field: 'diagnoses.mondo_id_diagnosis' },
    { field: 'diagnoses.ncit_id_diagnosis' },
    { field: 'diagnoses.source_text_diagnosis' },
    {
      field: 'diagnoses.age_at_event_days',
      header: 'Age at Diagnosis (Days)',
    },
    { field: 'diagnoses.source_text_tumor_location' },
  ],
  sort: [{ family_id: 'asc' }, { kf_id: 'asc' }],
};

export const queryConfigs = {
  indexName: 'participant',
  alias: 'participant_centric',
};

export const sheetConfigs = [participants, phenotypes, diagnoses];
