"""
Modèle des indicateurs de vol et de véhicule envoyés par l'API War Thunder.
"""

from pydantic import BaseModel
from typing import Optional
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
