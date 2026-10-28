# streeeetch

Une app Android qui te guide dans des routines d’étirements pré et post-workout adaptées à ta séance du jour (push, pull, legs), avec minuteur, enregistre chaque séance dans un historique, et te permet de faire ponctuellement des tests de souplesse dont tu saisis les résultats pour suivre ta progression.

Utilisateur unique, sans compte, entièrement hors connexion. Android, portrait.

## Ce que fait l'app

- **Choix de la séance** : PUSH / PULL / LEGS → PRÉ (5 min) ou POST → COURTE (5 min) ou LONGUE (10 min) → aperçu (exercices, séries, durée totale).
- **Lecteur** : transition jaune de 5 s « Prépare-toi » avant chaque tenue, puis image, nom, consigne et gros minuteur. Séries enchaînées (A-A-A puis B-B-B), côté droit puis gauche pour les unilatéraux. Écran maintenu allumé.
- **Commandes** : pause / reprendre, passer l'exercice, arrêter (avec confirmation ; le bouton retour du téléphone demande aussi confirmation).
- **Signaux** : bip (et vibration) au début et à la fin de chaque tenue, par-dessus la musique sans la couper.
- **Historique** : chaque séance est enregistrée (date, type, moment, durée réellement faite, terminée ou arrêtée). Une séance arrêtée avant 30 s n'est pas enregistrée.
- **Tests de souplesse** : consigne, saisie du résultat, liste datée avec l'écart au résultat précédent.

## Modifier le contenu (sans toucher au reste du code)

### Exercices, routines et tests : `src/database/seed.ts`

Tout le contenu est dans ce fichier. **Le commentaire en haut du fichier explique chaque champ, avec des exemples complets.** En bref :

- `EXERCISES` : la bibliothèque (y compris des exercices en réserve).
- `ROUTINES` : 9 routines indépendantes (push / pull / legs × `pre`, `post-courte`, `post-longue`). Une ligne par exercice : `{ exerciseId: 'pigeon', sets: 1, holdSec: 45 }` (`holdSec` facultatif : sinon durée par défaut de l'exercice).
- `FLEXIBILITY_TESTS` : les tests de souplesse. Ne change pas l'`id` d'un test une fois des résultats saisis.

Si tu fais une faute (exercice introuvable, routine manquante…), l'accueil affiche un message rouge qui dit quoi corriger. L'aperçu affiche la durée calculée de chaque routine : pratique pour viser 5 ou 10 min.

### Images des exercices : `assets/exercises/` + `src/constants/exerciseImages.ts`

Tous les exercices affichent pour l'instant `assets/exercises/placeholder.png`. Pour donner sa vraie image à un exercice :

1. dépose le fichier dans `assets/exercises/` (ex. `pigeon.png`) ;
2. ajoute une ligne dans `src/constants/exerciseImages.ts` : `pigeon: require('../../assets/exercises/pigeon.png'),` (la clé est le `imageKey` de l'exercice dans seed.ts).

### Couleurs, tailles de texte : `src/theme/index.ts`

Toutes les couleurs, tailles et espacements sont centralisés ici (pour appliquer une DA plus tard).

## Mettre à jour l'app sur le téléphone

- **Mise à jour normale (OTA)** : chaque push sur `main` publie automatiquement une mise à jour (workflow *Publish OTA Update*). Sur le téléphone, ferme complètement l'app puis rouvre-la : elle télécharge et applique la mise à jour au démarrage. Le bas de l'accueil indique « mise à jour du … ».
- **Nouvel APK nécessaire** seulement si on ajoute un module natif ou qu'on change `version` dans `app.json` : GitHub → Actions → *Build Android APK (EAS)* → Run workflow, puis installer l'APK depuis expo.dev (projet streeeetch → Builds → Install).

## Technique

- Expo SDK 57, React Native 0.86, TypeScript strict (`.npmrc` : `legacy-peer-deps=true`). Modules natifs : expo-audio, expo-haptics, expo-keep-awake, expo-sqlite, expo-updates, expo-system-ui.
- Pas de Node ni de Git en local : tout passe par GitHub Actions + EAS (compte Expo `selyanykm`, projet `streeeetch`, canal `preview`).
  - `.github/workflows/build-android-apk.yml` : APK (profil `preview` de `eas.json`), lancé à la main.
  - `.github/workflows/publish-update.yml` : mise à jour OTA sur le canal `preview` à chaque push sur `main` (ou à la main, sur n'importe quelle branche, pour tester).
- Secret GitHub requis : `EXPO_TOKEN` (Settings → Secrets and variables → Actions).

### Structure

```
App.tsx                  navigation par état (écran courant + rendu conditionnel), vérification OTA au démarrage
src/database/seed.ts     exercices, routines, tests (à modifier à la main)
src/database/db.ts       SQLite : historique des séances, résultats des tests
src/engine/session.ts    routine → suite d'étapes (séries, côtés, transitions), durées, vérification de seed.ts
src/engine/player.ts     avancement du lecteur basé sur Date.now (pause, passer, durée réellement faite)
src/screens/             écrans (accueil, choix, aperçu, lecteur, fin, historique, tests)
src/components/          boutons réutilisables
src/constants/           libellés, images des exercices
src/theme/               couleurs, tailles, espacements
src/utils/               son, vibration, mise en forme des durées / dates / nombres
assets/                  icône, sons, images des exercices
```

Idées hors MVP et points à examiner : voir [IDEES.md](IDEES.md).
