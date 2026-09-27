import { config } from "../config/env.js";

const LEVELS = ["debug", "info", "warn", "error"] as const;
type Level = (typeof LEVELS)[number];

function shouldLog(level: Level): boolean {
    const configured = LEVELS.includes(config.logLevel as Level) ? (config.logLevel as Level) : "info";
    return LEVELS.indexOf(level) >= LEVELS.indexOf(configured);
}

function format(level: Level, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/** Petit logger console minimaliste, sans dépendance externe, respectant LOG_LEVEL. */
export const logger = {
    debug(message: string, meta?: unknown): void {
        if (shouldLog("debug")) console.debug(format("debug", message, meta));
    },
    info(message: string, meta?: unknown): void {
        if (shouldLog("info")) console.info(format("info", message, meta));
    },
    warn(message: string, meta?: unknown): void {
        if (shouldLog("warn")) console.warn(format("warn", message, meta));
    },
    error(message: string, meta?: unknown): void {
        if (shouldLog("error")) console.error(format("error", message, meta));
    }
};
