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
    texte: "Quel indice visuel trahit souvent une image générée par IA ?",
    options: ["Une résolution trop haute", "Des mains avec un nombre anormal de doigts", "Des couleurs trop vives", "Un fond blanc"],
    bonne_reponse: 1,
    explication: "Les IA génératives ont du mal à reproduire correctement les mains humaines, qui apparaissent souvent avec trop ou pas assez de doigts.",
    categorie: 'deepfake',
    difficulte: 'facile',
  },
  {
    id: 2,
    texte: "Pourquoi les fake news se propagent-elles si vite sur les réseaux sociaux ?",
    options: ["Parce qu'elles sont vraies", "Parce que les algorithmes favorisent les contenus choquants", "Parce qu'elles sont en anglais", "Parce que les journalistes les partagent"],
    bonne_reponse: 1,
    explication: "Les algorithmes des réseaux sociaux privilégient l'engagement. Les contenus qui provoquent de fortes émotions (peur, colère, surprise) génèrent plus d'interactions et sont donc plus diffusés.",
    categorie: 'fake_news',
    difficulte: 'facile',
  },
  {
    id: 3,
    texte: "Qu'est-ce qu'un deepfake ?",
    options: ["Un filtre photo classique", "Une vidéo ou image manipulée par IA pour faire dire ou faire des choses à quelqu'un", "Un réseau social secret", "Un type de virus informatique"],
    bonne_reponse: 1,
    explication: "Un deepfake utilise des algorithmes d'apprentissage profond pour superposer le visage ou la voix d'une personne sur un autre corps ou contexte, de manière très réaliste.",
    categorie: 'deepfake',
    difficulte: 'moyen',
  },
  {
    id: 4,
    texte: "Quelle est la première chose à faire face à une info surprenante ?",
    options: ["La partager immédiatement", "La liker", "Chercher d'autres sources fiables", "L'imprimer"],
    bonne_reponse: 2,
    explication: "Avant de partager une information, il est essentiel de vérifier qu'elle est relayée par plusieurs sources indépendantes et fiables.",
    categorie: 'sources',
    difficulte: 'facile',
  },
  {
    id: 5,
    texte: "L'IA peut-elle générer de faux articles de presse convaincants ?",
    options: ["Non, c'est impossible", "Oui, et ils peuvent être difficiles à distinguer des vrais", "Seulement en anglais", "Seulement des titres, pas des articles complets"],
    bonne_reponse: 1,
    explication: "Les grands modèles de langage (LLM) comme GPT peuvent générer des articles entiers avec un style journalistique très convaincant, inventant des faits, des citations et des sources.",
    categorie: 'ia',
    difficulte: 'moyen',
  },
  {
    id: 6,
    texte: "Quel outil permet de vérifier l'origine d'une image ?",
    options: ["Google Maps", "Google Images (recherche inversée)", "Google Translate", "Google Drive"],
    bonne_reponse: 1,
    explication: "La recherche d'images inversée de Google (ou TinEye) permet de trouver d'où provient une image et de voir si elle a été utilisée dans d'autres contextes.",
    categorie: 'sources',
    difficulte: 'facile',
  },
  {
    id: 7,
    texte: "Qu'est-ce que le 'cherry-picking' dans la désinformation ?",
    options: ["Choisir des cerises au supermarché", "Ne sélectionner que les faits qui confirment une idée préconçue", "Partager uniquement des bonnes nouvelles", "Inventer des statistiques"],
    bonne_reponse: 1,
    explication: "Le cherry-picking consiste à ne sélectionner que les données ou faits qui soutiennent une thèse, en ignorant tout ce qui la contredit, donnant ainsi une image faussement cohérente.",
    categorie: 'fake_news',
    difficulte: 'difficile',
  },
  {
    id: 8,
    texte: "Un titre très émotionnel ('SCANDALE !', 'CHOQUANT !') est souvent un signe de :",
    options: ["Information de qualité", "Contenu potentiellement clickbait ou manipulateur", "Article scientifique", "Communication officielle"],
    bonne_reponse: 1,
    explication: "Les titres alarmistes ou très émotionnels sont une technique de clickbait visant à provoquer une réaction immédiate et à pousser au partage sans lire ni vérifier l'article.",
    categorie: 'fake_news',
    difficulte: 'facile',
  },
  {
    id: 9,
    texte: "Quelle technologie est utilisée pour créer des voix synthétiques réalistes ?",
    options: ["Le Bluetooth", "La synthèse vocale par IA (Text-to-Speech / voice cloning)", "Le Wi-Fi 6", "La 5G"],
    bonne_reponse: 1,
    explication: "Des outils d'IA comme ElevenLabs ou les modèles de voice cloning peuvent reproduire la voix d'une personne à partir de quelques secondes d'enregistrement, créant des enregistrements audio entièrement faux.",
    categorie: 'deepfake',
    difficulte: 'moyen',
  },
  {
    id: 10,
    texte: "Parmi ces sites, lequel est un fact-checker reconnu en France ?",
    options: ["4chan", "Les Décodeurs (Le Monde)", "Reddit", "Twitter/X"],
    bonne_reponse: 1,
    explication: "Les Décodeurs est le service de vérification des faits du journal Le Monde. D'autres fact-checkers français reconnus incluent AFP Factuel et Libération CheckNews.",
    categorie: 'sources',
    difficulte: 'moyen',
  },
]

export const fallback = { lessons, gallery, rules, questions }
