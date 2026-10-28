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
// 1. BIBLIOTHÈQUE D'EXERCICES
// ----------------------------------------------------------------------------
export const EXERCISES: Exercise[] = [
  // --- Pré-workout : mobilité générale ---
  {
    id: 'sauts-etoile',
    name: 'Sauts en étoile',
    instruction: 'Écarte bras et jambes en sautant, puis referme. Rythme régulier, sans forcer.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'hanches',
    type: 'mobilite',
    imageKey: 'sauts-etoile',
  },
  {
    id: 'torsions-torse',
    name: 'Torsions du torse',
    instruction: 'Debout, pieds écartés, tourne le buste d’un côté puis de l’autre, bras relâchés.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'colonne',
    type: 'mobilite',
    imageKey: 'torsions-torse',
  },
  // --- Pré-workout : haut du corps ---
  {
    id: 'cercles-bras-avant',
    name: 'Cercles de bras vers l’avant',
    instruction: 'Bras tendus sur les côtés, fais de grands cercles lents vers l’avant.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'epaules',
    type: 'mobilite',
    imageKey: 'cercles-bras-avant',
  },
  {
    id: 'cercles-bras-arriere',
    name: 'Cercles de bras vers l’arrière',
    instruction: 'Bras tendus sur les côtés, fais de grands cercles lents vers l’arrière.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'epaules',
    type: 'mobilite',
    imageKey: 'cercles-bras-arriere',
  },
  {
    id: 'balancier-bras',
    name: 'Balancements de bras croisés-ouverts',
    instruction: 'Ouvre grand les bras puis croise-les devant la poitrine, en rythme et sans forcer.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'pectoraux',
    type: 'mobilite',
    imageKey: 'balancier-bras',
  },
  {
    id: 'rotations-epaules-90',
    name: 'Rotations des épaules, coudes à 90°',
    instruction: 'Coudes à hauteur d’épaules et pliés à 90°, bascule les avant-bras vers le haut puis vers le bas.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'epaules',
    type: 'mobilite',
    imageKey: 'rotations-epaules-90',
  },
  {
    id: 'pompes-genoux-lentes',
    name: 'Pompes lentes sur les genoux',
    instruction: 'Sur les genoux, descends lentement la poitrine vers le sol, puis remonte.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'pectoraux',
    type: 'mobilite',
    imageKey: 'pompes-genoux-lentes',
  },
  {
    id: 'cercles-poignets',
    name: 'Cercles de poignets',
    instruction: 'Doigts entrecroisés, fais tourner les poignets dans un sens puis dans l’autre.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'poignets',
    type: 'mobilite',
    imageKey: 'cercles-poignets',
  },
  {
    id: 'chat-vache',
    name: 'Chat-vache',
    instruction: 'À quatre pattes, arrondis le dos en rentrant le menton, puis creuse-le en regardant devant.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'colonne',
    type: 'mobilite',
    imageKey: 'chat-vache',
  },
  {
    id: 'charniere-hanche',
    name: 'Charnière de hanche',
    instruction: 'Debout, mains sur les hanches, recule les fesses dos droit, puis redresse-toi.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'ischios',
    type: 'mobilite',
    imageKey: 'charniere-hanche',
  },
  {
    id: 'rotation-thoracique',
    name: 'Rotations du buste à quatre pattes',
    instruction: 'À quatre pattes, main derrière la tête, tourne le coude vers le plafond puis vers le sol. Change de bras à mi-temps.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'colonne',
    type: 'mobilite',
    imageKey: 'rotation-thoracique',
  },
  // --- Pré-workout : bas du corps ---
  {
    id: 'squat-poids-du-corps',
    name: 'Squats sans charge',
    instruction: 'Descends lentement, dos droit et talons au sol, puis remonte.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'quadriceps',
    type: 'mobilite',
    imageKey: 'squat-poids-du-corps',
  },
  {
    id: 'balancier-jambe-avant',
    name: 'Balancements de jambe avant-arrière',
    instruction: 'Balance une jambe tendue d’avant en arrière, de plus en plus haut. Change de jambe à mi-temps.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'ischios',
    type: 'mobilite',
    imageKey: 'balancier-jambe-avant',
  },
  {
    id: 'balancier-jambe-lateral',
    name: 'Balancements de jambe latéraux',
    instruction: 'Balance une jambe de gauche à droite devant toi. Change de jambe à mi-temps.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'adducteurs',
    type: 'mobilite',
    imageKey: 'balancier-jambe-lateral',
  },
  {
    id: 'fentes-laterales',
    name: 'Fentes latérales',
    instruction: 'Pas large sur le côté, fléchis la jambe d’appui, l’autre reste tendue. Alterne les côtés.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'adducteurs',
    type: 'mobilite',
    imageKey: 'fentes-laterales',
  },
  {
    id: 'fentes-avant',
    name: 'Fentes avant',
    instruction: 'Grand pas en avant, descends le genou arrière vers le sol, remonte. Alterne les jambes.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'quadriceps',
    type: 'mobilite',
    imageKey: 'fentes-avant',
  },
  {
    id: 'cercles-genoux',
    name: 'Cercles de genoux',
    instruction: 'Pieds joints, mains sur les genoux légèrement fléchis, petits cercles dans un sens puis dans l’autre.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'quadriceps',
    type: 'mobilite',
    imageKey: 'cercles-genoux',
  },
  {
    id: 'montees-pointes',
    name: 'Montées sur la pointe des pieds',
    instruction: 'Monte sur la pointe des pieds, puis redescends lentement.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'mollets',
    type: 'mobilite',
    imageKey: 'montees-pointes',
  },
  // --- Post-workout : Push ---
  {
    id: 'etirement-pectoral-sol',
    name: 'Pectoraux allongé au sol',
    instruction: 'Sur le ventre, un bras tendu sur le côté, roule doucement sur le côté opposé. Bras plus haut ou plus bas d’une série à l’autre.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'pectoraux',
    type: 'statique',
    imageKey: 'etirement-pectoral-sol',
  },
  {
    id: 'etirement-epaule-croise',
    name: 'Bras croisé devant la poitrine',
    instruction: 'Debout, l’autre main tire le coude vers l’épaule opposée, épaule basse.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'epaules',
    type: 'statique',
    imageKey: 'etirement-epaule-croise',
    source: 'Delavier\'s Stretching Anatomy, p. 45',
  },
  {
    id: 'etirement-triceps',
    name: 'Triceps debout',
    instruction: 'Coude derrière la tête, l’autre main tire doucement le coude.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'bras',
    type: 'statique',
    imageKey: 'etirement-triceps',
    source: 'Delavier\'s Stretching Anatomy, p. 53',
  },
  {
    id: 'ouverture-epaules-assis',
    name: 'Ouverture des épaules assis',
    instruction: 'Assis au sol, mains posées derrière toi, avance doucement les fesses.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'epaules',
    type: 'statique',
    imageKey: 'ouverture-epaules-assis',
    source: 'Delavier\'s Stretching Anatomy, p. 39 (adapté)',
  },
  // --- Post-workout : Pull ---
  {
    id: 'suspension-passive',
    name: 'Suspension à la barre',
    instruction: 'Bras tendus, corps relâché. Si la prise lâche, pose les pieds et reprends.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'dos',
    type: 'statique',
    imageKey: 'suspension-passive',
    source: 'Delavier\'s Stretching Anatomy, p. 72',
  },
  {
    id: 'dos-rond-debout',
    name: 'Dos rond debout',
    instruction: 'Bras tendus devant, mains croisées, pousse loin en arrondissant le haut du dos.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'dos',
    type: 'statique',
    imageKey: 'dos-rond-debout',
  },
  {
    id: 'avant-bras-genoux',
    name: 'Avant-bras à genoux',
    instruction: 'Paumes au sol, doigts vers les genoux, bras tendus, recule doucement.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'poignets',
    type: 'statique',
    imageKey: 'avant-bras-genoux',
    source: 'Delavier\'s Stretching Anatomy, p. 55',
  },
  {
    id: 'genou-poitrine',
    name: 'Genou contre la poitrine',
    instruction: 'Allongé sur le dos, l’autre jambe tendue, tire doucement le genou vers toi.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'colonne',
    type: 'statique',
    imageKey: 'genou-poitrine',
    source: 'Delavier\'s Stretching Anatomy, p. 77',
  },
  {
    id: 'ischios-debout',
    name: 'Ischios debout',
    instruction: 'Jambe tendue devant, talon au sol, pointe relevée, bascule le buste dos droit.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'ischios',
    type: 'statique',
    imageKey: 'ischios-debout',
    source: 'Delavier\'s Stretching Anatomy, p. 20',
  },
  // --- Post-workout : Legs ---
  {
    id: 'quadriceps-allonge',
    name: 'Quadriceps allongé',
    instruction: 'Sur le côté, talon vers la fesse, genou légèrement ramené en arrière.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'quadriceps',
    type: 'statique',
    imageKey: 'quadriceps-allonge',
    source: 'Delavier\'s Stretching Anatomy, p. 20',
  },
  {
    id: 'ischios-allonge',
    name: 'Ischios allongé',
    instruction: 'Sur le dos, jambe tendue vers le plafond, mains derrière la cuisse, pointe tirée vers toi.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'ischios',
    type: 'statique',
    imageKey: 'ischios-allonge',
  },
  {
    id: 'fessiers-psoas-allonge',
    name: 'Fessiers et psoas allongé',
    instruction: 'Ramène un genou vers l’épaule opposée, l’autre jambe tendue au sol.',
    defaultHoldSec: 30,
    unilateral: true,
    zone: 'fessiers',
    type: 'statique',
    imageKey: 'fessiers-psoas-allonge',
    source: 'Delavier\'s Stretching Anatomy, p. 89',
  },
  {
    id: 'papillon',
    name: 'Papillon assis',
    instruction: 'Plantes des pieds jointes, laisse descendre les genoux, buste droit.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'adducteurs',
    type: 'statique',
    imageKey: 'papillon',
    source: 'Delavier\'s Stretching Anatomy, p. 20',
  },
  {
    id: 'squat-profond-tenu',
    name: 'Squat profond tenu',
    instruction: 'Talons au sol, coudes qui poussent doucement les genoux vers l’extérieur.',
    defaultHoldSec: 30,
    unilateral: false,
    zone: 'mollets',
    type: 'statique',
    imageKey: 'squat-profond-tenu',
  },

  // --- Réserve : exercices provisoires non utilisés par les routines ---
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
    id: 'rotations-cou',
    name: 'Rotations du cou',
    instruction: 'Tourne lentement la tête à droite puis à gauche, épaules basses et immobiles.',
    defaultHoldSec: 20,
    unilateral: false,
    zone: 'cou',
    type: 'mobilite',
    imageKey: 'rotations-cou',
  },
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
// 2. ROUTINES (pré : 1 série ; post courte : 1 série ; post longue : 2 séries des mêmes exercices)
// ----------------------------------------------------------------------------
export const ROUTINES: Routine[] = [
  // --- PUSH ---
  {
    // ≈ 4 min 40 s
    sessionType: 'push',
    moment: 'pre',
    exercises: [
      { exerciseId: 'sauts-etoile', sets: 1 },
      { exerciseId: 'torsions-torse', sets: 1 },
      { exerciseId: 'cercles-bras-avant', sets: 1 },
      { exerciseId: 'cercles-bras-arriere', sets: 1 },
      { exerciseId: 'balancier-bras', sets: 1 },
      { exerciseId: 'rotations-epaules-90', sets: 1 },
      { exerciseId: 'pompes-genoux-lentes', sets: 1 },
      { exerciseId: 'cercles-poignets', sets: 1 },
    ],
  },
  {
    // ≈ 4 min 05 s
    sessionType: 'push',
    moment: 'post-courte',
    exercises: [
      { exerciseId: 'etirement-pectoral-sol', sets: 1 },
      { exerciseId: 'etirement-epaule-croise', sets: 1 },
      { exerciseId: 'etirement-triceps', sets: 1 },
      { exerciseId: 'ouverture-epaules-assis', sets: 1 },
    ],
  },
  {
    // ≈ 8 min 10 s
    sessionType: 'push',
    moment: 'post-longue',
    exercises: [
      { exerciseId: 'etirement-pectoral-sol', sets: 2 },
      { exerciseId: 'etirement-epaule-croise', sets: 2 },
      { exerciseId: 'etirement-triceps', sets: 2 },
      { exerciseId: 'ouverture-epaules-assis', sets: 2 },
    ],
  },
  // --- PULL ---
  {
    // ≈ 4 min 40 s
    sessionType: 'pull',
    moment: 'pre',
    exercises: [
      { exerciseId: 'sauts-etoile', sets: 1 },
      { exerciseId: 'torsions-torse', sets: 1 },
      { exerciseId: 'cercles-bras-arriere', sets: 1 },
      { exerciseId: 'balancier-bras', sets: 1 },
      { exerciseId: 'chat-vache', sets: 1 },
      { exerciseId: 'charniere-hanche', sets: 1 },
      { exerciseId: 'rotation-thoracique', sets: 1 },
      { exerciseId: 'balancier-jambe-avant', sets: 1 },
    ],
  },
  {
    // ≈ 4 min 05 s
    sessionType: 'pull',
    moment: 'post-courte',
    exercises: [
      { exerciseId: 'suspension-passive', sets: 1 },
      { exerciseId: 'dos-rond-debout', sets: 1 },
      { exerciseId: 'avant-bras-genoux', sets: 1 },
      { exerciseId: 'genou-poitrine', sets: 1 },
      { exerciseId: 'ischios-debout', sets: 1 },
    ],
  },
  {
    // ≈ 8 min 10 s
    sessionType: 'pull',
    moment: 'post-longue',
    exercises: [
      { exerciseId: 'suspension-passive', sets: 2 },
      { exerciseId: 'dos-rond-debout', sets: 2 },
      { exerciseId: 'avant-bras-genoux', sets: 2 },
      { exerciseId: 'genou-poitrine', sets: 2 },
      { exerciseId: 'ischios-debout', sets: 2 },
    ],
  },
  // --- LEGS ---
  {
    // ≈ 4 min 40 s
    sessionType: 'legs',
    moment: 'pre',
    exercises: [
      { exerciseId: 'sauts-etoile', sets: 1 },
      { exerciseId: 'squat-poids-du-corps', sets: 1 },
      { exerciseId: 'balancier-jambe-avant', sets: 1 },
      { exerciseId: 'balancier-jambe-lateral', sets: 1 },
      { exerciseId: 'fentes-laterales', sets: 1 },
      { exerciseId: 'fentes-avant', sets: 1 },
      { exerciseId: 'cercles-genoux', sets: 1 },
      { exerciseId: 'montees-pointes', sets: 1 },
    ],
  },
  {
    // ≈ 4 min 40 s
    sessionType: 'legs',
    moment: 'post-courte',
    exercises: [
      { exerciseId: 'quadriceps-allonge', sets: 1 },
      { exerciseId: 'ischios-allonge', sets: 1 },
      { exerciseId: 'fessiers-psoas-allonge', sets: 1 },
      { exerciseId: 'papillon', sets: 1 },
      { exerciseId: 'squat-profond-tenu', sets: 1 },
    ],
  },
  {
    // ≈ 9 min 20 s
    sessionType: 'legs',
    moment: 'post-longue',
    exercises: [
      { exerciseId: 'quadriceps-allonge', sets: 2 },
      { exerciseId: 'ischios-allonge', sets: 2 },
      { exerciseId: 'fessiers-psoas-allonge', sets: 2 },
      { exerciseId: 'papillon', sets: 2 },
      { exerciseId: 'squat-profond-tenu', sets: 2 },
    ],
  },
];

