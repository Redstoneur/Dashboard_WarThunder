import argparse

import uvicorn

from Fastapi_WarThunder import App


def main():
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
