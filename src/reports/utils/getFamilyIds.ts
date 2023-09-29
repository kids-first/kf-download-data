import { Client } from '@elastic/elasticsearch';

import { ES_QUERY_MAX_SIZE, esFileIndex } from '../../env';
import { executeSearch } from '../../utils/esUtils';

interface IFileInfo {
    data_type: string;
    families_id: string;
}

/** Get IFileInfo: files data_types and families_id */
const getFilesInfo = async (fileIds: string[], es: Client): Promise<IFileInfo[]> => {
    const esRequest = {
        query: { bool: { must: [{ terms: { file_id: fileIds, boost: 0 } }] } },
        _source: ['file_id', 'data_type', 'participants.families_id'],
        sort: [{ data_type: { order: 'asc' } }],
        size: ES_QUERY_MAX_SIZE,
    };
    const results = await executeSearch(es, esFileIndex, esRequest);
    const hits = results?.body?.hits?.hits || [];
    const sources = hits.map(hit => hit._source);
    const filesInfos = [];
    sources.forEach(source => {
        source.participants.forEach(participant => {
            if (
                participant.families_id &&
                !filesInfos.find(f => f.families_id === participant.families_id && f.data_type === source.data_type)
            ) {
                filesInfos.push({
                    data_type: source.data_type,
                    families_id: participant.families_id || '',
                });
            }
        });
    });
    return filesInfos;
};

/** for each filesInfos iteration, get files from file.participants.families_id and file.data_type */
const getFilesIdsMatched = async (filesInfos: IFileInfo[], es: Client): Promise<string[]> => {
    const filesIdsMatched = [];
    const results = await Promise.all(
        filesInfos.map(info => {
            const esRequest = {
                query: {
                    bool: {
                        must: [
                            { terms: { data_type: [info.data_type], boost: 0 } },
                            {
                                nested: {
                                    path: 'participants',
                                    query: {
                                        bool: { must: [{ match: { 'participants.families_id': info.families_id } }] },
                                    },
                                },
                            },
                        ],
                    },
                },
                _source: ['file_id'],
                size: ES_QUERY_MAX_SIZE,
            };
            return executeSearch(es, esFileIndex, esRequest);
        }),
    );

    for (const res of results) {
        const hits = res?.body?.hits?.hits || [];
        const sources = hits.map(hit => hit._source);
        filesIdsMatched.push(...sources.map(s => s.file_id));
    }

    return filesIdsMatched;
};

/**
 *
 * @param es
 * @param fileIds
 */
const getFamilyIds = async (es: Client, fileIds: string[]): Promise<string[]> => {
    const filesInfos = await getFilesInfo(fileIds, es);
    const filesIdsMatched = await getFilesIdsMatched(filesInfos, es);
    const newFileIds = [...new Set([...fileIds, ...filesIdsMatched])];

    return newFileIds;
};

export default getFamilyIds;
