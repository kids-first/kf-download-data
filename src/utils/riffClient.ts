import fetch from 'node-fetch';

import { RIFF_URL } from '../env';
import { Sqon, Sort } from './setsTypes';
import { RiffError } from './riffError';

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
        return body;
    }

    throw new RiffError(response.status, body);
};
