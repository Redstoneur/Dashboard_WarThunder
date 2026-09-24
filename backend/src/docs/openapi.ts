import { config } from "../config/env.js";

/**
 * Spécification OpenAPI 3.0.3 décrivant l'ensemble des endpoints exposés par l'API.
 * Servie en JSON sur `/api/openapi.json` et via Swagger UI sur `/api/docs`.
 *
 * Toute évolution de routes (ajout/suppression/modification) doit être répercutée ici afin
 * que la documentation reste fidèle au comportement réel de l'API (contrat "as documented").
 */
export function buildOpenApiDocument() {
    const statusSchema = {
        type: "object",
        required: ["status", "message", "upstream"],
        properties: {
            status: { type: "string", example: "ok" },
            message: {
                type: "string",
                example: "API is running, but the War Thunder server is unreachable (game not running?)"
            },
            upstream: {
                type: "object",
                required: ["reachable", "host", "port"],
                properties: {
                    reachable: { type: "boolean", example: false },
                    host: { type: "string", example: "localhost" },
                    port: { type: "integer", example: 8111 }
                }
            }
        }
    };

    const indicatorsSchema = {
        type: "object",
        description: "Indicateurs bruts de vol/véhicule (la quasi-totalité des champs est optionnelle selon le véhicule).",
        required: ["valid", "army", "type"],
        properties: {
            valid: { type: "boolean" },
            army: { type: "string", enum: ["air", "ground", "navy"] },
            type: { type: "string", example: "a-35b" },
            speed: { type: "number", nullable: true },
            vario: { type: "number", nullable: true },
            altitude_hour: { type: "number", nullable: true },
            altitude_min: { type: "number", nullable: true },
            altitude_10k: { type: "number", nullable: true },
            aviahorizon_roll: { type: "number", nullable: true },
            aviahorizon_pitch: { type: "number", nullable: true },
            bank: { type: "number", nullable: true },
            turn: { type: "number", nullable: true },
            compass: { type: "number", nullable: true },
            compass2: { type: "number", nullable: true },
            manifold_pressure: { type: "number", nullable: true },
            rpm: { type: "number", nullable: true },
            oil_pressure: { type: "number", nullable: true },
            oil_temperature: { type: "number", nullable: true },
            head_temperature: { type: "number", nullable: true },
            head_temperature1: { type: "number", nullable: true },
            fuel: { type: "number", nullable: true },
            fuel_pressure: { type: "number", nullable: true },
            gear_lamp_down: { type: "integer", nullable: true },
            gear_lamp_up: { type: "integer", nullable: true },
            gear_lamp_off: { type: "integer", nullable: true },
            blister1: { type: "integer", nullable: true },
            blister2: { type: "integer", nullable: true },
            blister3: { type: "integer", nullable: true },
            blister4: { type: "integer", nullable: true }
        },
        additionalProperties: true
    };

    const mapInfoSchema = {
        type: "object",
        required: ["grid_size", "grid_steps", "grid_zero", "map_max", "map_min", "valid"],
        properties: {
            grid_size: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
            grid_steps: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
            grid_zero: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
            hud_type: { type: "integer", nullable: true },
            map_generation: { type: "integer", nullable: true },
            map_max: { type: "array", items: { type: "number" } },
            map_min: { type: "array", items: { type: "number" } },
            valid: { type: "boolean" }
        }
    };

    const mapObjectSchema = {
        type: "object",
        required: ["type"],
        properties: {
            type: { type: "string", enum: ["aircraft", "ground_model", "airfield", "bombing_point"] },
            icon: { type: "string", nullable: true },
            icon_bg: { type: "string", nullable: true },
            color_hex: { type: "string", nullable: true, example: "#faC81E" },
            color_rgb: { type: "array", items: { type: "integer" }, nullable: true },
            blink: { type: "integer", nullable: true },
            x: { type: "number", nullable: true },
            y: { type: "number", nullable: true },
            dx: { type: "number", nullable: true },
            dy: { type: "number", nullable: true },
            sx: { type: "number", nullable: true },
            sy: { type: "number", nullable: true },
            ex: { type: "number", nullable: true },
            ey: { type: "number", nullable: true }
        }
    };

    const stateSchema = {
        type: "object",
        required: ["valid"],
        properties: {
            valid: { type: "boolean" },
            aileron: { type: "number", nullable: true },
            elevator: { type: "number", nullable: true },
            rudder: { type: "number", nullable: true },
            flaps: { type: "number", nullable: true },
            gear: { type: "number", nullable: true },
            airbrake: { type: "number", nullable: true },
            H_m: { type: "number", nullable: true },
            TAS_kmh: { type: "number", nullable: true },
            IAS_kmh: { type: "number", nullable: true },
            M: { type: "number", nullable: true },
            AoA_deg: { type: "number", nullable: true },
            AoS_deg: { type: "number", nullable: true },
            Ny: { type: "number", nullable: true },
            Vy_ms: { type: "number", nullable: true },
            Wx_deg_s: { type: "number", nullable: true },
            Mfuel_kg: { type: "number", nullable: true },
            Mfuel0_kg: { type: "number", nullable: true },
            throttle1_percent: { type: "number", nullable: true },
            RPM_throttle1_percent: { type: "number", nullable: true },
            mixture1_percent: { type: "number", nullable: true },
            radiator1_percent: { type: "number", nullable: true },
            compressor_stage1: { type: "integer", nullable: true },
            magneto1: { type: "integer", nullable: true },
            power1_hp: { type: "number", nullable: true },
            RPM1: { type: "number", nullable: true },
            manifold_pressure1_atm: { type: "number", nullable: true },
            oil_temp1_C: { type: "number", nullable: true },
            pitch1_deg: { type: "number", nullable: true },
            thrust1_kg: { type: "number", nullable: true },
            efficiency1_percent: { type: "number", nullable: true }
        }
    };

    const gyroscopeSchema = {
        type: "object",
        required: ["pitch", "roll", "yaw", "turn"],
        properties: {
            pitch: { type: "number", example: 1.5 },
            roll: { type: "number", example: -0.3 },
            yaw: { type: "number", example: 0.0 },
            turn: { type: "number", example: 0.2 }
        }
    };

    const compassSchema = {
        type: "object",
        required: ["heading", "direction"],
        properties: {
            heading: { type: "number", example: 45.0 },
            direction: { type: "string", enum: ["N", "E", "S", "W", "NE", "SE", "SW", "NW"], example: "NE" }
        }
    };

    const altitudeV2Schema = {
        type: "object",
        required: ["altitude_meters", "gear_deployed"],
        properties: {
            altitude_meters: { type: "number", example: 1500.0 },
            gear_deployed: { type: "boolean", example: false }
        }
    };

    const upstreamErrorResponse = {
        description: "Serveur War Thunder injoignable (renvoyé uniquement si UPSTREAM_FALLBACK_ENABLED=false)",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: { detail: { type: "string", example: "Upstream service unreachable: ECONNREFUSED" } }
                }
            }
        }
    };

    return {
        openapi: "3.0.3",
        info: {
            title: "War Thunder Dashboard API",
            version: "1.0.0",
            description:
                "API relayant/normalisant les données exposées localement par War Thunder " +
                `(http://${config.warThunderIp}:${config.warThunderPort}) pour le tableau de bord. ` +
                "Lorsque le jeu est injoignable et que UPSTREAM_FALLBACK_ENABLED=true (par défaut), " +
                "les endpoints renvoient des données par défaut (valid: false) au lieu d'une erreur 502.",
            license: { name: "GPL-3.0", url: "https://www.gnu.org/licenses/gpl-3.0.html" }
        },
        servers: [{ url: "/", description: "Serveur courant" }],
        tags: [
            { name: "Status", description: "État de l'API et de la connectivité au serveur War Thunder" },
            { name: "Official_API", description: "Relais direct des endpoints officiels exposés par War Thunder" },
            { name: "Custom_API", description: "Endpoints dérivés/calculés pour le tableau de bord" }
        ],
        paths: {
            "/api/v1/status": {
                get: {
                    tags: ["Status"],
                    summary: "Get API status",
                    description: "Vérifie l'état de l'API et la connectivité vers le serveur War Thunder.",
                    operationId: "getStatus",
                    responses: {
                        "200": {
                            description: "API is running smoothly",
                            content: { "application/json": { schema: statusSchema } }
                        }
                    }
                }
            },
            "/api/v1/indicators": {
                get: {
                    tags: ["Official_API"],
                    summary: "Get Indicators",
                    description: "Endpoint to retrieve indicators from War Thunder",
                    operationId: "getIndicators",
                    responses: {
                        "200": {
                            description: "Indicators retrieved successfully",
                            content: { "application/json": { schema: indicatorsSchema } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/map_info": {
                get: {
                    tags: ["Official_API"],
                    summary: "Get Map Info",
                    description: "Endpoint to retrieve map information from War Thunder",
                    operationId: "getMapInfo",
                    responses: {
                        "200": {
                            description: "Map information retrieved successfully",
                            content: { "application/json": { schema: mapInfoSchema } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/map_objects": {
                get: {
                    tags: ["Official_API"],
                    summary: "Get Map Objects",
                    description: "Endpoint to retrieve map objects from War Thunder",
                    operationId: "getMapObjects",
                    responses: {
                        "200": {
                            description: "Map objects retrieved successfully",
                            content: { "application/json": { schema: { type: "array", items: mapObjectSchema } } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/map_img": {
                get: {
                    tags: ["Official_API"],
                    summary: "Get Map Image",
                    description:
                        "Endpoint to retrieve the map image from War Thunder (binary image). " +
                        "Add ?as_base64=true to get a JSON base64 string.",
                    operationId: "getMapImage",
                    parameters: [
                        {
                            name: "as_base64",
                            in: "query",
                            required: false,
                            schema: { type: "boolean", default: false },
                            description: "Si true, renvoie { content, content_type } en JSON plutôt qu'un flux binaire."
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Map image retrieved successfully",
                            content: {
                                "image/*": { schema: { type: "string", format: "binary" } },
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            content: { type: "string", format: "byte" },
                                            content_type: { type: "string", example: "image/png" }
                                        }
                                    }
                                }
                            }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/state": {
                get: {
                    tags: ["Official_API"],
                    summary: "Get State",
                    description: "Endpoint to retrieve the current state from War Thunder",
                    operationId: "getState",
                    responses: {
                        "200": {
                            description: "State retrieved successfully",
                            content: { "application/json": { schema: stateSchema } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/gyroscope": {
                get: {
                    tags: ["Custom_API"],
                    summary: "Get Gyroscope Data",
                    description: "Endpoint to retrieve gyroscope data from War Thunder",
                    operationId: "getGyroscope",
                    responses: {
                        "200": {
                            description: "Gyroscope data retrieved successfully",
                            content: { "application/json": { schema: gyroscopeSchema } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/compass": {
                get: {
                    tags: ["Custom_API"],
                    summary: "Get Compass Data",
                    description: "Endpoint to retrieve compass data from War Thunder",
                    operationId: "getCompass",
                    responses: {
                        "200": {
                            description: "Compass data retrieved successfully",
                            content: { "application/json": { schema: compassSchema } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/speed": {
                get: {
                    tags: ["Custom_API"],
                    summary: "Get Speed Data",
                    description: "Endpoint to retrieve speed data from War Thunder",
                    operationId: "getSpeed",
                    responses: {
                        "200": {
                            description: "Speed data retrieved successfully",
                            content: { "application/json": { schema: { type: "number", example: 250.0 } } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v1/altitude": {
                get: {
                    tags: ["Custom_API"],
                    summary: "Get Altitude Data",
                    description: "Endpoint to retrieve altitude data from War Thunder",
                    operationId: "getAltitude",
                    responses: {
                        "200": {
                            description: "Altitude data retrieved successfully",
                            content: { "application/json": { schema: { type: "number", example: 1500.0 } } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            },
            "/api/v2/altitude": {
                get: {
                    tags: ["Custom_API"],
                    summary: "Get Altitude Data V2",
                    description: "Endpoint to retrieve altitude data from War Thunder with gear status",
                    operationId: "getAltitudeV2",
                    responses: {
                        "200": {
                            description: "Altitude data retrieved successfully",
                            content: { "application/json": { schema: altitudeV2Schema } }
                        },
                        "502": upstreamErrorResponse
                    }
                }
            }
        }
    };
}
