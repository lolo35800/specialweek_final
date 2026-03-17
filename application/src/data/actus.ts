export interface Actu {
  id: string
  date: string
  timestamp?: number
  categorie: string
  titre: string
  resume: string
  source: string
  lien: string
  une?: boolean
}

export const ACTUS: Actu[] = [
  {
    id: 'deepfake-election',
    date: '14 mars 2025',
    categorie: 'Politique',
    titre: 'Des deepfakes de candidats diffusés massivement avant les élections',
    resume: "Des vidéos truquées de candidats aux élections européennes ont circulé sur TikTok et Instagram, vues plus de 30 millions de fois avant d'être supprimées. Une nouvelle alerte sur la désinformation électorale.",
    source: 'Le Monde',
    lien: '/comprendre/reconnaitre-deepfakes',
    une: true,
  },
  {
    id: 'chatgpt-lycee',
    date: '8 mars 2025',
    categorie: 'Éducation',
    titre: 'ChatGPT dans les lycées : entre atout pédagogique et risque de triche',
    resume: "De plus en plus d'élèves utilisent l'IA pour leurs devoirs. Les enseignants cherchent comment adapter leurs pratiques face à cet outil qui peut autant aider qu'induire en erreur.",
    source: 'Libération',
    lien: '/comprendre/ia-generative-risques',
    une: true,
  },
  {
    id: 'sora-video',
    date: '2 mars 2025',
    categorie: 'Technologie',
    titre: "Sora d'OpenAI : des vidéos réalistes en quelques secondes accessibles à tous",
    resume: "Le générateur vidéo de OpenAI est désormais disponible en Europe. Des vidéos d'événements fictifs deviennent impossibles à distinguer du réel à l'œil nu.",
    source: 'Numerama',
    lien: '/comprendre/ia-generative-risques',
  },
  {
    id: 'fact-check-ia',
    date: '25 fév. 2025',
    categorie: 'Médias',
    titre: "L'AFP développe un outil IA pour détecter les fausses images en temps réel",
    resume: "L'agence de presse mondiale lance un système automatique de vérification des images qui circulent sur les réseaux sociaux, capable d'analyser 10 000 images par heure.",
    source: 'AFP Factuel',
    lien: '/comprendre/verifier-sources',
  },
  {
    id: 'biais-ado',
    date: '18 fév. 2025',
    categorie: 'Société',
    titre: '76 % des 15-24 ans déclarent avoir partagé une info sans la vérifier',
    resume: "Une étude de l'IFOP révèle que les jeunes sont les plus exposés à la désinformation sur les réseaux sociaux, mais aussi les plus confiants dans leur capacité à la détecter.",
    source: 'IFOP',
    lien: '/comprendre/biais-cognitifs',
  },
]
