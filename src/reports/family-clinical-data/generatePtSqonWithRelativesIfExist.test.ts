import {
    extractFieldAggregationIds,
    mergeParticipantsWithoutDuplicates,
    xIsSubsetOfY,
} from './generatePtSqonWithRelativesIfExist';

describe('Sqon generator for selected participants and their relatives', () => {
    test('checks if X is a subset of Y', () => {
        //
        const x = ['p1', 'p2'];
        const y = ['p1', 'p2', 'p4'];
        expect(xIsSubsetOfY(x, y)).toBeTruthy();
    });
    test('merges participants adequately', () => {
        const x = ['p1', 'p2', 'p3'];
        const y = ['p2', 'p3', 'p4'];
        expect(mergeParticipantsWithoutDuplicates(x, y).every(p => ['p1', 'p2', 'p3', 'p4'].includes(p))).toBeTruthy();
    });
    test('extracts correctly all participants from initial ES response', async () => {
        const query = {
            bool: {
                must: [
                    {
                        terms: {
                            down_syndrome_status: ['T21'],
                            boost: 0,
                        },
                    },
                ],
            },
        };
        const searchExecutor = async (_: object) =>
            Promise.resolve({
                query: _,
                body: {
                    aggregations: {
                        ids: {
                            buckets: [
                                { key: 'p1', count: 1 },
                                { key: 'p2', count: 1 },
                                { key: 'p2', count: 1 },
                            ],
                        },
                    },
                },
            });
        const ps = await extractFieldAggregationIds(query, 'participant_id', searchExecutor);
        expect(ps).toEqual(['p1', 'p2']);
    });
});
