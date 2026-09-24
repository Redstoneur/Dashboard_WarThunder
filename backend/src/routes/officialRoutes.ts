import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import * as warThunderService from "../services/warThunderService.js";

export const officialRouter = Router();

/** GET /api/v1/indicators - Indicateurs bruts de vol/véhicule. */
officialRouter.get(
    "/indicators",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getIndicators());
    })
);

/** GET /api/v1/map_info - Informations de grille/bornes de la carte. */
officialRouter.get(
    "/map_info",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getMapInfo());
    })
);

/** GET /api/v1/map_objects - Liste des objets affichés sur la carte. */
officialRouter.get(
    "/map_objects",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getMapObjects());
    })
);

/**
 * GET /api/v1/map_img - Image de la carte (binaire).
 * Ajouter `?as_base64=true` pour recevoir un JSON `{ content, content_type }`.
 */
officialRouter.get(
    "/map_img",
    asyncHandler(async (req, res) => {
        const asBase64 = req.query.as_base64 === "true" || req.query.as_base64 === "1";
        const result = await warThunderService.getMapImage(asBase64);
        if (asBase64) {
            res.json({ content: result.base64 ?? "", content_type: result.contentType });
            return;
        }
        res.type(result.contentType).send(result.data ?? Buffer.alloc(0));
    })
);

/** GET /api/v1/state - État détaillé du véhicule/joueur. */
officialRouter.get(
    "/state",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getState());
    })
);
