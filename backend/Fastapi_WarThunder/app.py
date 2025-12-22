from fastapi import FastAPI, HTTPException
from httpx import AsyncClient

from .schemas import (
    IndicatorsModel,
    MapInfoModel,
    MapObjectModel,
    MapObjectType,
    MapObjectIcon,
    MapObjectIconBg,
    StateModel,
    Status
)


class App(FastAPI):
    API_WAR_THUNDER_INDICATORS: str = "indicators"
    API_WAR_THUNDER_STATE: str = "state"
    API_WAR_THUNDER_MAP_INFO: str = "map_info.json"
    API_WAR_THUNDER_MAP_OBJ: str = "map_obj.json"

    def __init__(
            self,
            IP_SERVER_WAR_THUNDER: str = "localhost",
            PORT_SERVER_WAR_THUNDER: int = 8111
    ):
        self.API_WAR_THUNDER_INDICATORS = (
            f"http://{IP_SERVER_WAR_THUNDER}:{PORT_SERVER_WAR_THUNDER}"
            f"/{self.API_WAR_THUNDER_INDICATORS}"
        )
        self.API_WAR_THUNDER_STATE = (
            f"http://{IP_SERVER_WAR_THUNDER}:{PORT_SERVER_WAR_THUNDER}"
            f"/{self.API_WAR_THUNDER_STATE}"
        )
        self.API_WAR_THUNDER_MAP_INFO = (
            f"http://{IP_SERVER_WAR_THUNDER}:{PORT_SERVER_WAR_THUNDER}"
            f"/{self.API_WAR_THUNDER_MAP_INFO}"
        )
        self.API_WAR_THUNDER_MAP_OBJ = (
            f"http://{IP_SERVER_WAR_THUNDER}:{PORT_SERVER_WAR_THUNDER}"
            f"/{self.API_WAR_THUNDER_MAP_OBJ}"
        )

        super().__init__()
        self.title = "War Thunder API"
        self.version = "1.0.0"
        self.description = "API for War Thunder related functionalities"
        self.add_routes()

    def add_routes(self):
        @self.get(
            path="/status",
            tags=["Status"],
            summary="Get API status",
            response_model=Status,
            description="Endpoint to check the status of the War Thunder API",
            responses={
                200: {
                    "description": "API is running smoothly",
                    "content": {
                        "application/json": {
                            "example": {
                                "status": "ok",
                                "message": "API is running smoothly"
                            }
                        }
                    }
                }
            }
        )
        async def status():
            return Status(status="ok", message="API is running smoothly")

        @self.get(
            path="/indicators",
            tags=["Official API"],
            summary="Get Indicators",
            response_model=IndicatorsModel,
            description="Endpoint to retrieve indicators from War Thunder",
            responses={
                200: {
                    "description": "Indicators retrieved successfully",
                    "content": {
                        "application/json": {
                            "example": {
                                "valid": True,
                                "army": "air",
                                "type": "a-35b",
                                "speed": 56.370514,
                                "vario": 0.894729,
                                "altitude_hour": 587.537109,
                                "altitude_min": 587.537109,
                                "altitude_10k": 20587.537109,
                                "aviahorizon_roll": 1.046103,
                                "aviahorizon_pitch": -2.297865,
                                "bank": -0.011222,
                                "turn": -0.002271,
                                "compass": 2.98323,
                                "compass2": 2.98323,
                                "manifold_pressure": 1.12111,
                                "rpm": 2600.080566,
                                "oil_pressure": 1,
                                "oil_temperature": 87.46225,
                                "head_temperature": 229.549255,
                                "head_temperature1": -273.149994,
                                "fuel": 780,
                                "fuel_pressure": 10.985527,
                                "gear_lamp_down": 0,
                                "gear_lamp_up": 0,
                                "gear_lamp_off": 0,
                                "blister1": 0,
                                "blister2": 0,
                                "blister3": 0,
                                "blister4": 0
                            }
                        }
                    }
                },
                502: {
                    "description": "Upstream service unreachable",
                    "content": {
                        "application/json": {
                            "example": {
                                "detail": "Upstream service unreachable: <error details>"
                            }
                        }
                    }
                }
            }
        )
        async def get_indicators():
            try:
                async with AsyncClient(timeout=5.0) as client:
                    response = await client.get(self.API_WAR_THUNDER_INDICATORS)
                    response.raise_for_status()
                    data = response.json()
                    return IndicatorsModel(**data)
            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Upstream service unreachable: {exc}")

        @self.get(
            path="/map_info",
            tags=["Official API"],
            summary="Get Map Info",
            response_model=MapInfoModel,
            description="Endpoint to retrieve map information from War Thunder",
            responses={
                200: {
                    "description": "Map information retrieved successfully",
                    "content": {
                        "application/json": {
                            "example": {
                                "grid_size": [52719.3984375, 55385.30078125],
                                "grid_steps": [5500, 5500],
                                "grid_zero": [6494.30078125, 19547.5],
                                "hud_type": 0,
                                "map_generation": 1,
                                "map_max": [65536, 65536],
                                "map_min": [-65536, -65536],
                                "valid": True
                            }
                        }
                    }
                },
                502: {
                    "description": "Upstream service unreachable",
                    "content": {
                        "application/json": {
                            "example": {
                                "detail": "Upstream service unreachable: <error details>"
                            }
                        }
                    }
                }
            }
        )
        async def get_map_info():
            try:
                async with AsyncClient(timeout=5.0) as client:
                    response = await client.get(self.API_WAR_THUNDER_MAP_INFO)
                    response.raise_for_status()
                    data = response.json()
                    return MapInfoModel(**data)
            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Upstream service unreachable: {exc}")

        @self.get(
            path="/map_objects",
            tags=["Official API"],
            summary="Get Map Objects",
            response_model=list[MapObjectModel],
            description="Endpoint to retrieve map objects from War Thunder",
            responses={
                200: {
                    "description": "Map objects retrieved successfully",
                    "content": {
                        "application/json": {
                            "example": [
                                {
                                    "type": "airfield",
                                    "color": "#174DFF",
                                    "color[]": [23, 77, 255],
                                    "blink": 0,
                                    "icon": "none",
                                    "icon_bg": "none",
                                    "sx": 0.688678,
                                    "sy": 0.488574,
                                    "ex": 0.664311,
                                    "ey": 0.490086
                                },
                                {
                                    "type": "aircraft",
                                    "color": "#faC81E",
                                    "color[]": [250, 200, 30],
                                    "blink": 0,
                                    "icon": "Player",
                                    "icon_bg": "none",
                                    "x": 0.559299,
                                    "y": 0.106122,
                                    "dx": -0.998621,
                                    "dy": 0.052501
                                },
                                {
                                    "type": "aircraft",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "Fighter",
                                    "icon_bg": "none",
                                    "x": 0.6697,
                                    "y": 0.485733,
                                    "dx": -0.130964,
                                    "dy": 0.991387
                                },
                                {
                                    "type": "aircraft",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "Fighter",
                                    "icon_bg": "none",
                                    "x": 0.682609,
                                    "y": 0.522149,
                                    "dx": 0.86716,
                                    "dy": -0.49803
                                },
                                {
                                    "type": "aircraft",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "Fighter",
                                    "icon_bg": "none",
                                    "x": 0.491215,
                                    "y": 0.42224,
                                    "dx": -0.164522,
                                    "dy": -0.986373
                                },
                                {
                                    "type": "aircraft",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "Fighter",
                                    "icon_bg": "none",
                                    "x": 0.49696,
                                    "y": 0.474351,
                                    "dx": -0.264158,
                                    "dy": -0.964479
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "TorpedoBoat",
                                    "icon_bg": "none",
                                    "x": 0.613393,
                                    "y": 0.456899
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.654875,
                                    "y": 0.485577
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.654875,
                                    "y": 0.485196
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.655257,
                                    "y": 0.485577
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.655257,
                                    "y": 0.485196
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.654875,
                                    "y": 0.484051
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.654875,
                                    "y": 0.48367
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.655257,
                                    "y": 0.484051
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.655257,
                                    "y": 0.48367
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.654875,
                                    "y": 0.482525
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.654875,
                                    "y": 0.482144
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "MediumTank",
                                    "icon_bg": "none",
                                    "x": 0.653106,
                                    "y": 0.485577
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "MediumTank",
                                    "icon_bg": "none",
                                    "x": 0.653106,
                                    "y": 0.485196
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "MediumTank",
                                    "icon_bg": "none",
                                    "x": 0.653487,
                                    "y": 0.485577
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "MediumTank",
                                    "icon_bg": "none",
                                    "x": 0.653487,
                                    "y": 0.485196
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "MediumTank",
                                    "icon_bg": "none",
                                    "x": 0.653106,
                                    "y": 0.484051
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "MediumTank",
                                    "icon_bg": "none",
                                    "x": 0.653106,
                                    "y": 0.48367
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "SPAA",
                                    "icon_bg": "none",
                                    "x": 0.647668,
                                    "y": 0.517617
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "SPAA",
                                    "icon_bg": "none",
                                    "x": 0.648959,
                                    "y": 0.531147
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "SPAA",
                                    "icon_bg": "none",
                                    "x": 0.873688,
                                    "y": 0.604544
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.677005,
                                    "y": 0.529735
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.679923,
                                    "y": 0.52805
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.700817,
                                    "y": 0.489486
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "Boat",
                                    "icon_bg": "none",
                                    "x": 0.631806,
                                    "y": 0.496905
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "LightTank",
                                    "icon_bg": "none",
                                    "x": 0.701112,
                                    "y": 0.489877
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "TorpedoBoat",
                                    "icon_bg": "none",
                                    "x": 0.633429,
                                    "y": 0.469653
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "SPAA",
                                    "icon_bg": "none",
                                    "x": 0.650241,
                                    "y": 0.543748
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "SPAA",
                                    "icon_bg": "none",
                                    "x": 0.896519,
                                    "y": 0.591599
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "Ship",
                                    "icon_bg": "none",
                                    "x": 0.638286,
                                    "y": 0.481047
                                },
                                {
                                    "type": "ground_model",
                                    "color": "#f00C00",
                                    "color[]": [240, 12, 0],
                                    "blink": 2,
                                    "icon": "TorpedoBoat",
                                    "icon_bg": "none",
                                    "x": 0.612455,
                                    "y": 0.465629
                                },
                                {
                                    "type": "bombing_point",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "bombing_point",
                                    "icon_bg": "none",
                                    "x": 0.659695,
                                    "y": 0.456213
                                },
                                {
                                    "type": "bombing_point",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "bombing_point",
                                    "icon_bg": "none",
                                    "x": 0.671832,
                                    "y": 0.507061
                                },
                                {
                                    "type": "bombing_point",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "bombing_point",
                                    "icon_bg": "none",
                                    "x": 0.744518,
                                    "y": 0.470662
                                },
                                {
                                    "type": "bombing_point",
                                    "color": "#fa0C00",
                                    "color[]": [250, 12, 0],
                                    "blink": 0,
                                    "icon": "bombing_point",
                                    "icon_bg": "none",
                                    "x": 0.702789,
                                    "y": 0.517885
                                }
                            ]
                        }
                    }
                },
                502: {
                    "description": "Upstream service unreachable",
                    "content": {
                        "application/json": {
                            "example": {
                                "detail": "Upstream service unreachable: <error details>"
                            }
                        }
                    }
                }
            }
        )
        async def get_map_objects():
            try:
                async with AsyncClient(timeout=5.0) as client:
                    response = await client.get(self.API_WAR_THUNDER_MAP_OBJ)
                    response.raise_for_status()
                    data = response.json()
                    res: list[MapObjectModel] = []
                    for item in data:
                        res.append(MapObjectModel(
                            type=MapObjectType(item.get("type")),
                            icon=MapObjectIcon(item.get("icon")) if item.get("icon") else None,
                            icon_bg=MapObjectIconBg(item.get("icon_bg")) if item.get(
                                "icon_bg") else None,
                            color_hex=item.get("color"),
                            color_rgb=item.get("color[]"),
                            blink=item.get("blink"),
                            x=item.get("x"),
                            y=item.get("y"),
                            dx=item.get("dx"),
                            dy=item.get("dy"),
                            sx=item.get("sx"),
                            sy=item.get("sy"),
                            ex=item.get("ex"),
                            ey=item.get("ey")
                        ))
                    return res

            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Upstream service unreachable: {exc}")

        @self.get(
            path="/state",
            tags=["Official API"],
            summary="Get State",
            response_model=StateModel,
            description="Endpoint to retrieve the current state from War Thunder",
            responses={
                200: {
                    "description": "State retrieved successfully",
                    "content": {
                        "application/json": {
                            "example": {
                                "valid": True,
                                "aileron": 0,
                                "elevator": -35,
                                "rudder": -9,
                                "flaps": 100,
                                "gear": 0,
                                "airbrake": 0,
                                "H_m": 6473,
                                "TAS_kmh": 284,
                                "IAS_kmh": 203,
                                "M": 0.25,
                                "AoA_deg": 1.6,
                                "AoS_deg": 0,
                                "Ny": 1,
                                "Vy_ms": 0.3,
                                "Wx_deg_s": 0,
                                "Mfuel_kg": 780,
                                "Mfuel0_kg": 780,
                                "throttle1_percent": 110,
                                "RPM_throttle1_percent": 100,
                                "mixture1_percent": 100,
                                "radiator1_percent": 0,
                                "compressor_stage1": 2,
                                "magneto1": 3,
                                "power1_hp": 1133.3,
                                "RPM1": 2600,
                                "manifold_pressure1_atm": 1.09,
                                "oil_temp1_C": 85,
                                "pitch1_deg": 26.9,
                                "thrust1_kg": 1016,
                                "efficiency1_percent": 93
                            }
                        }
                    }
                },
                502: {
                    "description": "Upstream service unreachable",
                    "content": {
                        "application/json": {
                            "example": {
                                "detail": "Upstream service unreachable: <error details>"
                            }
                        }
                    }
                }
            }
        )
        async def get_state():
            try:
                async with AsyncClient(timeout=5.0) as client:
                    response = await client.get(self.API_WAR_THUNDER_STATE)
                    response.raise_for_status()
                    data = response.json()
                    return StateModel(
                        valid=data.get("valid", False),
                        aileron=data.get("aileron, %"),
                        elevator=data.get("elevator, %"),
                        rudder=data.get("rudder, %"),
                        flaps=data.get("flaps, %"),
                        gear=data.get("gear, %"),
                        airbrake=data.get("airbrake, %"),
                        H_m=data.get("H, m"),
                        TAS_kmh=data.get("TAS, km/h"),
                        IAS_kmh=data.get("IAS, km/h"),
                        M=data.get("M"),
                        AoA_deg=data.get("AoA, deg"),
                        AoS_deg=data.get("AoS, deg"),
                        Ny=data.get("Ny"),
                        Vy_ms=data.get("Vy, m/s"),
                        Wx_deg_s=data.get("Wx, deg/s"),
                        Mfuel_kg=data.get("Mfuel, kg"),
                        Mfuel0_kg=data.get("Mfuel0, kg"),
                        throttle1_percent=data.get("throttle 1, %"),
                        RPM_throttle1_percent=data.get("RPM throttle 1, %"),
                        mixture1_percent=data.get("mixture 1, %"),
                        radiator1_percent=data.get("radiator 1, %"),
                        compressor_stage1=data.get("compressor stage 1"),
                        magneto1=data.get("magneto 1"),
                        power1_hp=data.get("power 1, hp"),
                        RPM1=data.get("RPM 1"),
                        manifold_pressure1_atm=data.get("manifold pressure 1, atm"),
                        oil_temp1_C=data.get("oil temp 1, C"),
                        pitch1_deg=data.get("pitch 1, deg"),
                        thrust1_kg=data.get("thrust 1, kgs"),
                        efficiency1_percent=data.get("efficiency 1, %")
                    )
            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Upstream service unreachable: {exc}")
