from pydantic import BaseModel
from typing import List, Optional

class MapInfoModel(BaseModel):
    grid_size: List[float]
    grid_steps: List[float]
    grid_zero: List[float]
    hud_type: Optional[int]
    map_generation: Optional[int]
    map_max: List[float]
    map_min: List[float]
    valid: bool
