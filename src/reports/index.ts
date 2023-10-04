import express from 'express';

import clinicalDataReport from './clinical-data';
import familyClinicalDataReport from './family-clinical-data';
import biospecimenDataReport from './biospecimen-data';
import fileManifestStats from './file-manifest/fileManifestStats';
import fileManifestReport from './file-manifest';
import biospecimenRequestStats from './biospecimen-request/biospecimenRequestStats';

export default () => {
    const router = express.Router();

    // declare a route for each report
    router.use('/clinical-data', clinicalDataReport());
    router.use('/family-clinical-data', familyClinicalDataReport());
    router.use('/biospecimen-data', biospecimenDataReport());
    router.use('/biospecimen-request/stats', biospecimenRequestStats());
    router.use('/file-manifest/stats', fileManifestStats());
    router.use('/file-manifest', fileManifestReport());
    return router;
};
