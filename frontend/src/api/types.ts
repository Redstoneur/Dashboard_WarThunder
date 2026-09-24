/** Types partagés reflétant les modèles exposés par le backend (voir backend/src/types/models.ts). */

export interface StatusResponse {
    status: string;
    message: string;
    upstream: {
        reachable: boolean;
        host: string;
        port: number;
    };
}

export interface CompassData {
    heading: number;
    direction: "N" | "E" | "S" | "W" | "NE" | "SE" | "SW" | "NW";
}

export interface GyroscopeData {
    pitch: number;
    roll: number;
    yaw: number;
    turn: number;
}

export interface AltitudeData {
    altitude_meters: number | null;
    gear_deployed: boolean | null;
}

export interface MapInfo {
    grid_size: [number, number];
    grid_steps: [number, number];
    grid_zero: [number, number];
    hud_type?: number | null;
    map_generation?: number | null;
    map_max?: [number, number];
    map_min?: [number, number];
    valid?: boolean;
}

export interface MapObject {
    type: string;
    color_hex?: string | null;
    blink?: number | null;
    icon?: string | null;
    icon_bg?: string | null;
    x?: number | null;
    y?: number | null;
    dx?: number | null;
    dy?: number | null;
    sx?: number | null;
    sy?: number | null;
    ex?: number | null;
    ey?: number | null;
}
