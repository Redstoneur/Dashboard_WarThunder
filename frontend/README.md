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

## Affichage adaptatif

Sur ordinateur, les quatre instruments se répartissent par deux de chaque côté
de la carte ; les cadrans et leurs textes s'adaptent à la place disponible, et
le contenu ne fait pas défiler la page. La carte conserve les proportions de
son image, y compris en plein écran quand les instruments sont masqués.
Les filtres de types s'ouvrent au clic sans réduire la carte par défaut.
Si seule la télémétrie est visible, les quatre instruments occupent une ligne.
Sur téléphone (y compris en paysage), les instruments se placent au-dessus de
la carte et le défilement de la page est autorisé.

## Carte tactique

La carte s'ouvre en mode **Suivi de champ de bataille** : son cadrage s'adapte
aux positions des unités mobiles reçues du jeu (avions, véhicules et navires),
avec une marge autour de l'action. Quand les unités occupent toute la carte,
le zoom reste à 100 % ; sans unités, la carte entière est affichée.
Le mode **Suivi du joueur** garde sa position dans le champ avec un zoom fixe ;
il est indisponible tant que le jeu ne fournit pas sa position. Si cette
position disparaît pendant le suivi, la carte entière est affichée avec un
message ; le suivi reprend dès qu'elle réapparaît. Le **Mode manuel** fige la vue
courante et suspend les suivis.

Les boutons `+` et `−` et la molette de la souris permettent de régler le zoom
(la molette garde le point sous le curseur) ; le glisser-déposer permet de
déplacer la carte. Ces actions passent en mode manuel.
**Réinitialiser** revient au suivi de champ de bataille. La légende des couleurs
reste distincte des cases à cocher de la
légende des types, qui permettent de masquer séparément les symboles de chaque
famille. La case « Tout afficher » masque ou réaffiche tous les types en un clic
et indique un état intermédiaire lorsque seuls certains types sont visibles.
« Épingler les filtres » les maintient visibles sous la carte sans la recouvrir ;
ce choix est conservé après rechargement. « Détacher les filtres » rétablit le
panneau replié par défaut. Quand la fenêtre est basse, la liste épinglée
défile indépendamment pour préserver la place de la carte.
Le résumé de cette légende indique le nombre d'objets positionnés transmis par
le jeu, le nombre associé aux types activés et le détail par type (sur toute la
carte, pas uniquement dans la zone actuellement zoomée).
Les couleurs de chaque symbole proviennent des objets renvoyés par le
jeu. Les catégories « aérodrome / piste » et « objectif » reprennent les types
disponibles dans l'API ; celle-ci ne distingue pas davantage les différents
types de bases ou de pistes.

Les navires sont reconnus via les icônes ou types navals de l'API, inclus dans
le cadrage automatique et filtrables par famille. Le symbole du joueur suit
le cap fourni par `/api/v1/compass` (0° vers le nord, 90° vers l'est), sans
faire tourner la carte. Les autres unités et les symboles d'aérodrome sont
orientés par leur vecteur `dx`/`dy` quand le jeu le fournit ; en l'absence de
vecteur exploitable, leur symbole garde son orientation initiale. Les objectifs
et les zones restent fixes.

## Docker

Voir le [`Dockerfile`](./Dockerfile) (build Vite + service Nginx avec reverse-proxy `/api`
configurable via `BACKEND_HOST`/`BACKEND_PORT`) et le
[`docker-compose.yml`](../docker-compose.yml) à la racine du projet.
