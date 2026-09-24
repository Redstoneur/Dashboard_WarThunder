import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import * as warThunderService from "../services/warThunderService.js";

export const customRouterV1 = Router();
export const customRouterV2 = Router();

/** GET /api/v1/gyroscope - Données calculées du gyroscope. */
customRouterV1.get(
    "/gyroscope",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getGyroscope());
    })
);

/** GET /api/v1/compass - Données calculées de la boussole. */
customRouterV1.get(
    "/compass",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getCompass());
    })
);

/** GET /api/v1/speed - Vitesse actuelle (km/h). */
customRouterV1.get(
    "/speed",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getSpeed());
    })
);

/** GET /api/v1/altitude - Altitude actuelle (m). */
customRouterV1.get(
    "/altitude",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getAltitude());
    })
);

/** GET /api/v2/altitude - Altitude actuelle (m) enrichie avec l'état du train d'atterrissage. */
customRouterV2.get(
    "/altitude",
    asyncHandler(async (_req, res) => {
        res.json(await warThunderService.getAltitudeV2());
    })
);
