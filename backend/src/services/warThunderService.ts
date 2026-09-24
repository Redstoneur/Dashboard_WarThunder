import { config } from "../config/env.js";
import { getCompassDirection, MapObjectIcon, MapObjectIconBg, MapObjectType } from "../types/enums.js";
import type {
    AltitudeModel,
    CompassModel,
    GyroscopeModel,
    IndicatorsModel,
    MapInfoModel,
    MapObjectModel,
    StateModel,
    Status
} from "../types/models.js";
import { logger } from "../utils/logger.js";
import { UpstreamUnavailableError } from "../utils/errors.js";
import * as defaults from "./defaults.js";
import { fetchBinary, fetchJson, warThunderEndpoints } from "./warThunderClient.js";

/**
 * Exécute `operation`. Si le serveur War Thunder est injoignable:
 * - en mode fallback (par défaut), renvoie `fallbackValue` afin que l'API reste disponible
 *   et affiche des informations de base même quand le jeu/serveur d'origine est désactivé;
 * - sinon, propage l'erreur (comportement historique, HTTP 502).
 */
async function withFallback<T>(operation: () => Promise<T>, fallbackValue: T, context: string): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof UpstreamUnavailableError) {
            if (config.upstreamFallbackEnabled) {
                logger.warn(`${context}: upstream unreachable, returning fallback data`, {
                    message: error.message
                });
                return fallbackValue;
            }
            throw error;
        }
        throw error;
    }
}

/** Vérifie si le serveur War Thunder répond, sans jamais lever d'exception. */
async function isUpstreamReachable(): Promise<boolean> {
    try {
        await fetchJson(warThunderEndpoints.indicators, Math.min(config.warThunderTimeoutMs, 2000));
        return true;
    } catch {
        return false;
    }
}

/** Statut de l'API + information de connectivité vers le serveur War Thunder. */
export async function getStatus(): Promise<Status> {
    const reachable = await isUpstreamReachable();
    return {
        status: "ok",
        message: reachable
            ? "API is running smoothly"
            : "API is running, but the War Thunder server is unreachable (game not running?)",
        upstream: {
            reachable,
            host: config.warThunderIp,
            port: config.warThunderPort
        }
    };
}

/** Récupère les indicateurs bruts depuis le serveur War Thunder. */
export async function getIndicators(): Promise<IndicatorsModel> {
    return withFallback(
        () => fetchJson<IndicatorsModel>(warThunderEndpoints.indicators),
        defaults.DEFAULT_INDICATORS,
        "getIndicators"
    );
}

/** Récupère les informations de la carte (grille, bornes...). */
export async function getMapInfo(): Promise<MapInfoModel> {
    return withFallback(() => fetchJson<MapInfoModel>(warThunderEndpoints.mapInfo), defaults.DEFAULT_MAP_INFO, "getMapInfo");
}

interface RawMapObject {
    type?: string;
    icon?: string;
    icon_bg?: string;
    color?: string;
    "color[]"?: number[];
    blink?: number;
    x?: number;
    y?: number;
    dx?: number;
    dy?: number;
    sx?: number;
    sy?: number;
    ex?: number;
    ey?: number;
}

function toMapObjectModel(item: RawMapObject): MapObjectModel {
    return {
        type: (item.type as MapObjectType) ?? MapObjectType.GROUND_MODEL,
        icon: item.icon ? ((item.icon as MapObjectIcon) ?? null) : null,
        icon_bg: item.icon_bg ? ((item.icon_bg as MapObjectIconBg) ?? null) : null,
        color_hex: item.color ?? null,
        color_rgb: item["color[]"] ?? null,
        blink: item.blink ?? null,
        x: item.x ?? null,
        y: item.y ?? null,
        dx: item.dx ?? null,
        dy: item.dy ?? null,
        sx: item.sx ?? null,
        sy: item.sy ?? null,
        ex: item.ex ?? null,
        ey: item.ey ?? null
    };
}

/** Récupère la liste des objets présents sur la carte. */
export async function getMapObjects(): Promise<MapObjectModel[]> {
    return withFallback(
        async () => {
            const data = await fetchJson<RawMapObject[]>(warThunderEndpoints.mapObj);
            return data.map(toMapObjectModel);
        },
        defaults.DEFAULT_MAP_OBJECTS,
        "getMapObjects"
    );
}

export interface MapImageResult {
    data: Buffer | null;
    contentType: string;
    base64?: string;
}

/** Récupère l'image de la carte (binaire) depuis le serveur War Thunder. */
export async function getMapImage(asBase64: boolean): Promise<MapImageResult> {
    try {
        const { data, contentType } = await fetchBinary(warThunderEndpoints.mapImg);
        if (asBase64) {
            return { data: null, contentType, base64: data.toString("base64") };
        }
        return { data, contentType };
    } catch (error) {
        if (error instanceof UpstreamUnavailableError && config.upstreamFallbackEnabled) {
            logger.warn("getMapImage: upstream unreachable, returning empty image payload", {
                message: error.message
            });
            return asBase64
                ? { data: null, contentType: "application/octet-stream", base64: "" }
                : { data: Buffer.alloc(0), contentType: "application/octet-stream" };
        }
        throw error;
    }
}

