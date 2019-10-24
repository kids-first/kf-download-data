import elasticsearch from 'elasticsearch';
import generateReport from '../generateReport';

const clinicalDataReport = (esHost, reportConfigs) => async (req, res) => {
  console.time('clinical-data');

  const { sqon, projectId, filename = null } = req.body;
  console.log('projectId:', projectId);
  console.log('sqon:', JSON.stringify(sqon, null, 2));
  console.log('filename:', filename);

  let es = null;
  try {
    // prepare the ES client
    es = new elasticsearch.Client({ host: esHost });
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
