import { buildQuery } from '@arranger/middleware';
import { Client } from '@elastic/elasticsearch';

import { ES_QUERY_MAX_SIZE, esFileAlias, esFileIndex } from '../../env';
import { getExtendedConfigs, getNestedFields } from '../../utils/arrangerUtils';
import { executeSearch } from '../../utils/esUtils';
import { Sqon } from '../../utils/setsTypes';
import { resolveSetsInSqon } from '../../utils/sqonUtils';

/**
 * Generate a sqon from the family_id of all the participants in the given `sqon`.
 * @param {object} es - an `elasticsearch.Client` instance.
 * @param {string} projectId - the id of the arranger project.
 * @param {object} sqon - the sqon used to filter the results.
 * @param {string} userId - the user id.
 * @param {string} accessToken - the user access token.
 * @param {string[]} fieldsWanted - the fields of the files to return.
 * @returns {object} - A sqon of all the `family_id`.
 */
const getFilesFromSqon = async (
    es: Client,
    projectId: string,
    sqon: Sqon,
    userId: string,
    accessToken: string,
    fieldsWanted: string[],
): Promise<any[]> => {
    const extendedConfig = await getExtendedConfigs(es, projectId, esFileAlias);
    const nestedFields = getNestedFields(extendedConfig);
    const newSqon = await resolveSetsInSqon(sqon, userId, accessToken);
    const query = buildQuery({ nestedFields, filters: newSqon });
    const results = await executeSearch(es, esFileIndex, { query, size: ES_QUERY_MAX_SIZE, _source: fieldsWanted });
    const hits = results?.body?.hits?.hits || [];
    const sources = hits.map(hit => hit._source);
    return sources;
};

export default getFilesFromSqon;
