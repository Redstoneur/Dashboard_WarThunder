"""
Modèle Pydantic pour les informations de la carte de l'API officielle de War Thunder.
"""

from typing import List, Optional

from pydantic import BaseModel


class MapInfoModel(BaseModel):
    """
    Modèle décrivant les informations de la carte fournies par l'API War Thunder.

    :param grid_size: taille de la grille de la carte (largeur, hauteur).
    :type grid_size: List[float]
    :param grid_steps: pas de la grille en unités de jeu.
    :type grid_steps: List[float]
    :param grid_zero: coordonnées du point zéro de la grille.
    :type grid_zero: List[float]
    :param hud_type: type d'affichage HUD (optionnel).
    :type hud_type: Optional[int]
    :param map_generation: version/identifiant de génération de la carte (optionnel).
    :type map_generation: Optional[int]
    :param map_max: coordonnées maximales présentes sur la carte.
    :type map_max: List[float]
    :param map_min: coordonnées minimales présentes sur la carte.
    :type map_min: List[float]
    :param valid: bool indiquant si les données sont valides.
    :type valid: bool
    :return: MapInfoModel
    :except: ValidationError si les données ne correspondent pas au modèle Pydantic.
    """
    grid_size: List[float]
    grid_steps: List[float]
    grid_zero: List[float]
    hud_type: Optional[int]
    map_generation: Optional[int]
    map_max: List[float]
    map_min: List[float]
    valid: bool
