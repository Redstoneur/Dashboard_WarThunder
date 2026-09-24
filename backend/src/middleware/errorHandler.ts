import type { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger.js";
import { HttpError, UpstreamUnavailableError } from "../utils/errors.js";

/** Middleware Express centralisant la gestion des erreurs (404 -> handler par défaut, autres -> ici). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof UpstreamUnavailableError) {
        logger.error("Upstream error", { message: err.message });
        res.status(502).json({ detail: err.message });
        return;
    }
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ detail: err.message });
        return;
    }
    logger.error("Unhandled error", { error: err instanceof Error ? err.message : err });
    res.status(500).json({ detail: "Internal server error" });
}

/** Middleware pour les routes non trouvées (404), au format JSON cohérent avec le reste de l'API. */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({ detail: `Not Found: ${req.method} ${req.originalUrl}` });
}
