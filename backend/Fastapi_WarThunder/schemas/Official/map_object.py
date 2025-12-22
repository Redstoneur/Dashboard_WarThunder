from typing import List, Optional

from pydantic import BaseModel

from .Enum.map_object_icon import MapObjectIcon
from .Enum.map_object_icon_bg import MapObjectIconBg
from .Enum.map_object_type import MapObjectType


class MapObjectModel(BaseModel):
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
