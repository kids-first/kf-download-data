import express from 'express';

import clinicalDataReport from './clinical-data';
import familyClinicalDataReport from './family-clinical-data';
import biospecimenDataReport from './biospecimen-data';
import fileManifestStats from './file-manifest/fileManifestStats';
import fileManifestReport from './file-manifest';
import biospecimenRequestStats from './biospecimen-request/biospecimenRequestStats';
import biospecimenRequest from './biospecimen-request';
import { tryCatchNext } from '../errors';

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
