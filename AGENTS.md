# Instructions pour les agents IA

Ce document décrit la méthode de travail attendue pour tout agent IA intervenant
sur **War Thunder Dashboard**. Il complète les `README.md` et
[`CONTRIBUTING.md`](./CONTRIBUTING.md).

## 1. Objectif du projet

Le projet affiche dans un navigateur la télémétrie fournie par l'API locale de
War Thunder :

```text
War Thunder (:8111)
        |
        v
backend/  Node.js + TypeScript + Express
        |
        v
frontend/ React + TypeScript + Vite
```

Le backend relaie et normalise les données du jeu. Le frontend affiche les
instruments SVG, les états de connexion et la carte tactique. Le déploiement
complet est défini dans `docker-compose.yml`.

## 2. Documentation à consulter avant une modification

Lire les documents correspondant au périmètre traité :

- [`README.md`](./README.md) : architecture, démarrage et configuration globale ;
- [`backend/README.md`](./backend/README.md) : API, Swagger, fallback et connexion
  au serveur War Thunder ;
- [`frontend/README.md`](./frontend/README.md) : interface, carte, responsive et
  variables Vite ;
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) : conventions et processus de contribution ;
- [`backend/src/docs/openapi.ts`](./backend/src/docs/openapi.ts) : contrat OpenAPI.

Ne pas supposer que la documentation est exacte : la confronter au code avant
d'en tirer une conclusion. Si le comportement change, mettre à jour la
documentation concernée dans la même modification.

## 3. Méthode d'analyse

Avant de coder :

1. Vérifier l'état Git et préserver toutes les modifications existantes qui ne
   concernent pas la tâche.
2. Identifier les points d'entrée et suivre le flux réel des données jusqu'à
   l'affichage ou à la réponse HTTP.
3. Rechercher les implémentations, types, styles, tests et helpers existants
   avant d'ajouter du code.
4. Lire ensemble les fichiers directement liés afin d'éviter une correction
   locale incohérente avec le reste du projet.
5. Distinguer les faits vérifiés des hypothèses, notamment pour les données
   produites par War Thunder.

Pour une modification d'API, examiner au minimum :

- la route dans `backend/src/routes/` ;
- le service dans `backend/src/services/` ;
- les modèles dans `backend/src/types/` ;
- le contrat dans `backend/src/docs/openapi.ts` ;
- le client et les types dans `frontend/src/api/` ;
- les tests backend concernés.

Pour une modification d'interface, examiner au minimum :

- le composant concerné ;
- ses hooks et helpers ;
- `frontend/src/styles/App.css` et `frontend/src/styles/index.css` ;
- les variables de `frontend/src/config/env.ts` ;
- le comportement desktop, mobile et hors ligne.

## 4. Règles de développement

- Utiliser TypeScript strict et conserver des types explicites.
- Ne pas utiliser `any` ni masquer une erreur de type avec des assertions
  arbitraires.
- Réutiliser les helpers et composants existants au lieu de dupliquer leur
  logique.
- Faire des changements précis et limités au besoin exprimé.
- Ne pas modifier un comportement existant sans demande explicite.
- Ne pas laisser de code, import, export, style, dépendance ou fichier orphelin.
- Ne commenter que la logique qui n'est pas immédiatement compréhensible.
- Conserver les noms techniques en anglais et les textes visibles par
  l'utilisateur en français.
- Ne pas introduire de secret, d'adresse privée réelle ou de configuration
  personnelle dans le dépôt.
- Préférer une erreur explicite à un échec silencieux.
- Ne pas ajouter de nouvelle dépendance si les API natives ou le code existant
  suffisent.
- Mettre à jour les lockfiles avec le gestionnaire de paquets, jamais à la main.

## 5. Contraintes du backend

- Conserver les préfixes `/api/v1` et `/api/v2` ainsi que la compatibilité des
  réponses existantes.
- Le Swagger est disponible sur `/api/docs` et le document OpenAPI sur
  `/api/openapi.json`.
- Toute route ajoutée ou modifiée doit être répercutée dans OpenAPI.
- Les réponses brutes du jeu peuvent varier selon le véhicule et ne sont pas
  toutes validées à l'exécution. Ne pas restreindre artificiellement les types
  ou icônes inconnus fournis par War Thunder.
