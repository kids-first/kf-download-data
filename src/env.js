// Port of this service
export const PORT = process.env.PORT || 443;

// ElasticSearch host
export const ES_HOST = process.env.ES_HOST || 'kf-arranger-es-prd.kids-first.io:9200';
// ElasticSearch queries parameters
export const ES_PAGESIZE = process.env.ES_PAGESIZE || 1000;

// Ego host
export const EGO_URL = process.env.EGO_URL || 'https://ego.kidsfirstdrc.org';

