import { Client } from '@elastic/elasticsearch';
import generateReport from '../generateReport';
import * as reportConfigs from './config';

const clinicalDataReport = esHost => async (req, res) => {
  console.time('clinical-data');

  const { sqon, projectId, filename = null } = req.body;
  console.log('projectId:', projectId);
  console.log('sqon:', JSON.stringify(sqon, null, 2));
  console.log('filename:', filename);

  let es = null;
  try {
    // prepare the ES client
    es = new Client({ node: esHost });
    // Generate the report
    await generateReport(es, res, projectId, sqon, filename, reportConfigs);
    es.close();
  } catch (err) {
    console.error(`Unhandled error while generating the report`, err);
    res.status(500).send(err.message || err.details || 'An unknown error occurred.');
    es && es.close();
  }

  console.timeEnd('clinical-data');
};

export default clinicalDataReport;
