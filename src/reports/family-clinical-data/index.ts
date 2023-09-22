import { Client } from '@elastic/elasticsearch';
import { Request, Response } from 'express';
import generateReport from '../generateReport';
import configKf from './configKf';
import configInclude from './configInclude';
import { normalizeConfigs } from '../../utils/configUtils';

import generateFamilySqon from './generateFamilySqon';
import { reportGenerationErrorHandler } from '../../errors';
import { PROJECT } from '../../env';
import { ProjectType, ReportConfig } from '../types';
import configKfNext from './configKfNext';

const clinicalDataReport = (esHost: string) => async (req: Request, res: Response): Promise<void> => {
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

    let es = null;
    try {
        // prepare the ES client
        es = new Client({ node: esHost });

        // decorate the configs with default values, values from arranger's project, etc...
        const normalizedConfigs = await normalizeConfigs(es, projectId, reportConfig);

        // generate a new sqon containing the id of all family members for the current sqon
        const familySqon = await generateFamilySqon(
            es,
            projectId,
            sqon,
            normalizedConfigs,
            userId,
            accessToken,
            PROJECT,
            isKfNext,
        );

        // Generate the report
        await generateReport(es, res, projectId, familySqon, filename, normalizedConfigs, userId, accessToken);
        es.close();
    } catch (err) {
        reportGenerationErrorHandler(err, es);
    }

    console.timeEnd('family-clinical-data');
};

export default clinicalDataReport;
