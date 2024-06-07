import express from 'express';

import { tryCatchNext } from '../errors';
import biospecimenDataReport from './biospecimen-data';
import biospecimenRequest from './biospecimen-request';
import biospecimenRequestStats from './biospecimen-request/biospecimenRequestStats';
import clinicalDataReport from './clinical-data';
import familyClinicalDataReport from './family-clinical-data';
import fileManifestReport from './file-manifest';
import fileManifestStats from './file-manifest/fileManifestStats';

export default () => {
    const router = express.Router();

    // declare a route for each report
    router.post('/clinical-data', tryCatchNext(clinicalDataReport));
    router.post('/family-clinical-data', tryCatchNext(familyClinicalDataReport));
    router.post('/biospecimen-data', tryCatchNext(biospecimenDataReport));
    router.post('/biospecimen-request/stats', tryCatchNext(biospecimenRequestStats));
    router.post('/biospecimen-request', tryCatchNext(biospecimenRequest));
    router.post('/file-manifest/stats', tryCatchNext(fileManifestStats));
    router.post('/file-manifest', tryCatchNext(fileManifestReport));
    return router;
};
