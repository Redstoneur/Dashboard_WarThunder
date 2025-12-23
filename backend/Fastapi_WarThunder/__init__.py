"""
FastAPI War Thunder Module
"""

from .app import App
from .schemas import (
    ArmyEnum,
    MapObjectIcon,
    MapObjectType,
    MapObjectIconBg,
    IndicatorsModel,
    MapInfoModel,
    MapObjectModel,
    StateModel,
    CompassDirection,
    CompassModel,
    GyroscopeModel,
    Status
)

__version__ = "1.0.0"
__all__ = [
    "App",
    "ArmyEnum",
    "MapObjectIcon",
    "MapObjectType",
    "MapObjectIconBg",
    "IndicatorsModel",
    "MapInfoModel",
    "MapObjectModel",
    "StateModel",
    "CompassDirection",
    "CompassModel",
    "GyroscopeModel",
    "Status"
]
