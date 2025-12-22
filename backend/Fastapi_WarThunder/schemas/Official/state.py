"""
Modèle Pydantic pour représenter l'état du véhicule/joueur (contrôles, capteurs, moteurs...).
"""

from typing import Optional

from pydantic import BaseModel


class StateModel(BaseModel):
    """
    Modèle représentant l'état du véhicule/joueur (contrôles, capteurs, moteurs...).

    :param valid: indique si les données sont valides.
    :type valid: bool
    :param aileron: position de l'aileron (optionnel, -1..1 typiquement).
    :type aileron: Optional[float]
    :param elevator: position de l'élévateur (optionnel).
    :type elevator: Optional[float]
    :param rudder: position du palonnier (optionnel).
    :type rudder: Optional[float]
    :param flaps: position des volets (optionnel).
    :type flaps: Optional[float]
    :param gear: position du train d'atterrissage (optionnel).
    :type gear: Optional[float]
    :param airbrake: position de l'aérofrein (optionnel).
    :type airbrake: Optional[float]
    :param H_m: altitude en mètres (optionnel).
    :type H_m: Optional[float]
    :param TAS_kmh: vitesse vraie en km/h (optionnel).
    :type TAS_kmh: Optional[float]
    :param IAS_kmh: vitesse indiquée en km/h (optionnel).
    :type IAS_kmh: Optional[float]
    :param M: nombre de Mach (optionnel).
    :type M: Optional[float]
    :param AoA_deg: angle d'attaque en degrés (optionnel).
    :type AoA_deg: Optional[float]
    :param AoS_deg: angle de dérapage en degrés (optionnel).
    :type AoS_deg: Optional[float]
    :param Ny: charge g verticale (optionnel).
    :type Ny: Optional[float]
    :param Vy_ms: vitesse verticale en m/s (optionnel).
    :type Vy_ms: Optional[float]
    :param Wx_deg_s: vitesse de roulis en degrés/s (optionnel).
    :type Wx_deg_s: Optional[float]
    :param Mfuel_kg: masse de carburant restante en kg (optionnel).
    :type Mfuel_kg: Optional[float]
    :param Mfuel0_kg: masse de carburant initiale en kg (optionnel).
    :type Mfuel0_kg: Optional[float]
    :param throttle1_percent: position de la manette des gaz moteur 1 en pourcentage (optionnel).
    :type throttle1_percent: Optional[float]
    :param RPM_throttle1_percent: position de la manette des RPM moteur 1 en pourcentage (optionnel).
    :type RPM_throttle1_percent: Optional[float]
    :param mixture1_percent: position de la manette de mélange moteur 1 en pourcentage (optionnel).
    :type mixture1_percent: Optional[float]
    :param radiator1_percent: position du radiateur moteur 1 en pourcentage (optionnel).
    :type radiator1_percent: Optional[float]
    :param compressor_stage1: étage du compresseur moteur 1 (optionnel).
    :type compressor_stage1: Optional[int]
    :param magneto1: position de l'allumage moteur 1 (optionnel).
    :type magneto1: Optional[int]
    :param power1_hp: puissance du moteur 1 en chevaux (optionnel).
    :type power1_hp: Optional[float]
    :param RPM1: régime moteur 1 en tours/minute (optionnel).
    :type RPM1: Optional[float]
    :param manifold_pressure1_atm: pression du collecteur moteur 1 en atmosphères (optionnel).
    :type manifold_pressure1_atm: Optional[float]
    :param oil_temp1_C: température d'huile moteur 1 en degrés Celsius (optionnel).
    :type oil_temp1_C: Optional[float]
    :param pitch1_deg: pas de l'hélice moteur 1 en degrés (optionnel).
    :type pitch1_deg: Optional[float]
    :param thrust1_kg: poussée moteur 1 en kg (optionnel).
    :type thrust1_kg: Optional[float]
    :param efficiency1_percent: efficacité moteur 1 en pourcentage (optionnel).
    :type efficiency1_percent: Optional[float]

    :return: StateModel
    :except: ValidationError si les données ne correspondent pas au modèle Pydantic.
    """
    valid: bool
    aileron: Optional[float]
    elevator: Optional[float]
    rudder: Optional[float]
    flaps: Optional[float]
    gear: Optional[float]
    airbrake: Optional[float]
    H_m: Optional[float]
    TAS_kmh: Optional[float]
    IAS_kmh: Optional[float]
    M: Optional[float]
    AoA_deg: Optional[float]
    AoS_deg: Optional[float]
    Ny: Optional[float]
    Vy_ms: Optional[float]
    Wx_deg_s: Optional[float]
    Mfuel_kg: Optional[float]
    Mfuel0_kg: Optional[float]
    throttle1_percent: Optional[float]
    RPM_throttle1_percent: Optional[float]
    mixture1_percent: Optional[float]
    radiator1_percent: Optional[float]
    compressor_stage1: Optional[int]
    magneto1: Optional[int]
    power1_hp: Optional[float]
    RPM1: Optional[float]
    manifold_pressure1_atm: Optional[float]
    oil_temp1_C: Optional[float]
    pitch1_deg: Optional[float]
    thrust1_kg: Optional[float]
    efficiency1_percent: Optional[float]