/** Champs bruts (avec unités) renvoyés par l'endpoint officiel `/state`. */
interface RawState {
    valid?: boolean;
    "aileron, %"?: number;
    "elevator, %"?: number;
    "rudder, %"?: number;
    "flaps, %"?: number;
    "gear, %"?: number;
    "airbrake, %"?: number;
    "H, m"?: number;
    "TAS, km/h"?: number;
    "IAS, km/h"?: number;
    M?: number;
    "AoA, deg"?: number;
    "AoS, deg"?: number;
    Ny?: number;
    "Vy, m/s"?: number;
    "Wx, deg/s"?: number;
    "Mfuel, kg"?: number;
    "Mfuel0, kg"?: number;
    "throttle 1, %"?: number;
    "RPM throttle 1, %"?: number;
    "mixture 1, %"?: number;
    "radiator 1, %"?: number;
    "compressor stage 1"?: number;
    "magneto 1"?: number;
    "power 1, hp"?: number;
    "RPM 1"?: number;
    "manifold pressure 1, atm"?: number;
    "oil temp 1, C"?: number;
    "pitch 1, deg"?: number;
    "thrust 1, kgs"?: number;
    "efficiency 1, %"?: number;
}

function toStateModel(data: RawState): StateModel {
    return {
        valid: data.valid ?? false,
        aileron: data["aileron, %"] ?? null,
        elevator: data["elevator, %"] ?? null,
        rudder: data["rudder, %"] ?? null,
        flaps: data["flaps, %"] ?? null,
        gear: data["gear, %"] ?? null,
        airbrake: data["airbrake, %"] ?? null,
        H_m: data["H, m"] ?? null,
        TAS_kmh: data["TAS, km/h"] ?? null,
        IAS_kmh: data["IAS, km/h"] ?? null,
        M: data.M ?? null,
        AoA_deg: data["AoA, deg"] ?? null,
        AoS_deg: data["AoS, deg"] ?? null,
        Ny: data.Ny ?? null,
        Vy_ms: data["Vy, m/s"] ?? null,
        Wx_deg_s: data["Wx, deg/s"] ?? null,
        Mfuel_kg: data["Mfuel, kg"] ?? null,
        Mfuel0_kg: data["Mfuel0, kg"] ?? null,
        throttle1_percent: data["throttle 1, %"] ?? null,
        RPM_throttle1_percent: data["RPM throttle 1, %"] ?? null,
        mixture1_percent: data["mixture 1, %"] ?? null,
        radiator1_percent: data["radiator 1, %"] ?? null,
        compressor_stage1: data["compressor stage 1"] ?? null,
        magneto1: data["magneto 1"] ?? null,
        power1_hp: data["power 1, hp"] ?? null,
        RPM1: data["RPM 1"] ?? null,
        manifold_pressure1_atm: data["manifold pressure 1, atm"] ?? null,
        oil_temp1_C: data["oil temp 1, C"] ?? null,
        pitch1_deg: data["pitch 1, deg"] ?? null,
        thrust1_kg: data["thrust 1, kgs"] ?? null,
        efficiency1_percent: data["efficiency 1, %"] ?? null
    };
}

/** Récupère l'état détaillé du véhicule/joueur. */
export async function getState(): Promise<StateModel> {
    return withFallback(
        async () => {
            const data = await fetchJson<RawState>(warThunderEndpoints.state);
            return toStateModel(data);
        },
        defaults.DEFAULT_STATE,
        "getState"
    );
}

/** Calcule les données du gyroscope à partir des indicateurs (et de l'état si besoin). */
export async function getGyroscope(): Promise<GyroscopeModel> {
    return withFallback(
        async () => {
            const indicators = await getIndicators();
            let turn: number;
            if (indicators.turn === undefined || indicators.turn === null) {
                const state = await getState();
                turn = (state.rudder ?? 0) / 100;
            } else {
                turn = indicators.turn;
            }
            return {
                pitch:
                    indicators.aviahorizon_roll !== undefined && indicators.aviahorizon_roll !== null
                        ? (indicators.aviahorizon_roll / 90) * 180
                        : 0,
                roll: indicators.aviahorizon_pitch ?? 0,
                yaw: indicators.bank ?? 0,
                turn
            };
        },
        defaults.DEFAULT_GYROSCOPE,
        "getGyroscope"
    );
}

/** Calcule les données de la boussole à partir des indicateurs. */
export async function getCompass(): Promise<CompassModel> {
    return withFallback(
        async () => {
            const indicators = await getIndicators();
            const heading = indicators.compass ?? 0;
            return { heading, direction: getCompassDirection(((heading % 360) + 360) % 360) };
        },
        defaults.DEFAULT_COMPASS,
        "getCompass"
    );
}

/** Récupère la vitesse (TAS, km/h) depuis l'état du véhicule. */
export async function getSpeed(): Promise<number> {
    return withFallback(
        async () => {
            const state = await getState();
            return state.TAS_kmh ?? defaults.DEFAULT_SPEED;
        },
        defaults.DEFAULT_SPEED,
        "getSpeed"
    );
}

/** Récupère l'altitude (m) depuis l'état du véhicule. */
export async function getAltitude(): Promise<number> {
    return withFallback(
        async () => {
            const state = await getState();
            return state.H_m ?? defaults.DEFAULT_ALTITUDE;
        },
        defaults.DEFAULT_ALTITUDE,
        "getAltitude"
    );
}

/** Récupère l'altitude enrichie avec l'état du train d'atterrissage. */
export async function getAltitudeV2(): Promise<AltitudeModel> {
    return withFallback(
        async () => {
            const state = await getState();
            return {
                altitude_meters: state.H_m ?? 0,
                gear_deployed: (state.gear ?? 0) >= 90
            };
        },
        defaults.DEFAULT_ALTITUDE_V2,
        "getAltitudeV2"
    );
}
