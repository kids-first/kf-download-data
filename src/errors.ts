import { Request, Response, NextFunction } from 'express';

export class NotFoundError extends Error {
    public status = 404;
    constructor(message: string) {
        super(message);

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const unknownEndpointHandler = (_req: Request, _res: Response): void => {
    const notFoundErr = new NotFoundError('Not Found');
    notFoundErr.status = 404;
    throw notFoundErr;
};

export const globalErrorHandler = (
    err: Error | NotFoundError,
    req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    const status = err instanceof NotFoundError ? err.status : 500;
    res.status(status);
    res.send({
        message: req.app.get('env') === 'development' ? err.message : {},
    });
};

export const globalErrorLogger = (
    err: Error | NotFoundError,
    _req: Request,
    _res: Response,
    next: NextFunction,
): void => {
    console.error(err.stack);
    next(err);
};
