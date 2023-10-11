import { buildQuery } from '@arranger/middleware';
import { Client } from '@elastic/elasticsearch';

import { ES_QUERY_MAX_SIZE, esBiospecimenIndex } from '../../env';
import { getExtendedConfigs, getNestedFields } from '../../utils/arrangerUtils';
import { executeSearch } from '../../utils/esUtils';
import { Sqon } from '../../utils/setsTypes';
import { resolveSetsInSqon } from '../../utils/sqonUtils';

/**
 * Retrieve all available biospecimen from a sqon of a list of biospecimen ids.
 * @param {object} es - an `elasticsearch.Client` instance.
 * @param {string} projectId - the id of the arranger project.
 * @param {object} sqon - the sqon used to filter the results.
 * @param {string} userId - the user id.
 * @param {string} accessToken - the user access token.
 * @param {string[]} fieldsWanted - the fields of the files to return.
 * @returns {object} - A sqon of all the `biospecimen ids`.
 */
const getAvailableBiospecimensFromSqon = async (
    es: Client,
    projectId: string,
    sqon: Sqon,
    userId: string,
    accessToken: string,
    fieldsWanted: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> => {
    const extendedConfig = await getExtendedConfigs(es, projectId, 'biospecimen');
    const nestedFields = getNestedFields(extendedConfig);
    const newSqon = await resolveSetsInSqon(sqon, userId, accessToken);
    const newSqonForAvailableOnly = addConditionAvailableInSqon(newSqon);
    const query = buildQuery({ nestedFields, filters: newSqonForAvailableOnly });
    const results = await executeSearch(es, esBiospecimenIndex, {
        query,
        size: ES_QUERY_MAX_SIZE,
        _source: fieldsWanted,
    });
    const hits = results?.body?.hits?.hits || [];
    const sources = hits.map(hit => hit._source);
    return sources;
};

export const addConditionAvailableInSqon = (sqon: Sqon): Sqon => ({
    ...sqon,
    content: [
        ...sqon.content,
        {
            content: {
                field: 'status',
                index: 'biospecimen',
                value: ['available'],
            },
            op: 'in',
        },
    ],
});

export default getAvailableBiospecimensFromSqon;
