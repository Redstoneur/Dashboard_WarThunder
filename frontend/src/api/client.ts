import { API_BASE_URL } from "../config/env";
import type { CompassData, GyroscopeData, MapInfo, MapObject, StatusResponse } from "./types";

/**
 * Récupère du JSON depuis l'API backend. Utilise `API_BASE_URL` si défini (déploiement séparé),
 * sinon des chemins relatifs (proxy Vite en dev, ou même origine derrière Nginx en prod).
 */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, { signal, cache: "no-store" });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} on ${path}`);
    }
    return (await res.json()) as T;
}

/** Récupère du texte brut (utilisé pour `/speed` et `/altitude` v1 qui renvoient un nombre JSON simple). */
export async function getNumber(path: string, signal?: AbortSignal): Promise<number> {
    const value = await getJson<number>(path, signal);
    return Number.isFinite(value) ? value : 0;
}

export const api = {
    status: (signal?: AbortSignal) => getJson<StatusResponse>("/api/v1/status", signal),
    speed: (signal?: AbortSignal) => getNumber("/api/v1/speed", signal),
    altitudeV2: (signal?: AbortSignal) =>
        getJson<{ altitude_meters: number | null; gear_deployed: boolean | null }>("/api/v2/altitude", signal),
    compass: (signal?: AbortSignal) => getJson<CompassData>("/api/v1/compass", signal),
    gyroscope: (signal?: AbortSignal) => getJson<GyroscopeData>("/api/v1/gyroscope", signal),
    mapInfo: (signal?: AbortSignal) => getJson<MapInfo>("/api/v1/map_info", signal),
    mapObjects: (signal?: AbortSignal) => getJson<MapObject[]>("/api/v1/map_objects", signal),
    mapImageUrl: () => `${API_BASE_URL}/api/v1/map_img`
};
