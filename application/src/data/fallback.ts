import type { Lesson, GalleryItem, Rule } from '../types/content'
import type { Question } from '../types/quiz'

const lessons: Lesson[] = [
  {
    id: 'ia-intro',
    titre: "C'est quoi l'IA ?",
    description: "Comprendre comment fonctionne l'intelligence artificielle générative.",
    contenu: "L'intelligence artificielle générative est un type de système informatique capable de produire du texte, des images, du son ou de la vidéo de façon autonome. Elle apprend à partir de milliards d'exemples existants et peut en créer de nouveaux qui ressemblent à des contenus réels.",
    ordre: 1,
    duree_min: 5,
    icone: '🤖',
  },
  {
    id: 'fake-news',
    titre: "Qu'est-ce qu'une fake news ?",
    description: "Identifier une fausse information et comprendre pourquoi elle se propage.",
    contenu: "Une fake news est une information fausse ou trompeuse présentée comme vraie. Avec l'IA, il est désormais possible de créer des textes, images et vidéos très réalistes qui n'ont jamais existé. La désinformation se propage rapidement sur les réseaux sociaux car notre cerveau est attiré par les contenus choquants ou surprenants.",
    ordre: 2,
    duree_min: 5,
    icone: '📰',
  },
  {
    id: 'reperer',
    titre: 'Comment repérer un contenu douteux ?',
    description: "Les indices visuels et logiques qui trahissent un contenu généré par IA.",
    contenu: "Plusieurs indices permettent de repérer un contenu suspect : des doigts mal formés sur les images, des ombres incohérentes, un style d'écriture trop parfait, l'absence de source vérifiable, une URL inconnue, ou encore un titre très émotionnel conçu pour provoquer une réaction rapide.",
    ordre: 3,
    duree_min: 5,
    icone: '🔍',
  },
]

const gallery: GalleryItem[] = [
  {
    id: 1,
    titre: 'Photo de foule générée par IA',
    type: 'image',
    image_url: '',
    zones_suspectes: [
      { x: 10, y: 10, w: 20, h: 15, description: 'Visages flous et déformés' },
    ],
    indices: ['Visages irréels', 'Mains avec trop de doigts', 'Arrière-plan répétitif'],
    explication: "Cette image a été générée par un modèle de diffusion. Remarque les visages en arrière-plan : ils sont flous, avec des traits incohérents — un signe caractéristique des IA génératives.",
  },
]

const rules: Rule[] = [
  { id: 1, titre: 'Vérifie la source', description: "Est-ce un média connu et fiable ? Y a-t-il une signature d'auteur ?", icone: '🔎' },
  { id: 2, titre: 'Cherche d\'autres sources', description: "Si c'est vrai, d'autres médias sérieux en parlent aussi.", icone: '📡' },
  { id: 3, titre: 'Regarde la date', description: "Une vieille info peut être ressortie hors contexte pour manipuler.", icone: '📅' },
  { id: 4, titre: 'Méfie-toi de tes émotions', description: "Si l'info te choque ou t'énerve fort, c'est peut-être fait exprès.", icone: '❤️' },
  { id: 5, titre: 'Vérifie les images', description: "Utilise Google Images ou TinEye pour vérifier l'origine d'une photo.", icone: '🖼️' },
]

