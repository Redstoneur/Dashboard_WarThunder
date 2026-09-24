import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { getStatus } from "../services/warThunderService.js";

export const statusRouter = Router();

/**
 * GET /api/v1/status
 * Vérifie l'état de l'API ainsi que la connectivité vers le serveur War Thunder.
 */
statusRouter.get(
    "/status",
    asyncHandler(async (_req, res) => {
        const status = await getStatus();
        res.json(status);
    })
);
