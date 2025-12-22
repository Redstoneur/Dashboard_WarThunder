"""
Modèle Pydantic pour représenter un objet sur la carte dans War Thunder.
"""

from typing import List, Optional

from pydantic import BaseModel

from .Enum.map_object_icon import MapObjectIcon
from .Enum.map_object_icon_bg import MapObjectIconBg
from .Enum.map_object_type import MapObjectType


class MapObjectModel(BaseModel):
    """
    Représente un objet sur la carte (avion, aérodrome, véhicule...).

    :param type: type de l'objet (MapObjectType enum).
    :type type: MapObjectType
    :param icon: icône correspondant à l'objet (optionnel).
    :type icon: Optional[MapObjectIcon]
    :param icon_bg: fond d'icône (optionnel).
    :type icon_bg: Optional[MapObjectIconBg]
    :param color_hex: couleur en hexadécimal (optionnel).
    :type color_hex: Optional[str]
    :param color_rgb: couleur en RGB (optionnel, [r,g,b]).
    :type color_rgb: Optional[List[int]]
    :param blink: indicateur clignotant (optionnel).
    :type blink: Optional[int]

    Position normalisée:
    :param x: coordonnée X normalisée (0-1) si présente.
    :param y: coordonnée Y normalisée (0-1) si présente.

    Direction:
    :param dx: vecteur direction X (optionnel).
    :param dy: vecteur direction Y (optionnel).

    Zones (pour aéroports):
    :param sx: start x (optionnel)
    :param sy: start y (optionnel)
    :param ex: end x (optionnel)
    :param ey: end y (optionnel)

    :return: MapObjectModel
    :except: ValidationError si les données ne correspondent pas au modèle Pydantic.
    """
    type: MapObjectType
    icon: Optional[MapObjectIcon]
    icon_bg: Optional[MapObjectIconBg]
    color_hex: Optional[str]
    color_rgb: Optional[List[int]]
    blink: Optional[int]

    # Position normalisée
    x: Optional[float]
    y: Optional[float]

    # Direction
    dx: Optional[float]
    dy: Optional[float]

    # Zones (pour airfields)
    sx: Optional[float]
    sy: Optional[float]
    ex: Optional[float]
    ey: Optional[float]
