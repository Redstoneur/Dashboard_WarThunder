"""
Init file for Official Enum schemas.
"""

from .army_enum import ArmyEnum
from .map_object_icon import MapObjectIcon
from .map_object_icon_bg import MapObjectIconBg
from .map_object_type import MapObjectType

__all__ = [
    "ArmyEnum",
    "MapObjectIcon",
    "MapObjectType",
    "MapObjectIconBg"
]
