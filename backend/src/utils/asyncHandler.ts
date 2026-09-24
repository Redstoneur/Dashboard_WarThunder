import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Enveloppe un handler express async pour transmettre les erreurs à `next()`. */
export function asyncHandler(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
}
