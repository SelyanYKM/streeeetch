# Idées hors MVP

Idées notées en cours de route, à reconsidérer après le MVP. Rien ici n'est codé.

## Prévu « plus tard » dans le cadrage

- Modifier les routines depuis l'app.
- Graphiques de progression des tests de souplesse.
- Rappel pour faire un test (toutes les 2 à 4 semaines).
- Vrais visuels avec ta DA (couleurs et typo déjà centralisées dans `src/theme/`, images remplaçables une par une).
- Statistiques de régularité (séries de jours, compteur mensuel).
- Routines hors PPL (repos, mobilité libre).
- Export / sauvegarde des données : **sans elle, un changement de téléphone efface l'historique et les tests.**
- Guidage vocal (annonce du nom de l'exercice et du côté).
- Notification « live » pour suivre la séance écran verrouillé.

## Notées pendant le développement

- Supprimer une séance de l'historique (aujourd'hui, seuls les résultats de tests se suppriment, par appui long).
- Signal sonore pendant les dernières secondes d'une tenue (bips 3-2-1) pour anticiper la fin.

## À examiner plus tard

- **Vibrations absentes sur le téléphone de Killian** (étape 4). Ni expo-haptics ni la vibration
  Android standard (`Vibration.vibrate`) ne se font sentir, alors que le son fonctionne. Pas bloquant
  (écouteurs). Pistes : réglages d'intensité des vibrations du téléphone (marque/surcouche),
  vérifier la permission VIBRATE dans l'APK installé, tester sur un autre appareil.
