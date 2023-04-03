import { Client } from '@elastic/elasticsearch';
import { Request, Response } from 'express';

import { ES_HOST, ES_PWD, ES_USER } from '../../env';
import { reportGenerationErrorHandler } from '../../utils/errors';
import getFamilyIds from '../utils/getFamilyIds';
import getFilesFromSqon from '../utils/getFilesFromSqon';

interface IFileByDataType {
    key: string;
    value: string;
    nb_participants: number;
    nb_files: number;
    size: number;
}

const fileManifestStats = () => async (req: Request, res: Response): Promise<void> => {
    console.time('getFileManifestStats');

    const { sqon, projectId, withFamily = false } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    let es = null;
    try {
        es =
            ES_PWD && ES_USER
                ? new Client({ node: ES_HOST, auth: { password: ES_PWD, username: ES_USER } })
                : new Client({ node: ES_HOST });

        const wantedFields = ['file_id', 'data_type', 'file_size', 'participants.participant_id'];
        const files = await getFilesFromSqon(es, projectId, sqon, userId, accessToken, wantedFields);

        const newFiles = withFamily
            ? await getFamilyIds(
                  es,
                  files?.map(f => f.file_id),
              )
            : files;

        /** Join files by data_type */
        const filesInfosData: IFileByDataType[] = [];
        for (const file of newFiles) {
            const filesFound = files.filter(({ data_type }) => data_type === file.data_type);
            if (!filesInfosData.find(f => f.value === file.data_type)) {
                filesInfosData.push({
                    key: file.data_type,
                    value: file.data_type,
                    nb_participants: filesFound.reduce((a, b) => a + (b?.participants?.length || 0), 0),
                    nb_files: filesFound.length,
                    size: filesFound.reduce((a, b) => a + (b?.file_size || 0), 0),
                });
            }
        }

        res.send(filesInfosData);
        es.close();
    } catch (err) {
        reportGenerationErrorHandler(err, es);
    }

    console.timeEnd('getFileManifestStats');
};

export default fileManifestStats;
