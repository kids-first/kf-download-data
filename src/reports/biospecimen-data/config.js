const biospecimens = {
  sheetName: 'Biospecimens',
  root: 'biospecimens',
  columns: [
    { field: 'biospecimens.kf_id' },
    { field: 'biospecimens.external_sample_id' },
    { field: 'biospecimens.external_aliquot_id' },
    { field: 'kf_id' },
    { field: 'external_id' },
    { field: 'biospecimens.age_at_event_days' },
    { field: 'biospecimens.composition' },
    { field: 'biospecimens.analyte_type' },
    { field: 'biospecimens.concentration_mg_per_ml' },
    { field: 'biospecimens.shipment_date' },
    { field: 'biospecimens.shipment_origin' },
  ],
  sort: [
    // TODO : SORT BY biospecimens.kf_id
    {
      'biospecimens.kf_id': {
        order: 'asc',
      },
    },
    {
      kf_id: {
        order: 'asc',
      },
    },
  ],
};

export const queryConfigs = {
  indexName: 'participant',
  alias: 'participant_centric',
};

export const sheetConfigs = [biospecimens];
