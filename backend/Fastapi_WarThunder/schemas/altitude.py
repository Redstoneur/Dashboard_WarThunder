"""
Module de schéma pour représenter les données d'altitude.
"""

from pydantic import BaseModel


class AltitudeModel(BaseModel):
    """
    Représente les données d'altitude.

    :param altitude_meters: altitude en mètres.
    :type altitude_meters: float
    :param gear_deployed: indique si le train d'atterrissage est déployé.
    :type gear_deployed: bool

    :return: instance de AltitudeModel
    :except: Aucun
    """

    altitude_meters: float
    gear_deployed: bool