- Avec `UPSTREAM_FALLBACK_ENABLED=true`, l'indisponibilité du jeu doit produire
  les valeurs neutres définies dans `backend/src/services/defaults.ts`.
- Avec le fallback désactivé, une indisponibilité upstream doit rester visible
  sous la forme d'une erreur HTTP 502.
- `/api/v1/status` distingue la disponibilité du backend de celle du jeu.
- Respecter les timeouts configurables pour les données JSON et l'image de carte.
- Ne pas exposer l'API War Thunder directement sur Internet : elle ne fournit
  ni authentification ni chiffrement.

## 6. Contraintes du frontend

- Les instruments et symboles doivent rester vectoriels lorsque cela est
  pertinent.
- Le frontend doit rester utilisable quand le backend répond avec les données
  de fallback.
- Ne pas confondre « backend joignable » et « serveur War Thunder joignable ».
- Sur ordinateur, l'application doit utiliser la hauteur disponible sans
  provoquer de défilement global.
- Sur téléphone, les instruments sont placés au-dessus de la carte et le
  défilement vertical est autorisé.
- La carte doit conserver le ratio de son image : ne jamais l'étirer pour
  remplir artificiellement son conteneur.
- Préserver les trois modes de carte :
  `battlefield` par défaut, `player` et `manual`.
- Les actions de zoom ou de déplacement manuel doivent activer le mode manuel.
- La carte reste orientée nord vers le haut. Les symboles peuvent tourner selon
  leur cap ou leur vecteur.
- Les objets navals et les types inconnus doivent rester pris en charge.
- Les préférences persistantes doivent continuer à fonctionner si
  `localStorage` est indisponible.
- Toute variable `VITE_*` est injectée au moment du build, pas au runtime.
- Vérifier l'accessibilité des contrôles : libellés, focus, états
  `aria-pressed`, statut et navigation au clavier.

## 7. Configuration

Ne pas coder en dur une valeur déjà configurable. Les valeurs de référence se
trouvent dans :

- `.env.example` pour Docker Compose ;
- `backend/.env.example` pour le serveur API ;
- `frontend/.env.example` pour Vite et les instruments.

Toute nouvelle variable doit être :

1. lue et typée dans le code ;
2. dotée d'une valeur par défaut raisonnable ;
3. ajoutée au fichier `.env.example` approprié ;
4. documentée dans le README correspondant ;
5. transmise par Docker Compose si elle concerne le déploiement.

## 8. Tests et validation

Utiliser Node.js 24 LTS de préférence. Installer les dépendances avec `npm ci`.

Backend :

```bash
cd backend
npm test
npm run build
npm run lint
```

Frontend :

```bash
cd frontend
npm run build
npm run lint
```

Docker :

```bash
docker compose config
docker compose build
```

Exécuter d'abord les contrôles les plus ciblés, puis tous les contrôles du
projet touché avant de conclure. Vérifier également `git diff --check`.

Ne pas prétendre qu'un comportement dépendant du jeu a été validé si aucun
serveur War Thunder réel n'était disponible. Les tests automatisés couvrent
principalement le fallback, les conversions, les helpers et le contrat
OpenAPI ; les tests d'intégration avec le jeu doivent être signalés comme tels.

## 9. Dépendances et mises à jour

- Vérifier les versions avec `npm outdated`.
- Vérifier les avis de sécurité avec `npm audit`.
- Appliquer les mises à jour compatibles après validation.
- Ne pas effectuer une migration majeure automatiquement : consulter les notes
  de version, évaluer les ruptures, adapter le code et tester le comportement.
- Après une mise à jour, reconstruire les images Docker concernées.

## 10. Critères de fin de tâche

Une tâche est terminée uniquement si :

- le besoin est couvert sur toutes les surfaces concernées ;
- le comportement existant non visé est préservé ;
- les types, l'OpenAPI, la documentation et la configuration sont cohérents ;
- aucun code temporaire ou orphelin n'a été laissé ;
- les validations pertinentes passent ;
- les limites de validation, particulièrement l'absence éventuelle du serveur
  War Thunder, sont annoncées clairement.

Le compte rendu final doit commencer par le résultat obtenu, rester concis et
mentionner uniquement les limites ou actions encore nécessaires.
