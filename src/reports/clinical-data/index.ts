import { Request, Response } from 'express';
import { Client } from '@elastic/elasticsearch';
import generateReport from '../generateReport';
import configKf from './configKf';
import configInclude from './configInclude';
import { normalizeConfigs } from '../../utils/configUtils';
import { reportGenerationErrorHandler } from '../../errors';
import { PROJECT } from '../../env';
import { ProjectType } from '../types';

const clinicalDataReport = (esHost: string) => async (req: Request, res: Response) => {
    console.time('clinical-data');

    const { sqon, projectId, filename = null } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    const reportConfig = PROJECT.toLowerCase().trim() === ProjectType.kidsFirst ? configKf : configInclude;

    let es = null;
    try {
        // prepare the ES client
        es = new Client({ node: esHost });

        // decorate the configs with default values, values from arranger's project, etc...
        const normalizedConfigs = await normalizeConfigs(es, projectId, reportConfig);

        // Generate the report
        await generateReport(es, res, projectId, sqon, filename, normalizedConfigs, userId, accessToken);
        es.close();
    } catch (err) {
        reportGenerationErrorHandler(err, es);
    }

    console.timeEnd('clinical-data');
};

export default clinicalDataReport;
