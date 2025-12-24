"""
Modèle des indicateurs de vol et de véhicule envoyés par l'API War Thunder.
"""

from typing import Optional

from pydantic import BaseModel

from .Enum.army_enum import ArmyEnum


class IndicatorsModel(BaseModel):
    """
    Modèle des indicateurs de vol et de véhicule envoyés par l'API War Thunder.

    :param valid: indique si les données sont valides.
    :type valid: bool
    :param army: armée/équipe (enum ArmyEnum).
    :type army: ArmyEnum
    :param type: type de véhicule/avion.
    :type type: str
    :param speed: vitesse en km/h (optionnel).
    :type speed: Optional[float]
    :param vario: vitesse verticale en m/s (optionnel).
    :type vario: Optional[float]
    :param altitude_hour: altitude horaire en mètres (optionnel).
    :type altitude_hour: Optional[float]
    :param altitude_min: altitude minimale en mètres (optionnel).
    :type altitude_min: Optional[float]
    :param altitude_10k: altitude à 10 km en mètres (optionnel).
    :type altitude_10k: Optional[float]
    :param aviahorizon_roll: inclinaison de l'horizon artificiel en degrés
    (optionnel).
    :type aviahorizon_roll: Optional[float]
    :param aviahorizon_pitch: tangage de l'horizon artificiel en degrés
    (optionnel).
    :type aviahorizon_pitch: Optional[float]
    :param bank: inclinaison de la banque en degrés (optionnel).
    :type bank: Optional[float]
    :param turn: taux de virage en degrés par seconde (optionnel).
    :type turn: Optional[float]
    :param compass: direction du compas en degrés (optionnel).
    :type compass: Optional[float]
    :param compass2: deuxième direction du compas en degrés (optionnel).
    :type compass2: Optional[float]
    :param manifold_pressure: pression du collecteur en atm (optionnel).
    :type manifold_pressure: Optional[float]
    :param rpm: tours par minute (optionnel).
    :type rpm: Optional[float]
    :param oil_pressure: pression d'huile (optionnel).
    :type oil_pressure: Optional[float]
    :param oil_temperature: température de l'huile en °C (optionnel).
    :type oil_temperature: Optional[float]
    :param head_temperature: température de la tête en °C (optionnel).
    :type head_temperature: Optional[float]
    :param head_temperature1: température de la tête 1 en °C (optionnel).
    :type head_temperature1: Optional[float]
    :param fuel: carburant en kg (optionnel).
    :type fuel: Optional[float]
    :param fuel_pressure: pression du carburant (optionnel).
    :type fuel_pressure: Optional[float]
    :param gear_lamp_down: indicateur de train baissé (optionnel).
    :type gear_lamp_down: Optional[int]
    :param gear_lamp_up: indicateur de train levé (optionnel).
    :type gear_lamp_up: Optional[int]
    :param gear_lamp_off: indicateur de train éteint (optionnel).
    :type gear_lamp_off: Optional[int]
    :param blister1: indicateur de bulle 1 (optionnel).
    :type blister1: Optional[int]
    :param blister2: indicateur de bulle 2 (optionnel).
    :type blister2: Optional[int]
    :param blister3: indicateur de bulle 3 (optionnel).
    :type blister3: Optional[int]
    :param blister4: indicateur de bulle 4 (optionnel).
    :type blister4: Optional[int]

    :return: IndicatorsModel
    :except: ValidationError si les données ne correspondent pas au modèle Pydantic.
    """
    valid: bool
    army: ArmyEnum
    type: str  # Nom de l'avion ou véhicule
    speed: Optional[float] = None  # km/h ?
    pedals: Optional[float] = None
    pedals1: Optional[float] = None
    pedals2: Optional[float] = None
    pedals3: Optional[float] = None
    pedals4: Optional[float] = None
    pedals5: Optional[float] = None
    stick_elevator: Optional[float] = None
    stick_ailerons2: Optional[float] = None
    vario: Optional[float] = None  # m/s
    altitude_hour: Optional[float] = None  # m
    altitude_min: Optional[float] = None  # m
    altitude_10k: Optional[float] = None  # m
    altitude1_min: Optional[float] = None  # m
    altitude1_10k: Optional[float] = None  # m
    aviahorizon_roll: Optional[float] = None  # deg
    aviahorizon_pitch: Optional[float] = None  # deg
    aviahorizon_roll1: Optional[float] = None  # deg
    aviahorizon_pitch1: Optional[float] = None  # deg
    bank: Optional[float] = None  # deg
    turn: Optional[float] = None  # deg/s
    compass: Optional[float] = None  # deg
    compass1: Optional[float] = None  # deg
    compass2: Optional[float] = None  # deg
    manifold_pressure: Optional[float] = None  # atm
    clock_hour: Optional[float] = None
    clock_min: Optional[float] = None
    clock_sec: Optional[float] = None
    rpm: Optional[float] = None
    rpm_min: Optional[float] = None
    rpm_hour: Optional[float] = None
    water_temperature: Optional[float] = None
    oil_pressure: Optional[float] = None
    oil_temperature: Optional[float] = None  # °C
    head_temperature: Optional[float] = None  # °C
    head_temperature1: Optional[float] = None  # °C
    fuel: Optional[float] = None  # kg
    fuel1: Optional[float] = None  # kg
    fuel_pressure: Optional[float] = None
    airbrake_lever: Optional[float] = None
    airbrake_indicator: Optional[float] = None
    gears: Optional[float] = None
    gear_lamp_down: Optional[int] = None
    gear_lamp_up: Optional[int] = None
    gear_lamp_off: Optional[int] = None
    trimmer: Optional[float] = None
    throttle: Optional[float] = None
    weapon1: Optional[float] = None
    weapon2: Optional[float] = None
    weapon3: Optional[float] = None
    weapon4: Optional[float] = None
    mach: Optional[float] = None
    g_meter: Optional[float] = None
    g_meter_max: Optional[float] = None
    aoa: Optional[float] = None
    blister1: Optional[int] = None
    blister2: Optional[int] = None
    blister3: Optional[int] = None
    blister4: Optional[int] = None
    blister5: Optional[int] = None
    blister6: Optional[int] = None
    blister7: Optional[int] = None
