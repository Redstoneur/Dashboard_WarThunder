"""
Entrypoint pour démarrer l'application FastAPI War Thunder.

Ce module expose la fonction `main()` qui parse les arguments CLI et démarre Uvicorn.
"""

import argparse

import uvicorn

from Fastapi_WarThunder import App


def main():
    """
    Parse les arguments de ligne de commande et démarre le serveur Uvicorn contenant l'application FastAPI.

    :param: (aucun) Les paramètres sont lus depuis la ligne de commande :
        --host (str): hôte pour Uvicorn (défaut: "localhost").
        --port (int): port pour Uvicorn (défaut: 8000).
        --war-thunder-ip (str): IP du serveur War Thunder (défaut: "localhost").
        --war-thunder-port (int): port du serveur War Thunder (défaut: 8111).
    :return: None
    :except: SystemExit si l'analyse des arguments échoue ou si argparse termine le programme.
    """
    parser = argparse.ArgumentParser(description="Run the FastAPI War Thunder application.")
    parser.add_argument("--host", type=str, default="localhost",
                        help="Host address to run the server on.")
    parser.add_argument("--port", type=int, default=8000,
                        help="Port number to run the server on.")
    parser.add_argument("--war-thunder-ip", type=str, default="localhost",
                        help="IP address of the War Thunder server.")
    parser.add_argument("--war-thunder-port", type=int, default=8111,
                        help="Port number of the War Thunder server.")

    args = parser.parse_args()

    app = App(
        IP_SERVER_WAR_THUNDER=args.war_thunder_ip,
        PORT_SERVER_WAR_THUNDER=args.war_thunder_port
    )

    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
