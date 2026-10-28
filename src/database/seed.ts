/*
 * ============================================================================
 *  DONNÉES DE L'APP : exercices, routines et tests de souplesse
 * ============================================================================
 *
 *  Ce fichier se modifie à la main. C'est le FORMAT DE RÉFÉRENCE : on peut
 *  changer son contenu librement, mais pas sa structure (noms des champs).
 *
 *  Il contient 3 listes :
 *    1. EXERCISES : la bibliothèque de tous les exercices (y compris ceux
 *       qu'aucune routine n'utilise : ils restent en réserve).
 *    2. ROUTINES  : les 9 routines (push / pull / legs × pré / post courte /
 *       post longue), qui piochent dans la bibliothèque grâce à l'identifiant des exercices.
 *    3. FLEXIBILITY_TESTS : les tests de souplesse.
 *
 *  Si un identifiant est mal écrit (exercice introuvable, routine manquante…),
 *  l'écran d'accueil affiche un message rouge qui dit quoi corriger.
 *
 * ----------------------------------------------------------------------------
 *  1. UN EXERCICE
 * ----------------------------------------------------------------------------
 *    id             Identifiant unique, en minuscules, sans espace ni accent,
 *                   mots séparés par des tirets. Sert à l'utiliser dans les routines.
 *    name           Nom affiché à l'écran.
 *    instruction    Consigne courte (1 ou 2 lignes), lisible de loin.
 *    defaultHoldSec Durée de tenue par défaut, en secondes. Utilisée quand une
 *                   routine ne précise pas de durée (voir holdSec plus bas).
 *                   Pour un exercice unilatéral, c'est la durée d'UN côté.
 *    unilateral     true si l'exercice se fait un côté à la fois (droite puis
 *                   gauche, automatiquement), false sinon.
 *    zone           Zone travaillée, au choix : 'cou', 'epaules', 'pectoraux',
 *                   'dos', 'bras', 'poignets', 'colonne', 'hanches', 'fessiers',
 *                   'adducteurs', 'quadriceps', 'ischios', 'mollets'.
 *    type           'mobilite' (mouvement dynamique, plutôt en pré-workout) ou
 *                   'statique' (position tenue, plutôt en post-workout).
 *    imageKey       Nom de l'image de l'exercice (voir src/constants/exerciseImages.ts).
 *                   Le plus simple : le même texte que l'id.
 *    source         (facultatif) Référence du livre et de la page. Peut être omis.
 *
 *  Exemple complet :
 *    {
 *      id: 'etirement-quadriceps-debout',
 *      name: 'Étirement du quadriceps debout',
 *      instruction: 'Attrape ta cheville derrière toi, genoux serrés, et pousse le bassin vers l’avant.',
 *      defaultHoldSec: 30,
 *      unilateral: true,
 *      zone: 'quadriceps',
 *      type: 'statique',
 *      imageKey: 'etirement-quadriceps-debout',
 *      source: 'Delavier, Guide du stretching, p. 00',
 *    },
 *
 * ----------------------------------------------------------------------------
 *  2. UNE ROUTINE
 * ----------------------------------------------------------------------------
 *  Il y a 9 routines indépendantes : pour push, pull et legs, une 'pre', une
 *  'post-courte' et une 'post-longue'. La courte et la longue n'ont aucun lien :
 *  mêmes exercices ou non, nombre de séries libre.
 *
 *    sessionType  'push', 'pull' ou 'legs'.
 *    moment       'pre' (avant la séance, 5 min), 'post-courte' (après, 5 min)
 *                 ou 'post-longue' (après, 10 min).
 *    exercises    La liste des exercices, dans l'ordre. Une ligne par exercice :
 *                   { exerciseId: '…', sets: 2 },
 *                   { exerciseId: '…', sets: 1, holdSec: 45 },
 *                 - exerciseId : l'id d'un exercice de la bibliothèque ;
 *                 - sets       : nombre de séries (le lecteur fait A-A-A puis B-B-B) ;
 *                 - holdSec    : (facultatif) durée d'une tenue en secondes, pour
 *                                remplacer le defaultHoldSec de l'exercice dans
 *                                cette routine seulement. Pour un unilatéral, c'est
 *                                la durée d'UN côté : une série = droite puis gauche.
 *                 Remplacer un exercice = changer l'exerciseId sur sa ligne.
 *
 *  Durée totale : chaque tenue est précédée de 5 s de transition (« Prépare-toi »).
 *    durée d'une ligne = séries × (2 si unilatéral, sinon 1) × (5 + durée de tenue)
 *  Cibles : pré ≈ 5 min ; post courte ≈ 5 min ; post longue ≈ 10 min.
 *  L'écran d'aperçu affiche la durée calculée, pratique pour ajuster.
 *
 *  Exemple complet :
 *    {
 *      sessionType: 'legs',
 *      moment: 'post-courte',
 *      exercises: [
 *        { exerciseId: 'etirement-quadriceps-debout', sets: 1 },
 *        { exerciseId: 'pigeon', sets: 1, holdSec: 45 },
 *        { exerciseId: 'papillon', sets: 2 },
 *      ],
 *    },
 *
 * ----------------------------------------------------------------------------
 *  3. UN TEST DE SOUPLESSE
 * ----------------------------------------------------------------------------
 *    id           Identifiant unique (même règle que pour les exercices). Ne pas
 *                 le changer une fois des résultats saisis : ils y sont rattachés.
 *    name         Nom affiché.
 *    instruction  Comment faire le test et quoi mesurer.
 *    unit         Unité du résultat : 'cm', '°', 's'…
 *    betterWhen   'plus-haut' si un résultat plus grand est meilleur,
 *                 'plus-bas' si un résultat plus petit est meilleur.
 *
 *  Exemple complet :
 *    {
 *      id: 'flexion-avant',
 *      name: 'Flexion avant assis',
 *      instruction: 'Assis jambes tendues, penche-toi et mesure où arrivent tes doigts.',
 *      unit: 'cm',
 *      betterWhen: 'plus-haut',
 *    },
 * ============================================================================
 */

