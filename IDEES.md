# Idées hors MVP

Idées notées en cours de route, à reconsidérer après le MVP. Rien ici n'est codé.

## À examiner plus tard

- **Vibrations absentes sur le téléphone de Killian** (étape 4). Ni expo-haptics ni la vibration
  Android standard (`Vibration.vibrate`) ne se font sentir, alors que le son fonctionne. Pas bloquant
  (écouteurs). Pistes : réglages d'intensité des vibrations du téléphone (marque/surcouche),
  vérifier la permission VIBRATE dans l'APK installé, tester sur un autre appareil.
