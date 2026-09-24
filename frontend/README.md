# War Thunder Dashboard — Frontend

Tableau de bord web (React + TypeScript + Vite) affichant la télémétrie War Thunder en
temps réel : vitesse, altitude (avec alarme de proximité sol), boussole, horizon
artificiel (gyroscope) et carte tactique. Toutes les jauges sont dessinées en **SVG**
(pas d'images bitmap), pour rester nettes à toute résolution et faciles à styliser.

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Structure du projet](#structure-du-projet)
- [Fonctionnement hors-ligne](#fonctionnement-hors-ligne)
- [Docker](#docker)

## Prérequis

- Node.js >= 20
- Le backend (`../backend`) démarré, ou accessible via `VITE_API_BASE_URL`.

## Installation

```bash
cd frontend
npm install
```

## Configuration

```bash
cp .env.example .env
```

| Variable                              | Défaut                   | Description                                                        |
|----------------------------------------|---------------------------|----------------------------------------------------------------------|
| `VITE_API_BASE_URL`                    | *(vide)*                  | URL absolue du backend. Vide = requêtes relatives (proxy/Nginx)      |
| `VITE_DEV_API_PROXY_TARGET`             | `http://localhost:8000`   | Cible du proxy `/api` en développement (`npm run dev`)               |
| `VITE_DEV_PORT`                        | `5173`                    | Port du serveur de développement Vite                                |
| `VITE_POLL_STATUS_MS`                  | `5000`                    | Intervalle de polling du statut API                                  |
| `VITE_POLL_SPEED_MS`                   | `200`                     | Intervalle de polling de la vitesse                                  |
| `VITE_POLL_ALTITUDE_MS`                | `500`                     | Intervalle de polling de l'altitude                                  |
| `VITE_POLL_COMPASS_MS`                 | `100`                     | Intervalle de polling de la boussole                                 |
| `VITE_POLL_GYROSCOPE_MS`               | `100`                     | Intervalle de polling du gyroscope                                   |
| `VITE_POLL_MAP_MS`                     | `400`                     | Intervalle de polling des objets de la carte                         |
| `VITE_SPEED_MIN` / `VITE_SPEED_MAX`     | `0` / `1000`              | Plage (km/h) affichée par la jauge de vitesse                        |
| `VITE_ALTITUDE_MIN` / `VITE_ALTITUDE_MAX` | `0` / `3000`            | Plage (m) affichée par la jauge d'altitude                           |
| `VITE_ALTITUDE_ALARM_INTERMITTENT_M`   | `100`                     | Altitude (m, train rentré) sous laquelle l'alarme devient intermittente |
| `VITE_ALTITUDE_ALARM_CONTINUOUS_M`     | `50`                      | Altitude (m, train rentré) sous laquelle l'alarme devient continue    |

## Scripts

```bash
npm run dev       # serveur de développement (http://localhost:5173)
npm run build     # build de production (tsc + vite build) -> dist/
npm run preview   # sert le build de production localement
npm run lint      # ESLint
```

## Structure du projet

```
src/
  api/          # client HTTP (fetch) + types partagés avec le backend
  components/
    layout/     # Header, Footer
    widgets/    # SpeedWidget, AltitudeWidget, CompassWidget, GyroscopeWidget, MapWidget
    StatusBanner.tsx
  config/       # lecture des variables VITE_*
  hooks/        # usePolling, useSmoothedValue/Angle, useAltitudeAlarm
  styles/       # CSS (variables de thème + mise en page)
```

## Fonctionnement hors-ligne

Le composant `StatusBanner` interroge `GET /api/v1/status` : si le serveur War Thunder
d'origine (la machine sur laquelle le jeu tourne) est injoignable, une bannière d'alerte
s'affiche et chaque widget affiche "Signal perdu" tout en conservant des valeurs par
défaut cohérentes (grâce au fallback du backend), plutôt que de planter l'interface.

## Docker

Voir le [`Dockerfile`](./Dockerfile) (build Vite + service Nginx avec reverse-proxy `/api`
configurable via `BACKEND_HOST`/`BACKEND_PORT`) et le
[`docker-compose.yml`](../docker-compose.yml) à la racine du projet.
