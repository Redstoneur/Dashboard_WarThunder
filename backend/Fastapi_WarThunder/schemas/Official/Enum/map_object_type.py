"""
Enumeration for Map Object Types in War Thunder.
"""

from enum import Enum


class MapObjectType(str, Enum):
    """
    Enum representing different types of map objects in War Thunder.
    Types include aircraft, ground models, airfields, and bombing points.
    """
    AIRCRAFT = "aircraft"
    GROUND_MODEL = "ground_model"
    AIRFIELD = "airfield"
    BOMBING_POINT = "bombing_point"