import { Exercise, FlexibilityTest, Routine } from '../types';

// ----------------------------------------------------------------------------
// 1. BIBLIOTHÈQUE D'EXERCICES (provisoire, à remplacer par la liste définitive)
// ----------------------------------------------------------------------------
export const EXERCISES: Exercise[] = [
  // --- Mobilité : haut du corps ---
  {
    id: 'cercles-bras',
    name: 'Cercles des bras',
    instruction: 'Bras tendus sur les côtés, fais de grands cercles lents vers l’avant puis vers l’arrière.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'epaules',
    type: 'mobilite',
    imageKey: 'cercles-bras',
  },
  {
    id: 'balancier-bras',
    name: 'Balancier des bras',
    instruction: 'Ouvre grand les bras puis croise-les devant la poitrine, en rythme et sans forcer.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'pectoraux',
    type: 'mobilite',
    imageKey: 'balancier-bras',
  },
  {
    id: 'passe-epaules-baton',
    name: 'Passe-épaules au bâton',
    instruction: 'Bâton ou élastique tenu large, passe-le au-dessus de la tête jusque dans le dos, bras tendus.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'epaules',
    type: 'mobilite',
    imageKey: 'passe-epaules-baton',
  },
  {
    id: 'glissades-mur',
    name: 'Glissades au mur',
    instruction: 'Dos et bras collés au mur en W, fais glisser les bras vers le haut puis redescends.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'epaules',
    type: 'mobilite',
    imageKey: 'glissades-mur',
  },
  {
    id: 'pompes-scapulaires',
    name: 'Pompes scapulaires',
    instruction: 'En planche bras tendus, rapproche puis écarte les omoplates sans plier les coudes.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'dos',
    type: 'mobilite',
    imageKey: 'pompes-scapulaires',
  },
  {
    id: 'scapulaires-suspendu',
    name: 'Rétractions scapulaires suspendu',
    instruction: 'Suspendu à la barre bras tendus, abaisse les épaules en serrant les omoplates, puis relâche.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'dos',
    type: 'mobilite',
    imageKey: 'scapulaires-suspendu',
  },
  {
    id: 'chat-vache',
    name: 'Chat-vache',
    instruction: 'À quatre pattes, arrondis le dos en rentrant le menton, puis creuse-le en regardant devant.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'colonne',
    type: 'mobilite',
    imageKey: 'chat-vache',
  },
  {
    id: 'rotation-thoracique',
    name: 'Rotation thoracique à quatre pattes',
    instruction: 'À quatre pattes, main derrière la tête, tourne le coude vers le plafond puis vers le bras d’appui.',
    defaultHoldSec: 20,
    unilateral: true,
    zone: 'colonne',
    type: 'mobilite',
    imageKey: 'rotation-thoracique',
  },
  {
    id: 'cercles-poignets',
    name: 'Cercles des poignets',
    instruction: 'Doigts entrecroisés, fais tourner les poignets dans un sens puis dans l’autre.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'poignets',
    type: 'mobilite',
    imageKey: 'cercles-poignets',
  },
  {
    id: 'rotations-cou',
    name: 'Rotations du cou',
    instruction: 'Tourne lentement la tête à droite puis à gauche, épaules basses et immobiles.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'cou',
    type: 'mobilite',
    imageKey: 'rotations-cou',
  },

  // --- Mobilité : bas du corps ---
  {
    id: 'cercles-hanches',
    name: 'Cercles des hanches',
    instruction: 'Mains sur les hanches, pieds écartés, dessine de grands cercles avec le bassin.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'hanches',
    type: 'mobilite',
    imageKey: 'cercles-hanches',
  },
  {
    id: 'balancier-jambe-avant',
    name: 'Balancier de jambe avant-arrière',
    instruction: 'Une main sur un support, balance la jambe tendue d’avant en arrière, de plus en plus haut.',
    defaultHoldSec: 20,
    unilateral: true,
    zone: 'hanches',
    type: 'mobilite',
    imageKey: 'balancier-jambe-avant',
  },
  {
    id: 'balancier-jambe-lateral',
    name: 'Balancier de jambe latéral',
    instruction: 'Face à un support, balance la jambe de gauche à droite devant toi.',
    defaultHoldSec: 20,
    unilateral: true,
    zone: 'adducteurs',
    type: 'mobilite',
    imageKey: 'balancier-jambe-lateral',
  },
  {
    id: 'squat-poids-du-corps',
    name: 'Squat au poids du corps',
    instruction: 'Descends lentement, dos droit et talons au sol, puis remonte.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'quadriceps',
    type: 'mobilite',
    imageKey: 'squat-poids-du-corps',
  },
  {
    id: 'fente-rotation',
    name: 'Fente avec rotation',
    instruction: 'Fais une fente avant puis tourne le buste vers la jambe avant ; reviens et recommence.',
    defaultHoldSec: 20,
    unilateral: true,
    zone: 'hanches',
    type: 'mobilite',
    imageKey: 'fente-rotation',
  },
  {
    id: 'genou-au-mur',
    name: 'Genou au mur',
    instruction: 'Pied à une main du mur, avance le genou jusqu’au mur sans décoller le talon.',
    defaultHoldSec: 20,
    unilateral: true,
    zone: 'mollets',
    type: 'mobilite',
    imageKey: 'genou-au-mur',
  },
  {
    id: 'pont-fessier',
    name: 'Pont fessier',
    instruction: 'Sur le dos, genoux fléchis, monte le bassin en serrant les fessiers puis redescends.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'fessiers',
    type: 'mobilite',
    imageKey: 'pont-fessier',
  },

  // --- Étirements statiques : haut du corps ---
  {
    id: 'etirement-pectoral-cadre',
    name: 'Pectoraux au cadre de porte',
    instruction: 'Avant-bras contre un montant, coude à hauteur d’épaule, avance doucement le buste.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'pectoraux',
    type: 'statique',
    imageKey: 'etirement-pectoral-cadre',
  },
  {
    id: 'etirement-epaule-croise',
    name: 'Bras croisé devant la poitrine',
    instruction: 'Ramène le bras tendu contre la poitrine avec l’autre main, épaule basse.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'epaules',
    type: 'statique',
    imageKey: 'etirement-epaule-croise',
  },
  {
    id: 'etirement-triceps',
    name: 'Étirement du triceps',
    instruction: 'Main entre les omoplates, pousse doucement le coude vers le bas avec l’autre main.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'bras',
    type: 'statique',
    imageKey: 'etirement-triceps',
  },
  {
    id: 'etirement-biceps-mur',
    name: 'Biceps au mur',
    instruction: 'Paume contre le mur, bras tendu derrière toi, tourne doucement le buste à l’opposé.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'bras',
    type: 'statique',
    imageKey: 'etirement-biceps-mur',
  },
  {
    id: 'etirement-avant-bras',
    name: 'Étirement des avant-bras',
    instruction: 'Bras tendu paume vers l’avant, tire doucement les doigts vers toi avec l’autre main.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'poignets',
    type: 'statique',
    imageKey: 'etirement-avant-bras',
  },
  {
    id: 'etirement-grand-dorsal',
    name: 'Étirement du grand dorsal',
    instruction: 'Attrape un support d’une main, bras tendu, et recule les hanches pour étirer le côté du dos.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'dos',
    type: 'statique',
    imageKey: 'etirement-grand-dorsal',
  },
  {
    id: 'posture-enfant',
    name: 'Posture de l’enfant',
    instruction: 'À genoux, fesses sur les talons, allonge les bras loin devant et relâche le dos.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'dos',
    type: 'statique',
    imageKey: 'posture-enfant',
  },
  {
    id: 'auto-calin',
    name: 'Auto-câlin',
    instruction: 'Croise les bras en attrapant tes omoplates et arrondis le haut du dos.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'dos',
    type: 'statique',
    imageKey: 'auto-calin',
  },
  {
    id: 'suspension-passive',
    name: 'Suspension passive',
    instruction: 'Suspendu à la barre bras tendus, laisse les épaules et le dos se relâcher.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'dos',
    type: 'statique',
    imageKey: 'suspension-passive',
  },
  {
    id: 'sphinx',
    name: 'Sphinx',
    instruction: 'Sur le ventre, appuie-toi sur les avant-bras et laisse le bas du dos se creuser.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'colonne',
    type: 'statique',
    imageKey: 'sphinx',
  },
  {
    id: 'livre-ouvert',
    name: 'Livre ouvert allongé',
    instruction: 'Allongé sur le côté, genoux pliés, ouvre le bras du dessus vers le sol derrière toi.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'colonne',
    type: 'statique',
    imageKey: 'livre-ouvert',
  },
  {
    id: 'inclinaison-cou',
    name: 'Inclinaison latérale du cou',
    instruction: 'Penche l’oreille vers l’épaule, l’autre épaule relâchée vers le bas.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'cou',
    type: 'statique',
    imageKey: 'inclinaison-cou',
  },
  {
    id: 'etirement-pectoral-sol',
    name: 'Pectoraux allongé au sol',
    instruction: 'Sur le ventre, un bras tendu sur le côté, roule doucement le corps vers ce bras.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'pectoraux',
    type: 'statique',
    imageKey: 'etirement-pectoral-sol',
  },

  // --- Étirements statiques : bas du corps ---
  {
    id: 'etirement-quadriceps-debout',
    name: 'Quadriceps debout',
    instruction: 'Attrape ta cheville derrière toi, genoux serrés, et pousse le bassin vers l’avant.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'quadriceps',
    type: 'statique',
    imageKey: 'etirement-quadriceps-debout',
  },
  {
    id: 'etirement-ischios-assis',
    name: 'Ischios assis',
    instruction: 'Assis, une jambe tendue, penche-toi vers le pied en gardant le dos long.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'ischios',
    type: 'statique',
    imageKey: 'etirement-ischios-assis',
  },
  {
    id: 'fente-basse',
    name: 'Fente basse',
    instruction: 'Genou arrière au sol, avance le bassin jusqu’à sentir l’étirement devant la hanche.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'hanches',
    type: 'statique',
    imageKey: 'fente-basse',
  },
  {
    id: 'etirement-mollet-mur',
    name: 'Mollet au mur',
    instruction: 'Mains au mur, jambe arrière tendue et talon au sol, avance le bassin.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'mollets',
    type: 'statique',
    imageKey: 'etirement-mollet-mur',
  },
  {
    id: 'papillon',
    name: 'Papillon',
    instruction: 'Assis, plantes de pieds collées, laisse descendre les genoux vers le sol, dos droit.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'adducteurs',
    type: 'statique',
    imageKey: 'papillon',
  },
  {
    id: 'pigeon',
    name: 'Pigeon',
    instruction: 'Jambe avant pliée devant toi, jambe arrière tendue, descends le buste vers le sol.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'fessiers',
    type: 'statique',
    imageKey: 'pigeon',
  },
  {
    id: 'figure-quatre',
    name: 'Figure 4 allongé',
    instruction: 'Sur le dos, cheville sur le genou opposé, tire la cuisse du dessous vers toi.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'fessiers',
    type: 'statique',
    imageKey: 'figure-quatre',
  },
  {
    id: 'torsion-allongee',
    name: 'Torsion allongée',
    instruction: 'Sur le dos, ramène un genou de l’autre côté du corps, épaules au sol.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'colonne',
    type: 'statique',
    imageKey: 'torsion-allongee',
  },
  {
    id: 'grenouille',
    name: 'Grenouille',
    instruction: 'À quatre pattes, écarte les genoux au maximum et recule doucement le bassin.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'adducteurs',
    type: 'statique',
    imageKey: 'grenouille',
  },
  {
    id: 'flexion-avant-debout',
    name: 'Flexion avant debout',
    instruction: 'Jambes tendues, laisse pendre le buste et les bras vers le sol, nuque relâchée.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'ischios',
    type: 'statique',
    imageKey: 'flexion-avant-debout',
  },
];

