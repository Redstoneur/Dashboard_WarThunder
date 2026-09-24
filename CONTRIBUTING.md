# Guide de contribution

Merci de votre intérêt pour **WarThunder Dashboard** ! Ce document explique comment
mettre en place l'environnement de développement, les conventions du projet et le
processus de contribution.

## Sommaire

- [Structure du dépôt](#structure-du-dépôt)
- [Mise en place de l'environnement](#mise-en-place-de-lenvironnement)
- [Workflow Git](#workflow-git)
- [Style de code](#style-de-code)
- [Tests](#tests)
- [Ouvrir une Pull Request](#ouvrir-une-pull-request)
- [Signaler un bug / proposer une fonctionnalité](#signaler-un-bug--proposer-une-fonctionnalité)

## Structure du dépôt

```
.
├── backend/     # API Node.js/TypeScript (voir backend/README.md)
├── frontend/    # Dashboard React/TypeScript (voir frontend/README.md)
├── docker-compose.yml
└── .env.example
```

## Mise en place de l'environnement

Prérequis : Node.js >= 20, npm >= 10, et optionnellement Docker.

```bash
git clone <repo>
cd Dashboard_WarThunder

cd backend && npm install && cp .env.example .env && cd ..
cd frontend && npm install && cp .env.example .env && cd ..
```

Le serveur War Thunder d'origine (la machine sur laquelle le jeu tourne) n'étant pas
toujours disponible pendant le développement, le backend fonctionne en mode "fallback"
par défaut (`UPSTREAM_FALLBACK_ENABLED=true`) : il répond avec des données neutres au lieu
d'échouer. Voir [backend/README.md](./backend/README.md#comportement-hors-ligne-fallback).

## Workflow Git

1. Créez une branche depuis `main` : `git checkout -b feat/ma-fonctionnalite`.
2. Faites des commits atomiques et descriptifs (préférence pour le format
   [Conventional Commits](https://www.conventionalcommits.org/) : `feat: ...`, `fix: ...`,
   `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`).
3. Poussez votre branche et ouvrez une Pull Request vers `main`.

## Style de code

- **TypeScript strict** activé sur les deux projets (`tsconfig.json`) : évitez `any`,
  préférez des types explicites.
- **ESLint** doit passer sans erreur avant toute PR :
  ```bash
  cd backend && npm run lint
  cd frontend && npm run lint
  ```
- Commentez uniquement le code qui en a besoin (logique non triviale) ; le code doit
  rester lisible par lui-même autant que possible.
- Respectez la structure de dossiers existante (`api/`, `components/`, `hooks/`, `services/`,
  `routes/`, `types/`...).

## Tests

```bash
cd backend && npm test
```

> Le serveur War Thunder d'origine n'étant pas disponible en environnement de
> développement/CI, les tests backend couvrent actuellement la logique de fallback et les
> utilitaires purs. Des tests d'intégration contre une vraie instance de War Thunder
> pourront être ajoutés ultérieurement — les contributions dans ce sens sont bienvenues.

Avant de proposer une PR, vérifiez aussi que les deux projets compilent :

```bash
cd backend && npm run build
cd frontend && npm run build
```

Et, si vous touchez aux Dockerfiles ou au `docker-compose.yml` :

```bash
docker compose build
docker compose up -d
docker compose down
```

## Ouvrir une Pull Request

- Décrivez clairement le problème résolu ou la fonctionnalité ajoutée.
- Indiquez les étapes de test manuel effectuées (captures d'écran bienvenues pour les
  changements d'interface).
- Gardez les PR focalisées sur un seul sujet autant que possible.

## Signaler un bug / proposer une fonctionnalité

Ouvrez une issue en décrivant :

- Le comportement observé vs. attendu.
- Les étapes de reproduction.
- Votre environnement (OS, version de Node.js, backend/frontend en Docker ou non).
