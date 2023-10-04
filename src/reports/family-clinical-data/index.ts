/* eslint-disable no-console */
import { Request, Response } from 'express';
import EsInstance from '../../ElasticSearchClientInstance';
import generateReport from '../generateReport';
import configKf from './configKf';
import configInclude from './configInclude';
import { normalizeConfigs } from '../../utils/configUtils';

import generateFamilySqon from './generateFamilySqon';
import { reportGenerationErrorHandler } from '../../errors';
import { PROJECT } from '../../env';
import { ProjectType, ReportConfig } from '../types';
import configKfNext from './configKfNext';

const clinicalDataReport = () => async (req: Request, res: Response): Promise<void> => {
    console.time('family-clinical-data');

    const { sqon, projectId, filename = null, isKfNext = false } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    const p = PROJECT.toLowerCase().trim();
    let reportConfig: ReportConfig;
    if (isKfNext) {
        reportConfig = configKfNext;
    } else if (p === ProjectType.include) {
        reportConfig = configInclude;
    } else if (p === ProjectType.kidsFirst) {
        reportConfig = configKf;
    } else {
        console.warn('No reportConfig found.');
    }

    let esClient = null;
    try {
        // prepare the ES client
        esClient = EsInstance.getInstance();

        // decorate the configs with default values, values from arranger's project, etc...
        const normalizedConfigs = await normalizeConfigs(esClient, projectId, reportConfig);

        // generate a new sqon containing the id of all family members for the current sqon
        const familySqon = await generateFamilySqon(
            esClient,
            projectId,
            sqon,
            normalizedConfigs,
            userId,
            accessToken,
            PROJECT,
            isKfNext,
        );

        // Generate the report
        await generateReport(esClient, res, projectId, familySqon, filename, normalizedConfigs, userId, accessToken);
    } catch (err) {
        reportGenerationErrorHandler(err, esClient);
    }

    console.timeEnd('family-clinical-data');
};

export default clinicalDataReport;
