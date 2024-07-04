/* eslint-disable no-console */
import { Request, Response } from 'express';

import EsInstance from '../../ElasticSearchClientInstance';
import { PROJECT } from '../../env';
import { reportGenerationErrorHandler } from '../../errors';
import { ProjectType } from '../types';
import getFamilyIds from '../utils/getFamilyIds';
import getFilesFromSqon from '../utils/getFilesFromSqon';
import configInclude from './configInclude';
import configKf from './configKf';

interface IFileByDataType {
    key: string;
    value: string;
    nb_participants: number;
    nb_files: number;
    size: number;
}

const fileManifestStats = async (req: Request, res: Response): Promise<void> => {
    console.time('getFileManifestStats');

    const { sqon, projectId, withFamily = false } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    let reportConfig;
    const p = PROJECT.toLowerCase().trim();
    if (p === ProjectType.include) {
        reportConfig = configInclude;
    } else {
        reportConfig = configKf;
    }

    const wantedFields = ['file_id', 'data_type', 'size', 'participants.participant_id'];

    const esClient = EsInstance.getInstance();

    try {
        const files = await getFilesFromSqon(
            esClient,
            reportConfig,
            projectId,
            sqon,
            userId,
            accessToken,
            wantedFields,
        );

        const newFiles = withFamily
            ? await getFamilyIds(
                  esClient,
                  files?.map((f) => f.file_id),
              )
            : files;

        /** Join files by data_type */
        const filesInfosData: IFileByDataType[] = [];
        for (const file of newFiles) {
            const filesFound = files.filter(({ data_type }) => data_type === file.data_type);
            if (!filesInfosData.find((f) => f.value === file.data_type)) {
                filesInfosData.push({
                    key: file.data_type,
                    value: file.data_type,
                    nb_participants: filesFound.reduce((a, b) => a + (b?.participants?.length || 0), 0),
                    nb_files: filesFound.length,
                    size: filesFound.reduce((a, b) => a + (b?.size || 0), 0),
                });
            }
        }

        res.send(filesInfosData);
    } catch (err) {
        reportGenerationErrorHandler(err);
    }

    console.timeEnd('getFileManifestStats');
};

export default fileManifestStats;
