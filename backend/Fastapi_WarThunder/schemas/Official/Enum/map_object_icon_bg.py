"""
Enumeration for Map Object Icon Backgrounds in War Thunder
"""

from enum import Enum


class MapObjectIconBg(str, Enum):
    """
    Enum representing different background styles for map object icons in War Thunder.
    Currently, only the 'none' background style is defined.
    """
    NONE = "none"
