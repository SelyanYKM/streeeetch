# streeeetch
Une app qui te guide dans des routines d’étirements pré et post-workout adaptées à ta séance du jour (push, pull, legs), avec minuteur, enregistre chaque séance dans un historique, et te permet de faire ponctuellement des tests de souplesse dont tu saisis les résultats pour suivre ta progression.

## Technique

- Expo SDK 57, React Native 0.86, TypeScript strict. Android uniquement, portrait, entièrement hors connexion.
- Pas de Node ni de Git en local : tout passe par GitHub Actions + EAS.
  - **Build Android APK (EAS)** (`.github/workflows/build-android-apk.yml`) : lancé à la main (Actions → Run workflow). Nécessaire uniquement quand un module natif change ou que la version de `app.json` change.
  - **Publish OTA Update (EAS)** (`.github/workflows/publish-update.yml`) : à chaque push sur `main`, publie une mise à jour sur le canal `preview`. L'app la télécharge et l'applique à l'ouverture suivante.
- Secret GitHub requis : `EXPO_TOKEN` (Settings → Secrets and variables → Actions).
