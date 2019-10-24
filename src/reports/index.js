import express from 'express';
import bodyParser from 'body-parser';

import clinicalDataReport from './clinical-data';
import * as clinicalDataReportConfigs from './clinical-data/config';

export default esHost => {
  const router = express.Router();
  // parse the body of the request as a json object or value
  router.use(bodyParser.json({ limit: '10mb' }));

  // declare a route for each report
  router.use('/clinical-data', clinicalDataReport(esHost, clinicalDataReportConfigs));
  return router;
};
