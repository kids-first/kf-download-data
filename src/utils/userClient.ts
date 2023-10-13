/* eslint-disable no-console */
import { USERS_API_URL } from '../env';
import getAvailableBiospecimensFromSqon, {
    addConditionAvailableInSqon,
} from '../reports/utils/getAvailableBiospecimensFromSqon';
import { UserApiError } from './userError';
import EsInstance from '../ElasticSearchClientInstance';
import { Sqon } from './setsTypes';

const SET_URI = `${USERS_API_URL}/user-sets`;

export const createSet = async (
    userId: string,
    accessToken: string,
    projectId: string,
    sqon: Sqon,
    biospecimenRequestName: string,
): Promise<void> => {
    console.time('biospecimen request create set');
    const wantedFields = ['sample_id'];
    const esClient = EsInstance.getInstance();
    const ids = (
        await getAvailableBiospecimensFromSqon(esClient, projectId, sqon, userId, accessToken, wantedFields)
    ).map(b => b.sample_id);

    const payload = {
        alias: biospecimenRequestName,
        sharedPublicly: false,
        content: {
            ids,
            riffType: 'set',
            setType: 'biospecimen-request',
            sqon: addConditionAvailableInSqon(sqon),
            sort: [],
            idField: 'sample_id',
        },
    };

    const response = await fetch(encodeURI(SET_URI), {
        method: 'post',
        headers: {
            Authorization: accessToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const body = await response.json();

    console.timeEnd('biospecimen request create set');

    if (response.status >= 300) {
        throw new UserApiError(response.status, body);
    }
};
