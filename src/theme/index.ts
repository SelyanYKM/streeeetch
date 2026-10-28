// Toutes les couleurs, tailles de texte et espacements de l'app sont ici.
// Objectif : lisible à 1,5 m, téléphone posé au sol sur le tapis.
// Pour changer l'apparence, on modifie ce fichier, pas les écrans.

export const THEME = {
  colors: {
    bg: '#121212',
    surface: '#1E1E1E',
    border: '#3A3A3A',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    accent: '#FFCC00',
    onAccent: '#121212',
    disabled: '#4A4A4A',
    success: '#4CD964',
    danger: '#FF5A5A',
  },
  fontSize: {
    small: 16,
    body: 20,
    button: 30,
    heading: 32,
    title: 44,
    timer: 120,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  radius: 16,
  // Hauteur minimale d'un bouton principal : facile à toucher du bout du pied ou du doigt.
  buttonHeight: 96,
  statusBarStyle: 'light' as const,
};
