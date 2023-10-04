/* eslint-disable no-console */
import { Client } from '@elastic/elasticsearch';
import { Request, Response } from 'express';

import { ES_HOST, ES_PWD, ES_USER } from '../../env';
import { reportGenerationErrorHandler } from '../../utils/errors';
import getAvailableBiospecimensFromSqon from '../utils/getAvailableBiospecimensFromSqon';

interface IBiospecimenDataByStudy {
    study_code: string;
    study_name: string;
    nb_participants: number;
    nb_available_samples: number;
    nb_containers: number;
}

const biospecimenRequestStats = () => async (req: Request, res: Response): Promise<void> => {
    console.time('biospecimenRequestStats');

    const { sqon, projectId } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    let es = null;
    try {
        es =
            ES_PWD && ES_USER
                ? new Client({ node: ES_HOST, auth: { password: ES_PWD, username: ES_USER } })
                : new Client({ node: ES_HOST });

        const wantedFields = [
            'sample_id',
            'study.study_code',
            'study.study_name',
            'participant_fhir_id',
            'container_id',
        ];

        const availableBiospecimens = await getAvailableBiospecimensFromSqon(
            es,
            projectId,
            sqon,
            userId,
            accessToken,
            wantedFields,
        );

        /** Join available biospecimens by study_code */
        const biospecimenDatasByStudy: IBiospecimenDataByStudy[] = [];
        for (const biospecimen of availableBiospecimens) {
            const biospecimenForStudy = availableBiospecimens.filter(
                ({ study }) => study.study_code === biospecimen.study.study_code,
            );
            if (!biospecimenDatasByStudy.find(f => f.study_code === biospecimen.study.study_code)) {
                biospecimenDatasByStudy.push({
                    study_code: biospecimen.study.study_code,
                    study_name: biospecimen.study.study_name,
                    nb_participants: new Set(biospecimenForStudy.map(b => b.participant_fhir_id)).size,
                    nb_available_samples: biospecimenForStudy.length,
                    nb_containers: new Set(biospecimenForStudy.map(b => b.container_id).filter(c => c !== undefined))
                        .size,
                });
            }
        }

        res.send(biospecimenDatasByStudy);
        es.close();
    } catch (err) {
        reportGenerationErrorHandler(err, es);
    }

    console.timeEnd('biospecimenRequestStats');
};

export default biospecimenRequestStats;
