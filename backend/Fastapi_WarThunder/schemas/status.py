"""
Module de schéma pour représenter l'état de l'API.
"""

from pydantic import BaseModel


class Status(BaseModel):
    """
    Représente l'état simple de l'API.

    :param status: code texte de l'état (ex: 'ok').
    :type status: str
    :param message: message lisible décrivant l'état.
    :type message: str
    :return: instance de Status
    :except: Aucun
    """

    status: str
    message: str