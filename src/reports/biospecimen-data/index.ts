import { Request, Response } from 'express';
import { Client } from '@elastic/elasticsearch';
import generateReport from '../generateReport';
import reportConfig from './config';
import { normalizeConfigs } from '../../utils/configUtils';
import ExtendedReportConfigs from '../../utils/extendedReportConfigs';
import { reportGenerationErrorHandler } from '../../errors';

const clinicalDataReport = (esHost: string) => async (req: Request, res: Response) => {
    console.time('biospecimen-data');

    const { sqon, projectId, filename = null } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    let es = null;
    try {
        // prepare the ES client
        es = new Client({ node: esHost });

        // decorate the configs with default values, values from arranger's project, etc...
        const normalizedConfigs: ExtendedReportConfigs = await normalizeConfigs(es, projectId, reportConfig);

        // Generate the report
        await generateReport(es, res, projectId, sqon, filename, normalizedConfigs, userId, accessToken);
        es.close();
    } catch (err) {
        reportGenerationErrorHandler(err, es);
    }

    console.timeEnd('biospecimen-data');
};

export default clinicalDataReport;