// ----------------------------------------------------------------------------
// 2. ROUTINES (pré, post courte, post longue pour chaque séance : 9 au total)
// ----------------------------------------------------------------------------
export const ROUTINES: Routine[] = [
  // --- PUSH ---
  {
    sessionType: 'push',
    moment: 'pre',
    exercises: [
      { exerciseId: 'cercles-bras', sets: 2 },
      { exerciseId: 'balancier-bras', sets: 2 },
      { exerciseId: 'glissades-mur', sets: 2 },
      { exerciseId: 'pompes-scapulaires', sets: 2 },
      { exerciseId: 'rotation-thoracique', sets: 1 },
      { exerciseId: 'passe-epaules-baton', sets: 2 },
    ],
  },
  {
    sessionType: 'push',
    moment: 'post-courte',
    exercises: [
      { exerciseId: 'posture-enfant', sets: 2 },
      { exerciseId: 'etirement-pectoral-cadre', sets: 1 },
      { exerciseId: 'etirement-epaule-croise', sets: 1 },
      { exerciseId: 'etirement-triceps', sets: 1, holdSec: 40 },
    ],
  },
  {
    sessionType: 'push',
    moment: 'post-longue',
    exercises: [
      { exerciseId: 'posture-enfant', sets: 2 },
      { exerciseId: 'etirement-pectoral-cadre', sets: 1 },
      { exerciseId: 'etirement-epaule-croise', sets: 1 },
      { exerciseId: 'etirement-triceps', sets: 1, holdSec: 40 },
      { exerciseId: 'etirement-biceps-mur', sets: 1 },
      { exerciseId: 'sphinx', sets: 2 },
      { exerciseId: 'etirement-avant-bras', sets: 1, holdSec: 25 },
      { exerciseId: 'livre-ouvert', sets: 1, holdSec: 45 },
    ],
  },

  // --- PULL ---
  {
    sessionType: 'pull',
    moment: 'pre',
    exercises: [
      { exerciseId: 'cercles-bras', sets: 2 },
      { exerciseId: 'chat-vache', sets: 2 },
      { exerciseId: 'rotation-thoracique', sets: 1 },
      { exerciseId: 'scapulaires-suspendu', sets: 2 },
      { exerciseId: 'passe-epaules-baton', sets: 2 },
      { exerciseId: 'cercles-poignets', sets: 2 },
    ],
  },
  {
    sessionType: 'pull',
    moment: 'post-courte',
    exercises: [
      { exerciseId: 'etirement-grand-dorsal', sets: 1, holdSec: 40 },
      { exerciseId: 'posture-enfant', sets: 2 },
      { exerciseId: 'etirement-biceps-mur', sets: 1 },
      { exerciseId: 'etirement-epaule-croise', sets: 1 },
    ],
  },
  {
    sessionType: 'pull',
    moment: 'post-longue',
    exercises: [
      { exerciseId: 'etirement-grand-dorsal', sets: 1, holdSec: 40 },
      { exerciseId: 'posture-enfant', sets: 2 },
      { exerciseId: 'etirement-biceps-mur', sets: 1 },
      { exerciseId: 'etirement-epaule-croise', sets: 1 },
      { exerciseId: 'suspension-passive', sets: 2, holdSec: 20 },
      { exerciseId: 'auto-calin', sets: 2 },
      { exerciseId: 'inclinaison-cou', sets: 1, holdSec: 20 },
      { exerciseId: 'livre-ouvert', sets: 1 },
      { exerciseId: 'etirement-avant-bras', sets: 1, holdSec: 25 },
    ],
  },

  // --- LEGS ---
  {
    sessionType: 'legs',
    moment: 'pre',
    exercises: [
      { exerciseId: 'cercles-hanches', sets: 2 },
      { exerciseId: 'balancier-jambe-avant', sets: 1 },
      { exerciseId: 'balancier-jambe-lateral', sets: 1 },
      { exerciseId: 'squat-poids-du-corps', sets: 2 },
      { exerciseId: 'fente-rotation', sets: 1 },
      { exerciseId: 'genou-au-mur', sets: 1 },
    ],
  },
  {
    sessionType: 'legs',
    moment: 'post-courte',
    exercises: [
      { exerciseId: 'etirement-quadriceps-debout', sets: 1 },
      { exerciseId: 'etirement-ischios-assis', sets: 1, holdSec: 40 },
      { exerciseId: 'fente-basse', sets: 1 },
      { exerciseId: 'etirement-mollet-mur', sets: 1 },
    ],
  },
  {
    sessionType: 'legs',
    moment: 'post-longue',
    exercises: [
      { exerciseId: 'etirement-quadriceps-debout', sets: 1 },
      { exerciseId: 'etirement-ischios-assis', sets: 1, holdSec: 40 },
      { exerciseId: 'fente-basse', sets: 1 },
      { exerciseId: 'etirement-mollet-mur', sets: 1 },
      { exerciseId: 'pigeon', sets: 1, holdSec: 45 },
      { exerciseId: 'figure-quatre', sets: 1 },
      { exerciseId: 'papillon', sets: 2 },
      { exerciseId: 'torsion-allongee', sets: 1, holdSec: 25 },
    ],
  },
];

// ----------------------------------------------------------------------------
// 3. TESTS DE SOUPLESSE (provisoires)
// ----------------------------------------------------------------------------
export const FLEXIBILITY_TESTS: FlexibilityTest[] = [
  {
    id: 'flexion-avant',
    name: 'Flexion avant assis',
    instruction:
      'Assis jambes tendues, pieds contre une marche, penche-toi doucement. Mesure où arrivent tes doigts : 0 au niveau des orteils, négatif avant, positif au-delà.',
    unit: 'cm',
    betterWhen: 'plus-haut',
  },
  {
    id: 'epaules',
    name: 'Mains dans le dos',
    instruction:
      'Une main par-dessus l’épaule, l’autre par le bas du dos. Mesure l’écart entre les deux majeurs (0 s’ils se touchent).',
    unit: 'cm',
    betterWhen: 'plus-bas',
  },
  {
    id: 'hanches',
    name: 'Papillon',
    instruction: 'Assis, plantes de pieds collées contre le bassin, dos droit. Mesure la distance entre le genou droit et le sol.',
    unit: 'cm',
    betterWhen: 'plus-bas',
  },
];
