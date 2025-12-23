"""
Module de schéma pour représenter les données de la boussole.
"""

from enum import Enum

from pydantic import BaseModel


class CompassDirection(str, Enum):
    NORTH = "N"
    EAST = "E"
    SOUTH = "S"
    WEST = "W"
    NORTHEAST = "NE"
    SOUTHEAST = "SE"
    SOUTHWEST = "SW"
    NORTHWEST = "NW"

    @staticmethod
    def get_direction(heading: float) -> 'CompassDirection':
        if heading >= 337.5 or heading < 22.5:
            return CompassDirection.NORTH
        elif 22.5 <= heading < 67.5:
            return CompassDirection.NORTHEAST
        elif 67.5 <= heading < 112.5:
            return CompassDirection.EAST
        elif 112.5 <= heading < 157.5:
            return CompassDirection.SOUTHEAST
        elif 157.5 <= heading < 202.5:
            return CompassDirection.SOUTH
        elif 202.5 <= heading < 247.5:
            return CompassDirection.SOUTHWEST
        elif 247.5 <= heading < 292.5:
            return CompassDirection.WEST
        elif 292.5 <= heading < 337.5:
            return CompassDirection.NORTHWEST
        else:
            raise ValueError("Heading must be between 0 and 360 degrees")


class CompassModel(BaseModel):
    """
    Représente les données de la boussole.

    :param heading: cap en degrés.
    :type heading: float

    :return: instance de CompassModel
    :except: Aucun
    """

    heading: float
    direction: CompassDirection

    def __init__(self, heading: float):
        super().__init__(heading=heading, direction=CompassDirection.get_direction(heading))
