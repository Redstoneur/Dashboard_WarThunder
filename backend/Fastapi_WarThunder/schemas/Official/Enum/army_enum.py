"""
Enumeration for Armies in War Thunder
"""

from enum import Enum


class ArmyEnum(str, Enum):
    """
    Enum representing different armies in War Thunder.
    Includes air, ground, and navy categories.
    """
    AIR = "air"
    GROUND = "ground"
    NAVY = "navy"
