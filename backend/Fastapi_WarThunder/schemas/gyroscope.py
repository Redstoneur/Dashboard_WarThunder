"""
Module de schéma pour représenter les données du gyroscope.
"""

from pydantic import BaseModel


class GyroscopeModel(BaseModel):
    """
    Représente les données du gyroscope.

    :param pitch: angle de tangage en degrés.
    :type pitch: float
    :param roll: angle de roulis en degrés.
    :type roll: float
    :param yaw: angle de lacet en degrés.
    :type yaw: float
    :param turn: taux de rotation en degrés par seconde.
    :type turn: float

    :return: instance de GyroscopeModel
    :except: Aucun
    """

    pitch: float
    roll: float
    yaw: float
    turn: float