const questions: Question[] = [
  {
    id: 1,
    texte: "Une vidéo circule sur les réseaux montrant un responsable politique tenir des propos choquants. La vidéo semble très réaliste. Que fais-tu en premier ?",
    options: [
      "Je regarde les commentaires pour voir ce que les gens en pensent",
      "Je vérifie si des médias fiables parlent de cette vidéo",
      "Je regarde combien de vues elle a",
      'Je la partage en disant "si c\'est vrai c\'est grave"',
    ],
    bonne_reponse: 1,
    explication: "Une vidéo virale peut être un deepfake. Avant de croire ou partager, il faut vérifier si des médias fiables ou des sources officielles confirment l'information.",
    categorie: 'deepfake',
    difficulte: 'facile',
  },
  {
    id: 2,
    texte: "Une image d'actualité semble montrer une catastrophe spectaculaire. Quel détail peut être un indice qu'elle est générée par IA ?",
    options: [
      "Une lumière très forte",
      "Des mains ou objets déformés",
      "Une image très nette",
      "Des couleurs vives",
    ],
    bonne_reponse: 1,
    explication: "Les IA font souvent des erreurs dans les détails complexes : mains, doigts, textes, objets fusionnés, reflets incohérents.",
    categorie: 'deepfake',
    difficulte: 'facile',
  },
  {
    id: 3,
    texte: "Tu vois un article affirmant une information scientifique incroyable. Quelle vérification est la plus pertinente ?",
    options: [
      "Vérifier la date de publication",
      "Vérifier l'auteur et sa crédibilité",
      "Chercher si l'information existe ailleurs",
      "Toutes ces réponses",
    ],
    bonne_reponse: 3,
    explication: "La vérification d'une information repose sur plusieurs critères à la fois : auteur, source, date et présence dans d'autres médias.",
    categorie: 'sources',
    difficulte: 'facile',
  },
  {
    id: 4,
    texte: "Une image montre une foule immense lors d'un événement politique. Tout semble réaliste. Quel indice peut révéler une génération par IA ?",
    options: [
      "Les visages sont tous légèrement différents",
      "Certaines personnes ont des formes étranges ou des membres flous",
      "La foule est très dense",
      "L'image est en haute résolution",
    ],
    bonne_reponse: 1,
    explication: "Les IA peuvent générer des foules réalistes mais produisent parfois des silhouettes incohérentes ou des visages déformés.",
    categorie: 'deepfake',
    difficulte: 'moyen',
  },
  {
    id: 5,
    texte: 'Un ami t\'envoie un message : "Cette information est censurée par les médias, partage-la vite avant qu\'elle soit supprimée !" Quel est le bon réflexe ?',
    options: [
      "La partager rapidement",
      "Se méfier car ce type de message est souvent utilisé pour manipuler",
      "Lui faire confiance",
      "Ignorer complètement",
    ],
    bonne_reponse: 1,
    explication: "Les fake news utilisent souvent un sentiment d'urgence ou de secret pour pousser au partage sans vérification.",
    categorie: 'fake_news',
    difficulte: 'facile',
  },
  {
    id: 6,
    texte: "Tu veux vérifier si une image virale est authentique. Quelle méthode est la plus efficace ?",
    options: [
      "Regarder le nombre de likes",
      "Faire une recherche inversée d'image",
      "Lire les commentaires",
      "Vérifier le nombre d'abonnés du compte",
    ],
    bonne_reponse: 1,
    explication: "La recherche inversée d'image permet de voir si l'image existait déjà avant ou si elle a été utilisée dans un autre contexte.",
    categorie: 'sources',
    difficulte: 'facile',
  },
  {
    id: 7,
    texte: "Une vidéo semble montrer une célébrité annoncer une information importante. Le son et l'image semblent parfaits. Quel indice peut trahir un deepfake ?",
    options: [
      "Un clignement des yeux étrange",
      "Un décalage léger entre la voix et les lèvres",
      "Une lumière inhabituelle",
      "Tous ces indices",
    ],
    bonne_reponse: 3,
    explication: "Les deepfakes peuvent présenter de petites incohérences : synchronisation imparfaite, mouvements du visage anormaux ou éclairage incohérent.",
    categorie: 'deepfake',
    difficulte: 'moyen',
  },
  {
    id: 8,
    texte: 'Une publication affirme : "Cette photo prouve que cet événement a eu lieu hier." Quelle vérification est la plus pertinente ?',
    options: [
      "Vérifier la date originale de la photo",
      "Vérifier l'endroit où elle a été prise",
      "Chercher si la photo a déjà circulé auparavant",
      "Toutes ces réponses",
    ],
    bonne_reponse: 3,
    explication: "Beaucoup de fake news utilisent de vraies images mais sorties de leur contexte (autre pays, autre année).",
    categorie: 'fake_news',
    difficulte: 'moyen',
  },
  {
    id: 9,
    texte: "Un compte publie des centaines de messages politiques par jour, tous très similaires. Quel phénomène cela peut-il indiquer ?",
    options: [
      "Un journaliste très actif",
      "Un bot automatisé utilisant possiblement l'IA",
      "Une équipe de communication",
      "Un influenceur populaire",
    ],
    bonne_reponse: 1,
    explication: "Les campagnes de désinformation utilisent souvent des bots pour amplifier un message de manière artificielle.",
    categorie: 'ia',
    difficulte: 'moyen',
  },
  {
    id: 10,
    texte: "Tu dois déterminer rapidement si une information virale pourrait être fausse. Quelle est la première question à te poser ?",
    options: [
      "Est-ce que cette information provoque une émotion forte chez moi ?",
      "Qui est la source de cette information ?",
      "Est-ce que d'autres médias fiables en parlent ?",
      "Toutes ces questions",
    ],
    bonne_reponse: 3,
    explication: "Un bon réflexe est de prendre du recul et de se poser plusieurs questions : Quelle est la source ? L'information est-elle confirmée ailleurs ? Pourquoi ce contenu me fait-il réagir ?",
    categorie: 'fake_news',
    difficulte: 'difficile',
  },
]

export const fallback = { lessons, gallery, rules, questions }
