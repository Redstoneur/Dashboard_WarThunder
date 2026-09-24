import cors from "cors";
import express, { type Express } from "express";

import { config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { customRouterV1, customRouterV2 } from "./routes/customRoutes.js";
import { officialRouter } from "./routes/officialRoutes.js";
import { statusRouter } from "./routes/statusRoutes.js";

/**
 * Construit l'application Express relayant les endpoints du serveur War Thunder.
 * Reproduit la même surface d'API que l'ancien backend FastAPI (`/api/v1/...`, `/api/v2/altitude`).
 */
export function createApp(): Express {
    const app = express();

    app.disable("x-powered-by");
    app.use(
        cors({
            origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((origin) => origin.trim())
        })
    );
    app.use(express.json());

    app.get("/", (_req, res) => {
        res.json({
            name: "War Thunder Dashboard API",
            version: "1.0.0",
            docs: "/api/v1/status"
        });
    });

    app.use("/api/v1", statusRouter);
    app.use("/api/v1", officialRouter);
    app.use("/api/v1", customRouterV1);
    app.use("/api/v2", customRouterV2);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
