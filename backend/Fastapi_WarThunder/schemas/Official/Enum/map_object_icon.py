"""
Enumeration for Map Object Icons in War Thunder
"""

from enum import Enum


class MapObjectIcon(str, Enum):
    """
    Enum representing different icons for map objects in War Thunder.
    Icons include various vehicle types and a few special categories.
    """
    PLAYER = "Player"
    FIGHTER = "Fighter"
    LIGHT_TANK = "LightTank"
    MEDIUM_TANK = "MediumTank"
    SPAA = "SPAA"
    TORPEDO_BOAT = "TorpedoBoat"
    SHIP = "Ship"
    BOMBING_POINT = "bombing_point"
    BOAT = "boat"
    NONE = "none"
