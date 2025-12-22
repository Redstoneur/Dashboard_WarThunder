from enum import Enum

class MapObjectIcon(str, Enum):
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
