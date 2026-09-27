import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { logger } from "./utils/logger.js";

/**
 * Point d'entrée du serveur. Démarre l'application Express avec la configuration
 * résolue depuis les arguments CLI / variables d'environnement (voir `config/env.ts`).
 */
function main(): void {
    const app = createApp();

    app.listen(config.port, config.host, () => {
        logger.info(`War Thunder Dashboard API listening on http://${config.host}:${config.port}`);
        logger.info(`Relaying War Thunder server at http://${config.warThunderIp}:${config.warThunderPort}`);
    });
}

main();
