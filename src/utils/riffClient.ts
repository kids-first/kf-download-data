import { RIFF_URL } from '../env';
import { RiffError } from './riffError';
import { Sort, Sqon } from './setsTypes';

export type RiffContent = {
    setType: string;
    riffType: string;
    ids: string[];
    sqon: Sqon;
    sort: Sort[];
    idField: string;
};

export type Riff = {
    id: string;
    uid: string;
    content: RiffContent;
    alias: string;
    sharedPublicly: boolean;
    creationDate: Date;
    updatedDate: Date;
};

export const getRiffs = async (accessToken: string, userId: string): Promise<Riff[]> => {
    const uri = `${RIFF_URL}/riff/user/${userId}`;

    const response = await fetch(encodeURI(uri), {
        method: 'get',
        headers: {
            Authorization: accessToken,
            'Content-Type': 'application/json',
        },
    });

    const body = await response.json();

    if (response.status === 200) {
        return body as Riff[];
    }

    throw new RiffError(response.status, body);
};
