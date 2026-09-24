# War Thunder Dashboard — Backend

API Node.js/TypeScript qui relaie les données télémétriques exposées localement par
**War Thunder** (`http://<ip-du-jeu>:8111/...`) vers le tableau de bord frontend, avec un
schéma de données stable, validé et documenté.

Ce backend est une réécriture 1:1 (mêmes routes, même comportement) de l'ancien backend
Python/FastAPI, en Node.js + TypeScript + Express.

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Endpoints](#endpoints)
- [Comportement hors-ligne (fallback)](#comportement-hors-ligne-fallback)
- [Tests](#tests)
- [Docker](#docker)

## Prérequis

- Node.js >= 20
- npm >= 10

## Installation

```bash
cd backend
npm install
```

## Configuration

Toute la configuration se fait par variables d'environnement (voir `.env.example`) ou
par arguments CLI (priorité la plus haute), pour rester compatible avec l'ancien script
`main.py --host ... --port ... --war-thunder-ip ... --war-thunder-port ...`.

```bash
cp .env.example .env
```

| Variable                     | Défaut      | Description                                                              |
|-------------------------------|-------------|---------------------------------------------------------------------------|
| `HOST`                        | `0.0.0.0`   | Adresse d'écoute du serveur API                                          |
| `PORT`                        | `8000`      | Port d'écoute du serveur API                                             |
| `WAR_THUNDER_IP`               | `localhost` | Adresse IP de la machine sur laquelle tourne War Thunder                 |
| `WAR_THUNDER_PORT`             | `8111`      | Port de l'API locale exposée par War Thunder                             |
| `WAR_THUNDER_TIMEOUT_MS`       | `5000`      | Timeout (ms) des appels JSON vers War Thunder                            |
| `WAR_THUNDER_IMG_TIMEOUT_MS`   | `10000`     | Timeout (ms) de récupération de l'image de la carte                      |
| `UPSTREAM_FALLBACK_ENABLED`    | `true`      | Renvoyer des données par défaut plutôt qu'une erreur 502 si le jeu est off |
| `CORS_ORIGIN`                  | `*`         | Origines autorisées (séparées par des virgules) ou `*`                   |
| `LOG_LEVEL`                    | `info`      | `debug` \| `info` \| `warn` \| `error`                                    |

Arguments CLI équivalents: `--host`, `--port`, `--war-thunder-ip`, `--war-thunder-port`.

## Démarrage

```bash
npm run dev     # mode développement (rechargement automatique via tsx)
npm run build   # compilation TypeScript -> dist/
npm start        # démarre la version compilée (dist/index.js)
```

## Endpoints

Tous les endpoints sont préfixés par `/api/v1` (ou `/api/v2` pour l'altitude enrichie),
à l'identique de l'ancien backend FastAPI.

| Méthode | Route                 | Description                                             |
|---------|------------------------|-----------------------------------------------------------|
| GET     | `/api/v1/status`       | État de l'API + connectivité au serveur War Thunder       |
| GET     | `/api/v1/indicators`   | Indicateurs bruts de vol/véhicule                          |
| GET     | `/api/v1/map_info`     | Informations de grille/bornes de la carte                  |
| GET     | `/api/v1/map_objects`  | Objets affichés sur la carte (avions, véhicules...)         |
| GET     | `/api/v1/map_img`      | Image de la carte (binaire, ou JSON base64 avec `?as_base64=true`) |
| GET     | `/api/v1/state`        | État détaillé du véhicule/joueur                            |
| GET     | `/api/v1/gyroscope`    | Données calculées du gyroscope                              |
| GET     | `/api/v1/compass`      | Données calculées de la boussole                             |
| GET     | `/api/v1/speed`        | Vitesse actuelle (km/h)                                      |
| GET     | `/api/v1/altitude`     | Altitude actuelle (m)                                        |
| GET     | `/api/v2/altitude`     | Altitude actuelle (m) + état du train d'atterrissage          |

## Comportement hors-ligne (fallback)

La machine de jeu (serveur d'origine War Thunder) n'est pas toujours allumée/joignable.
Par défaut (`UPSTREAM_FALLBACK_ENABLED=true`), lorsque le jeu est injoignable, l'API répond
quand même en HTTP 200 avec des données de base neutres (`valid: false`, valeurs à `0`/`null`)
plutôt que de renvoyer une erreur, afin que le frontend reste utilisable et affiche un état
"hors-ligne" clair. `GET /api/v1/status` expose ce diagnostic (`upstream.reachable`).

Pour retrouver le comportement historique (erreur `502 Bad Gateway` si le jeu est injoignable),
mettre `UPSTREAM_FALLBACK_ENABLED=false`.

## Tests

```bash
npm test
```

> ℹ️ Le serveur War Thunder d'origine (la machine sur laquelle le jeu tourne) n'étant pas
> disponible en environnement de CI/dev, les tests actuels couvrent la logique de fallback
> (upstream injoignable) et les utilitaires purs (boussole...). Des tests d'intégration
> plus poussés contre une vraie instance de War Thunder pourront être ajoutés par la suite.

## Docker

Voir le [`Dockerfile`](./Dockerfile) et le [`docker-compose.yml`](../docker-compose.yml) à la
racine du projet pour un déploiement conteneurisé complet (backend + frontend).
