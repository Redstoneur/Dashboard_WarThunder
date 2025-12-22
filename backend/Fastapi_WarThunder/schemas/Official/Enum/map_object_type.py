from enum import Enum


class MapObjectType(str, Enum):
    AIRCRAFT = "aircraft"
    GROUND_MODEL = "ground_model"
    AIRFIELD = "airfield"
    BOMBING_POINT = "bombing_point"
