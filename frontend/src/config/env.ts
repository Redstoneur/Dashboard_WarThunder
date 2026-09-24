/**
 * Configuration runtime du frontend, résolue depuis les variables d'environnement Vite
 * (`VITE_*`, voir `.env.example`). Permet de pointer vers un backend distant sans
 * recompiler (ex: déploiement Docker séparé backend/frontend).
 */

const rawBase = import.meta.env.VITE_API_BASE_URL ?? "";

/** Base URL de l'API (sans slash final). Vide = utilise les requêtes relatives (proxy). */
export const API_BASE_URL: string = rawBase.replace(/\/+$/, "");

function toNumber(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

/** Intervalles de polling (ms), configurables via variables d'environnement Vite. */
export const POLL_INTERVALS = {
    status: toNumber(import.meta.env.VITE_POLL_STATUS_MS, 5000),
    speed: toNumber(import.meta.env.VITE_POLL_SPEED_MS, 200),
    altitude: toNumber(import.meta.env.VITE_POLL_ALTITUDE_MS, 500),
    compass: toNumber(import.meta.env.VITE_POLL_COMPASS_MS, 100),
    gyroscope: toNumber(import.meta.env.VITE_POLL_GYROSCOPE_MS, 100),
    map: toNumber(import.meta.env.VITE_POLL_MAP_MS, 400)
};

/** Plages d'affichage des jauges, configurables via variables d'environnement Vite. */
export const GAUGE_RANGES = {
    speedMin: toNumber(import.meta.env.VITE_SPEED_MIN, 0),
    speedMax: toNumber(import.meta.env.VITE_SPEED_MAX, 1000),
    altitudeMin: toNumber(import.meta.env.VITE_ALTITUDE_MIN, 0),
    altitudeMax: toNumber(import.meta.env.VITE_ALTITUDE_MAX, 3000),
    altitudeAlarmIntermittentStart: toNumber(import.meta.env.VITE_ALTITUDE_ALARM_INTERMITTENT_M, 100),
    altitudeAlarmContinuousStart: toNumber(import.meta.env.VITE_ALTITUDE_ALARM_CONTINUOUS_M, 50)
};
