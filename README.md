# WarThunder Dashboard

Tableau de bord web de télémétrie en temps réel pour **War Thunder**, affichant vitesse,
altitude (avec alarme de proximité sol), boussole, horizon artificiel (gyroscope) et carte
tactique, à partir de l'API locale exposée par le jeu (`http://<ip-du-jeu>:8111`).

Le projet est composé de deux services indépendants :

| Dossier                             | Rôle                                                                         | Stack                          |
|-------------------------------------|------------------------------------------------------------------------------|--------------------------------|
| [`backend/`](./backend/README.md)   | Relaye/normalise les données du serveur War Thunder vers une API JSON stable | Node.js + TypeScript + Express |
| [`frontend/`](./frontend/README.md) | Tableau de bord web (jauges SVG, carte, alarmes)                             | React + TypeScript + Vite      |

Chaque dossier a son propre `README.md` détaillé (configuration, scripts, tests).

## Démarrage rapide (Docker)

Prérequis : [Docker](https://www.docker.com/) + Docker Compose.

```bash
cp .env.example .env
# éditez .env : WAR_THUNDER_IP doit pointer vers la machine sur laquelle War Thunder tourne
docker compose up -d --build
```

- Frontend : http://localhost:8080
- Backend (API) : http://localhost:8000/api/v1/status
- Documentation API (Swagger) : http://localhost:8000/api/docs

Voir [Configuration](#configuration) ci-dessous pour la liste complète des variables.

> ℹ️ Si le jeu n'est pas lancé (serveur War Thunder injoignable), l'API et le dashboard
> restent fonctionnels et affichent un état "hors-ligne" avec des données de base, au lieu
> de planter (voir [backend/README.md](./backend/README.md#comportement-hors-ligne-fallback)).

### Où tourne War Thunder par rapport à Docker ?

`WAR_THUNDER_IP`/`WAR_THUNDER_PORT` (dans `.env`) désignent simplement la machine qui fait
tourner le jeu — le backend l'appelle en HTTP classique, aucun changement de code requis :

| Cas de figure                                   | Valeur de `WAR_THUNDER_IP`                                   |
|--------------------------------------------------|----------------------------------------------------------------|
| Le jeu tourne sur **la même machine** que Docker | `host.docker.internal` (déjà résolu vers l'hôte, cf. `docker-compose.yml`) |
| Le jeu tourne sur **une autre machine du LAN**    | IP locale de cette machine, ex. `192.168.1.42`                 |
| Le jeu tourne **hors du réseau local**            | Possible techniquement (IP publique/VPN), **déconseillé** : l'API du jeu n'est ni authentifiée ni chiffrée — ne l'exposez pas sur Internet sans protection (VPN/pare-feu). |

Détails complets dans [backend/README.md](./backend/README.md#connexion-au-serveur-war-thunder-local-ou-réseau-local).

## Démarrage rapide (sans Docker)

```bash
# Backend
cd backend
npm install
npm run dev            # http://localhost:8000

# Frontend (autre terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxy /api -> backend)
```

## Architecture

```
War Thunder (jeu, API locale :8111)
        │  HTTP (indicators / state / map_info.json / map_obj.json / map.img)
        ▼
   backend/ (Node.js + TypeScript + Express) — /api/v1, /api/v2
        │  HTTP JSON
        ▼
   frontend/ (React + TypeScript + Vite) — jauges SVG, carte, alarmes
```

## Configuration

Toute la stack est variabilisée via des fichiers `.env` (voir `.env.example` à chaque niveau) :

- [`.env.example`](./.env.example) (racine) : variables utilisées par `docker-compose.yml`.
- [`backend/.env.example`](./backend/.env.example) : configuration du serveur API (hôte/port,
  adresse du jeu, timeouts, CORS, fallback hors-ligne...).
- [`frontend/.env.example`](./frontend/.env.example) : URL de l'API, intervalles de polling,
  plages des jauges.

## Documentation

- [Backend — README](./backend/README.md)
- [Frontend — README](./frontend/README.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

## Licence

Distribué sous licence [GPL-3.0](./LICENSE).