// ----------------------------------------------------------------------------
// 3. TESTS DE SOUPLESSE (toutes les 3 à 4 semaines, après le post-workout Legs, muscles chauds)
// ----------------------------------------------------------------------------
export const FLEXIBILITY_TESTS: FlexibilityTest[] = [
  {
    id: 'flexion-avant',
    name: 'Flexion avant assis',
    instruction:
      'Assis, jambes tendues, pieds écartés d’environ 20 cm, orteils vers le plafond. Mètre ruban au sol entre les jambes, 0 aligné sur la plante des pieds. Penche-toi mains l’une sur l’autre et lis au bout des doigts : négatif avant les pieds, positif au-delà. 2 essais, garde le meilleur.',
    unit: 'cm',
    betterWhen: 'plus-haut',
  },
  {
    id: 'epaules',
    name: 'Mains dans le dos',
    instruction:
      'Debout, une main par-dessus l’épaule, l’autre remonte dans le dos. Mesure l’écart entre les majeurs, des deux côtés, et note le côté le plus raide. Négatif si les doigts se chevauchent. 2 essais, garde le meilleur.',
    unit: 'cm',
    betterWhen: 'plus-bas',
  },
  {
    id: 'hanches',
    name: 'Papillon',
    instruction:
      'Assis, plantes des pieds jointes, talons à une main du bassin, dos droit. Laisse descendre les genoux et mesure la distance genou-sol du genou le plus haut. 2 essais, garde le meilleur.',
    unit: 'cm',
    betterWhen: 'plus-bas',
  },
];
