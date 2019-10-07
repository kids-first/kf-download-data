import elasticsearch from 'elasticsearch';
import generateReport from './generateReport';

const clinicalDataReport = (esHost, reportConfigs) => async (req, res) => {
  console.time('download-data');

  const { sqon, projectId } = req.body;
  console.log('projectId:', projectId);
  console.log('sqon:', JSON.stringify(sqon, null, 2));

  try {
    // prepare the ES client
    const es = new elasticsearch.Client({ host: esHost });

    // Generate the report
    await generateReport(es, res, projectId, sqon, reportConfigs);
  } catch (err) {
    console.error(`[Clinical Data Report] - err.message`, err);
    res.status(400).send(err.message || err.details || 'An unknown error occurred.');
  }

  console.timeEnd('download-data');
};

export default clinicalDataReport;
