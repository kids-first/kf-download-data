import { buildQuery } from '@arranger/middleware';

import { getExtendedConfigs, getNestedFields } from '../../utils/arrangerUtils';
import { executeSearch } from '../../utils/esUtils';
import { Client } from '@elastic/elasticsearch';
import { resolveSetsInSqon } from '../../utils/sqonUtils';

import { Sqon } from '../../utils/setsTypes';
import { ES_QUERY_MAX_SIZE } from '../../env';

type Bucket = { key: string; count: number };
type AggregationIdsRequest = {
    [index: string]: any;
    query: object;
    body: {
        aggregations: {
            ids: {
                buckets: Bucket[];
            };
        };
    };
};
export const extractFieldAggregationIds = async (
    query: object,
    field: string,
    searchExecutor: (q: object) => Promise<AggregationIdsRequest>,
): Promise<string[]> => {
    const r = await searchExecutor({
        query,
        aggs: {
            ids: {
                terms: { field: field, size: ES_QUERY_MAX_SIZE },
            },
        },
    });
    const rawIds: string[] = (r.body?.aggregations?.ids?.buckets || []).map((bucket: Bucket) => bucket.key);
    return [...new Set(rawIds)];
};

export const mergeParticipantsWithoutDuplicates = (x: string[], y: string[]) => [...new Set([...x, ...y])];

// extract in a more general file when and if needed.
export const xIsSubsetOfY = (x: string[], y: string[]) => x.every((e: string) => y.includes(e));
/**
 * Generate a sqon from the family_id of all the participants in the given `sqon`.
 * @param {object} es - an `elasticsearch.Client` instance.
 * @param {string} projectId - the id of the arranger project.
 * @param {object} sqon - the sqon used to filter the results.
 * @param {object} normalizedConfigs - the normalized report configuration.
 * @param {string} userId - the user id.
 * @param {string} accessToken - the user access token.
 * @returns {object} - A sqon of all the `family_id`.
 */
const generatePtSqonWithRelativesIfExist = async (
    es: Client,
    projectId: string,
    sqon: Sqon,
    normalizedConfigs: { indexName: string; alias: string; [index: string]: any },
    userId: string,
    accessToken: string,
): Promise<Sqon> => {
    const extendedConfig = await getExtendedConfigs(es, projectId, normalizedConfigs.indexName);
    const nestedFields = getNestedFields(extendedConfig);
    const newSqon = await resolveSetsInSqon(sqon, userId, accessToken);

    const query = buildQuery({ nestedFields, filters: newSqon });
    const searchExecutor = async (q: object) => await executeSearch(es, normalizedConfigs.alias, q);

    const allSelectedParticipantsIds: string[] = await extractFieldAggregationIds(
        query,
        'participant_id',
        searchExecutor,
    );
    const allFamiliesIdsOfSelectedParticipants: string[] = await extractFieldAggregationIds(
        {
            bool: {
                must: [
                    {
                        terms: {
                            participant_id: allSelectedParticipantsIds,
                        },
                    },
                ],
            },
        },
        'families_id',
        searchExecutor,
    );
    const allRelativesIds: string[] = await extractFieldAggregationIds(
        {
            bool: {
                must: [
                    {
                        terms: {
                            families_id: allFamiliesIdsOfSelectedParticipants,
                        },
                    },
                ],
            },
        },
        'participant_id',
        searchExecutor,
    );
    const selectedParticipantsIdsPlusRelatives = mergeParticipantsWithoutDuplicates(
        allSelectedParticipantsIds,
        allRelativesIds,
    );

    console.assert(
        selectedParticipantsIdsPlusRelatives.length >= allSelectedParticipantsIds.length &&
            xIsSubsetOfY(allSelectedParticipantsIds, selectedParticipantsIdsPlusRelatives),
        `Family Report (sqon enhancer): The participants ids computed must be equal or greater than the selected participants.
         Moreover, selected participants must a subset of the computed ids.`,
    );

    return {
        op: 'and',
        content: [
            {
                op: 'in',
                content: {
                    field: 'participant_id',
                    value: selectedParticipantsIdsPlusRelatives,
                },
            },
        ],
    };
};

export default generatePtSqonWithRelativesIfExist;
