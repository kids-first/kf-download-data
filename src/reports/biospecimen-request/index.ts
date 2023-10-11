/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';

import EsInstance from '../../ElasticSearchClientInstance';
import { reportGenerationErrorHandler } from '../../errors';
import config from './config';
import { normalizeConfigs } from '../../utils/configUtils';
import generateReport from '../generateReport';
import ExtendedReportConfigs from '../../utils/extendedReportConfigs';
import { createSet } from '../../utils/userClient';

const biospecimenRequest = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    console.time('biospecimenRequest');

    const { sqon, projectId, biospecimenRequestName } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    const esClient = EsInstance.getInstance();

    try {
        await createSet(userId, accessToken, projectId, sqon, biospecimenRequestName);

        // decorate the configs with default values, values from arranger's project, etc...
        const normalizedConfigs: ExtendedReportConfigs = await normalizeConfigs(esClient, projectId, config);

        const filename = 'include_biospecimenRequest_' + new Date().toISOString();

        // Generate the report
        await generateReport(esClient, res, projectId, sqon, filename, normalizedConfigs, userId, accessToken);
    } catch (err) {
        reportGenerationErrorHandler(err, esClient);
    } finally {
        console.timeEnd('biospecimenRequest');
    }
};

export default biospecimenRequest;
