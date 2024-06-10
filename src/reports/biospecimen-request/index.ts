import format from 'date-fns/format';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import JSZip from 'jszip';

import EsInstance from '../../ElasticSearchClientInstance';
import { PROJECT } from '../../env';
import { reportGenerationErrorHandler } from '../../errors';
import { normalizeConfigs } from '../../utils/configUtils';
import { getUTCDate } from '../../utils/dateUtils';
import ExtendedReportConfigs from '../../utils/extendedReportConfigs';
import { createSet } from '../../utils/userClient';
import { BioRequestConfig, ProjectType } from '../types';
import configInclude from './configInclude';
import configKf from './configKf';
import generateFiles from './generateBiospecimenRequestFiles';

const biospecimenRequest = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    console.time('biospecimenRequest');

    const { sqon, projectId, biospecimenRequestName } = req.body;
    const userId = req['kauth']?.grant?.access_token?.content?.sub;
    const accessToken = req.headers.authorization;

    const esClient = EsInstance.getInstance();
    const p = PROJECT.toLowerCase().trim();
    let bioRequestConfig: BioRequestConfig;

    if (p === ProjectType.include) {
        bioRequestConfig = configInclude;
    } else if (p === ProjectType.kidsFirst) {
        bioRequestConfig = configKf;
    } else {
        console.warn('No reportConfig found.');
    }

    try {
        await createSet(userId, accessToken, projectId, sqon, biospecimenRequestName);

        // decorate the configs with default values, values from arranger's project, etc...
        const normalizedConfigs: ExtendedReportConfigs = await normalizeConfigs(
            esClient,
            projectId,
            bioRequestConfig.reportConfig,
        );

        const nowUTC = getUTCDate();
        const filenameZip = generateFileName('zip', nowUTC, bioRequestConfig.fileNamePrefix, '');
        const pathFileZip = `/tmp/${filenameZip}`;

        const filenameXlsx = generateFileName('xlsx', nowUTC, bioRequestConfig.fileNamePrefix, '');
        const pathFileXlsx = `/tmp/${filenameXlsx}`;

        const filenameTxt = generateFileName('txt', nowUTC, bioRequestConfig.fileNamePrefix, 'README_');
        const pathFileTxt = `/tmp/${filenameTxt}`;

        // Generate the files
        await generateFiles(
            esClient,
            projectId,
            sqon,
            pathFileXlsx,
            pathFileTxt,
            normalizedConfigs,
            userId,
            accessToken,
            bioRequestConfig,
        );

        // Create the zip archive
        const zip = new JSZip();

        // Add the excel file in the archive
        const filenameXlsxData = fs.readFileSync(pathFileXlsx);
        zip.file(`${filenameXlsx}`, filenameXlsxData);

        // Add README in the archive
        const filenameTxtData = fs.readFileSync(pathFileTxt);
        zip.file(`${filenameTxt}`, filenameTxtData);

        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(pathFileZip))
            .on('finish', function () {
                res.setHeader('Content-Disposition', `attachment; filename="${filenameZip}"`);
                res.sendFile(pathFileZip);
            });
    } catch (err) {
        reportGenerationErrorHandler(err);
    } finally {
        console.timeEnd('biospecimenRequest');
    }
};

const generateFileName = (ext: string, nowUTC: Date, prefix: string, suffix: string) =>
    `${prefix}_biospecimenRequest_${suffix}${format(nowUTC, "yyyyMMdd'T'HHmmss'Z'")}.${ext}`;

export default biospecimenRequest;
