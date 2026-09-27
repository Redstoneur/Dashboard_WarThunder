import { ArmyEnum, CompassDirection } from "../types/enums.js";
import type {
    AltitudeModel,
    CompassModel,
    GyroscopeModel,
    IndicatorsModel,
    MapInfoModel,
    MapObjectModel,
    StateModel
} from "../types/models.js";

/**
 * Valeurs par défaut renvoyées par les endpoints lorsque le serveur War Thunder
 * (la machine sur laquelle le jeu tourne) est injoignable ou éteint et que le mode
 * "fallback" est activé (UPSTREAM_FALLBACK_ENABLED=true). Elles permettent au frontend
 * d'afficher un état cohérent ("hors ligne") plutôt qu'une erreur brute.
 */

export const DEFAULT_INDICATORS: IndicatorsModel = {
    valid: false,
    army: ArmyEnum.AIR,
    type: "unknown"
};

export const DEFAULT_MAP_INFO: MapInfoModel = {
    grid_size: [0, 0],
    grid_steps: [0, 0],
    grid_zero: [0, 0],
    hud_type: null,
    map_generation: null,
    map_max: [0, 0],
    map_min: [0, 0],
    valid: false
};

export const DEFAULT_MAP_OBJECTS: MapObjectModel[] = [];

export const DEFAULT_STATE: StateModel = {
    valid: false,
    aileron: null,
    elevator: null,
    rudder: null,
    flaps: null,
    gear: null,
    airbrake: null,
    H_m: null,
    TAS_kmh: null,
    IAS_kmh: null,
    M: null,
    AoA_deg: null,
    AoS_deg: null,
    Ny: null,
    Vy_ms: null,
    Wx_deg_s: null,
    Mfuel_kg: null,
    Mfuel0_kg: null,
    throttle1_percent: null,
    RPM_throttle1_percent: null,
    mixture1_percent: null,
    radiator1_percent: null,
    compressor_stage1: null,
    magneto1: null,
    power1_hp: null,
    RPM1: null,
    manifold_pressure1_atm: null,
    oil_temp1_C: null,
    pitch1_deg: null,
    thrust1_kg: null,
    efficiency1_percent: null
};

export const DEFAULT_GYROSCOPE: GyroscopeModel = {
    pitch: 0,
    roll: 0,
    yaw: 0,
    turn: 0
};

export const DEFAULT_COMPASS: CompassModel = {
    heading: 0,
    direction: CompassDirection.NORTH
};

export const DEFAULT_SPEED = 0;

export const DEFAULT_ALTITUDE = 0;

export const DEFAULT_ALTITUDE_V2: AltitudeModel = {
    altitude_meters: 0,
    gear_deployed: true
};
