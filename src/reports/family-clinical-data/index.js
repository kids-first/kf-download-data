import { Client } from '@elastic/elasticsearch';
import generateReport from '../generateReport';
import * as reportConfigs from './config';
import { normalizeConfigs } from '../../utils/configUtils';

import generateFamilySqon from './generateFamilySqon';

const clinicalDataReport = esHost => async (req, res) => {
  console.time('family-clinical-data');

  const { sqon, projectId, filename = null } = req.body;
  console.log('projectId:', projectId);
  console.log('sqon:', JSON.stringify(sqon, null, 2));
  console.log('filename:', filename);

  let es = null;
  try {
    // prepare the ES client
    es = new Client({ node: esHost });

    // decorate the configs with default values, values from arranger's project, etc...
    const normalizedConfigs = await normalizeConfigs(es, projectId, reportConfigs);

    // generate a new sqon containing the id of all family members for the current sqon
    const familySqon = await generateFamilySqon(es, projectId, sqon, normalizedConfigs);

    // Generate the report
    await generateReport(es, res, projectId, familySqon, filename, normalizedConfigs);
    es.close();
  } catch (err) {
    console.error(`Unhandled error while generating the report`, err);
    res.status(500).send(err.message || err.details || 'An unknown error occurred.');
    es && es.close();
  }

  console.timeEnd('family-clinical-data');
};

export default clinicalDataReport;
