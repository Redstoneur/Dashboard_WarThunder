import "dotenv/config";

/**
 * Options CLI supportées, à l'image de l'ancien script Python `main.py`
 * (--host, --port, --war-thunder-ip, --war-thunder-port).
 */
interface CliArgs {
    host?: string;
    port?: number;
    warThunderIp?: string;
    warThunderPort?: number;
}

function parseCliArgs(argv: string[]): CliArgs {
    const args: CliArgs = {};
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        const next = argv[i + 1];
        switch (arg) {
            case "--host":
                args.host = next;
                i += 1;
                break;
            case "--port":
                args.port = next !== undefined ? Number(next) : undefined;
                i += 1;
                break;
            case "--war-thunder-ip":
                args.warThunderIp = next;
                i += 1;
                break;
            case "--war-thunder-port":
                args.warThunderPort = next !== undefined ? Number(next) : undefined;
                i += 1;
                break;
            default:
                break;
        }
    }
    return args;
}

function toNumber(value: string | undefined, fallback: number): number {
    if (value === undefined || value === "") return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined || value === "") return fallback;
    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
}

const cliArgs = parseCliArgs(process.argv.slice(2));

export interface AppConfig {
    host: string;
    port: number;
    warThunderIp: string;
    warThunderPort: number;
    warThunderTimeoutMs: number;
    warThunderImgTimeoutMs: number;
    upstreamFallbackEnabled: boolean;
    corsOrigin: string;
    logLevel: string;
}

/**
 * Configuration de l'application. Priorité: arguments CLI > variables d'environnement > valeurs par défaut.
 * Cela reproduit le comportement de l'ancien backend FastAPI/argparse tout en restant configurable via `.env`
 * pour un déploiement Docker.
 */
export const config: AppConfig = {
    host: cliArgs.host ?? process.env.HOST ?? "localhost",
    port: cliArgs.port ?? toNumber(process.env.PORT, 8000),
    warThunderIp: cliArgs.warThunderIp ?? process.env.WAR_THUNDER_IP ?? "localhost",
    warThunderPort: cliArgs.warThunderPort ?? toNumber(process.env.WAR_THUNDER_PORT, 8111),
    warThunderTimeoutMs: toNumber(process.env.WAR_THUNDER_TIMEOUT_MS, 5000),
    warThunderImgTimeoutMs: toNumber(process.env.WAR_THUNDER_IMG_TIMEOUT_MS, 10000),
    upstreamFallbackEnabled: toBoolean(process.env.UPSTREAM_FALLBACK_ENABLED, true),
    corsOrigin: process.env.CORS_ORIGIN ?? "*",
    logLevel: process.env.LOG_LEVEL ?? "info"
};

export const warThunderEndpoints = {
    indicators: `http://${config.warThunderIp}:${config.warThunderPort}/indicators`,
    state: `http://${config.warThunderIp}:${config.warThunderPort}/state`,
    mapInfo: `http://${config.warThunderIp}:${config.warThunderPort}/map_info.json`,
    mapObj: `http://${config.warThunderIp}:${config.warThunderPort}/map_obj.json`,
    mapImg: `http://${config.warThunderIp}:${config.warThunderPort}/map.img`
};
