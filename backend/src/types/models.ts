import type { ArmyEnum, CompassDirection, MapObjectIcon, MapObjectIconBg, MapObjectType } from "./enums.js";

/** Statut simple de l'API. */
export interface Status {
    status: string;
    message: string;
    upstream: {
        reachable: boolean;
        host: string;
        port: number;
    };
}

/**
 * Indicateurs de vol et de véhicule tels que renvoyés par l'endpoint officiel
 * `/indicators` du serveur War Thunder. La quasi-totalité des champs est optionnelle
 * car ils dépendent du type de véhicule piloté (avion, char, bateau...).
 */
export interface IndicatorsModel {
    valid: boolean;
    army: ArmyEnum;
    type: string;
    speed?: number | null;
    pedals?: number | null;
    pedals1?: number | null;
    pedals2?: number | null;
    pedals3?: number | null;
    pedals4?: number | null;
    pedals5?: number | null;
    stick_elevator?: number | null;
    stick_ailerons2?: number | null;
    vario?: number | null;
    altitude_hour?: number | null;
    altitude_min?: number | null;
    altitude_10k?: number | null;
    altitude1_min?: number | null;
    altitude1_10k?: number | null;
    aviahorizon_roll?: number | null;
    aviahorizon_pitch?: number | null;
    aviahorizon_roll1?: number | null;
    aviahorizon_pitch1?: number | null;
    bank?: number | null;
    turn?: number | null;
    compass?: number | null;
    compass1?: number | null;
    compass2?: number | null;
    manifold_pressure?: number | null;
    clock_hour?: number | null;
    clock_min?: number | null;
    clock_sec?: number | null;
    rpm?: number | null;
    rpm_min?: number | null;
    rpm_hour?: number | null;
    water_temperature?: number | null;
    oil_pressure?: number | null;
    oil_temperature?: number | null;
    head_temperature?: number | null;
    head_temperature1?: number | null;
    fuel?: number | null;
    fuel1?: number | null;
    fuel_pressure?: number | null;
    airbrake_lever?: number | null;
    airbrake_indicator?: number | null;
    gears?: number | null;
    gear_lamp_down?: number | null;
    gear_lamp_up?: number | null;
    gear_lamp_off?: number | null;
    trimmer?: number | null;
    throttle?: number | null;
    weapon1?: number | null;
    weapon2?: number | null;
    weapon3?: number | null;
    weapon4?: number | null;
    mach?: number | null;
    g_meter?: number | null;
    g_meter_max?: number | null;
    aoa?: number | null;
    blister1?: number | null;
    blister2?: number | null;
    blister3?: number | null;
    blister4?: number | null;
    blister5?: number | null;
    blister6?: number | null;
    blister7?: number | null;
}

/** Informations décrivant la grille et les bornes de la carte. */
export interface MapInfoModel {
    grid_size: number[];
    grid_steps: number[];
    grid_zero: number[];
    hud_type: number | null;
    map_generation: number | null;
    map_max: number[];
    map_min: number[];
    valid: boolean;
}

/** Objet affiché sur la carte (avion, aérodrome, véhicule...). */
export interface MapObjectModel {
    type: MapObjectType;
    icon: MapObjectIcon | null;
    icon_bg: MapObjectIconBg | null;
    color_hex: string | null;
    color_rgb: number[] | null;
    blink: number | null;
    x: number | null;
    y: number | null;
    dx: number | null;
    dy: number | null;
    sx: number | null;
    sy: number | null;
    ex: number | null;
    ey: number | null;
}

/** État détaillé du véhicule/joueur (contrôles, capteurs, moteurs...). */
export interface StateModel {
    valid: boolean;
    aileron: number | null;
    elevator: number | null;
    rudder: number | null;
    flaps: number | null;
    gear: number | null;
    airbrake: number | null;
    H_m: number | null;
    TAS_kmh: number | null;
    IAS_kmh: number | null;
    M: number | null;
    AoA_deg: number | null;
    AoS_deg: number | null;
    Ny: number | null;
    Vy_ms: number | null;
    Wx_deg_s: number | null;
    Mfuel_kg: number | null;
    Mfuel0_kg: number | null;
    throttle1_percent: number | null;
    RPM_throttle1_percent: number | null;
    mixture1_percent: number | null;
    radiator1_percent: number | null;
    compressor_stage1: number | null;
    magneto1: number | null;
    power1_hp: number | null;
    RPM1: number | null;
    manifold_pressure1_atm: number | null;
    oil_temp1_C: number | null;
    pitch1_deg: number | null;
    thrust1_kg: number | null;
    efficiency1_percent: number | null;
}

/** Données d'altitude enrichies avec l'état du train d'atterrissage. */
export interface AltitudeModel {
    altitude_meters: number;
    gear_deployed: boolean;
}

/** Données de la boussole. */
export interface CompassModel {
    heading: number;
    direction: CompassDirection;
}

/** Données du gyroscope calculées à partir des indicateurs bruts. */
export interface GyroscopeModel {
    pitch: number;
    roll: number;
    yaw: number;
    turn: number;
}
