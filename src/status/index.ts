import { Request, Response } from 'express';

import { version, name, description } from '../../package.json';
import { ES_HOST, PROJECT } from '../env';

export default (_req: Request, res: Response) =>
    res.send({
        name,
        version,
        description: `${description} ${PROJECT} portal.`,
        elasticsearch: ES_HOST,
    });
