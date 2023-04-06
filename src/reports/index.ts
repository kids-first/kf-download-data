import express from 'express';

import clinicalDataReport from './clinical-data';
import familyClinicalDataReport from './family-clinical-data';
import biospecimenDataReport from './biospecimen-data';
import fileManifestStats from './file-manifest/fileManifestStats';
import fileManifestReport from './file-manifest';

export default (esHost: string) => {
  const router = express.Router();

  // declare a route for each report
  router.use('/clinical-data', clinicalDataReport(esHost));
  router.use('/family-clinical-data', familyClinicalDataReport(esHost));
  router.use('/biospecimen-data', biospecimenDataReport(esHost));
  router.use('/file-manifest/stats', fileManifestStats());
  router.use('/file-manifest', fileManifestReport());
  return router;
};
