import { Client } from '@elastic/elasticsearch';
import generateReport from '../generateReport';
import * as reportConfigs from './config';
import { normalizeConfigs } from '../../utils/configUtils';

const clinicalDataParticipantsOnlyReport = esHost => async (req, res) => {
  console.time('clinical-data-participants-only');

  const { sqon, projectId, filename = null } = req.body;
  console.log('projectId:', projectId);
  console.log('sqon:', JSON.stringify(sqon, null, 2));
  console.log('filename:', filename);

  let es = null;
  try {
    // prepare the ES client
    es = new Client({ node: esHost });

    // decorate the configs with default values, values from arranger's project, etc...
    const normalizedConfigs = await normalizeConfigs(
      es,
      projectId,
      reportConfigs
    );

    // Generate the report
    await generateReport(es, res, projectId, sqon, filename, normalizedConfigs);
    es.close();
  } catch (err) {
    console.error(`Unhandled error while generating the report`, err);
    res
      .status(500)
      .send(err.message || err.details || 'An unknown error occurred.');
  } finally {
    if (es) {
      es.close();
    }
  }

  console.timeEnd('clinical-data-participants-only');
};

export default clinicalDataParticipantsOnlyReport;
