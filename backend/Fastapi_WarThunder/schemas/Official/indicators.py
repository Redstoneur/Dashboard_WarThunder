from pydantic import BaseModel
from typing import Optional
from .Enum.army_enum import ArmyEnum


class IndicatorsModel(BaseModel):
    valid: bool
    army: ArmyEnum
    type: str  # Nom de l'avion ou véhicule
    speed: Optional[float]  # km/h ?
    vario: Optional[float]  # m/s
    altitude_hour: Optional[float]  # m
    altitude_min: Optional[float]  # m
    altitude_10k: Optional[float]  # m
    aviahorizon_roll: Optional[float]  # deg
    aviahorizon_pitch: Optional[float]  # deg
    bank: Optional[float]  # deg
    turn: Optional[float]  # deg/s
    compass: Optional[float]  # deg
    compass2: Optional[float]  # deg
    manifold_pressure: Optional[float]  # atm
    rpm: Optional[float]
    oil_pressure: Optional[float]
    oil_temperature: Optional[float]  # °C
    head_temperature: Optional[float]  # °C
    head_temperature1: Optional[float]  # °C
    fuel: Optional[float]  # kg
    fuel_pressure: Optional[float]
    gear_lamp_down: Optional[int]
    gear_lamp_up: Optional[int]
    gear_lamp_off: Optional[int]
    blister1: Optional[int]
    blister2: Optional[int]
    blister3: Optional[int]
    blister4: Optional[int]
