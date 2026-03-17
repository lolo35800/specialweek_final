export interface Cle {
  slug: string
  titre: string
  accroche: string
  duree: string
  sections: {
    titre: string
    contenu: string
  }[]
}

export const CLES: Cle[] = [
  {
    slug: 'reconnaitre-deepfakes',
    titre: 'Reconnaître les deepfakes',
    accroche: 'Les images et vidéos générées par IA laissent des traces. Savoir les repérer est la première ligne de défense.',
    duree: '4 min',
    sections: [
      {
        titre: "Qu'est-ce qu'un deepfake ?",
        contenu: `Un deepfake est un contenu visuel ou audio fabriqué ou modifié par une intelligence artificielle pour paraître authentique. Le terme vient de "deep learning" (apprentissage profond) et "fake" (faux).

Les deepfakes peuvent représenter des personnes réelles en train de dire ou faire des choses qu'elles n'ont jamais faites. Ils sont utilisés pour manipuler l'opinion publique, diffamer des individus ou propager de fausses informations.`,
      },
      {
        titre: 'Les indices visuels à repérer',
        contenu: `Plusieurs signes peuvent trahir un deepfake :

**Le regard et les yeux** : les IA peinent à reproduire des clignements naturels. Observez si les yeux bougent de façon mécanique ou si les pupilles sont trop régulières.

**Les contours du visage** : cherchez des flous, des halos ou des déformations aux bords du visage, surtout quand la personne bouge la tête.

**Les oreilles et les cheveux** : détails complexes souvent mal rendus. Les boucles d'oreille peuvent disparaître ou les cheveux sembler "collés".

**La cohérence lumineuse** : la lumière sur le visage incrusté ne correspond pas toujours à l'éclairage de la scène.

**La bouche et les dents** : lors de la parole, les dents et la langue peuvent sembler floues ou irréelles.`,
      },
      {
        titre: 'Les outils de détection',
        contenu: `Plusieurs outils existent pour aider à détecter les contenus manipulés :

- **FotoForensics** : analyse les métadonnées et les artefacts de compression d'une image.
- **Google Images / TinEye** : recherche inverse pour trouver l'origine d'une image.
- **InVID / WeVerify** : outil de vérification de vidéos utilisé par les journalistes.
- **Deepware Scanner** : analyseur de deepfakes vidéo.

Ces outils ne sont pas infaillibles. L'approche la plus fiable reste le croisement de plusieurs sources.`,
      },
      {
        titre: 'Adopter les bons réflexes',
        contenu: `Face à un contenu suspect :

1. **Pause** — ne partagez pas immédiatement, même si le contenu vous choque ou vous émeut.
2. **Source** — qui a publié ce contenu ? Est-ce un compte vérifiable, avec un historique ?
3. **Contexte** — le contenu correspond-il à des événements réels ? Cherchez d'autres sources qui en parlent.
4. **Recoupement** — des médias indépendants et reconnus relaient-ils cette information ?

La vitesse de propagation d'un deepfake dépend de notre impatience à partager. Ralentir suffit souvent à stopper la désinformation.`,
      },
    ],
  },
  {
    slug: 'biais-cognitifs',
    titre: 'Les biais cognitifs face aux fake news',
    accroche: "Notre cerveau utilise des raccourcis qui nous rendent vulnérables à la manipulation. Les connaître, c'est s'en protéger.",
    duree: '5 min',
    sections: [
      {
        titre: 'Pourquoi notre cerveau se fait piéger',
        contenu: `Notre cerveau traite en permanence des milliers d'informations. Pour économiser de l'énergie, il utilise des raccourcis mentaux appelés heuristiques. Ces raccourcis sont efficaces au quotidien, mais ils peuvent être exploités par les créateurs de fausses informations.

La désinformation est souvent conçue pour déclencher des émotions fortes — colère, peur, indignation — car les émotions court-circuitent notre pensée critique et nous poussent à partager sans vérifier.`,
      },
      {
        titre: 'Le biais de confirmation',
        contenu: `C'est le biais le plus puissant : nous avons tendance à chercher, interpréter et mémoriser les informations qui confirment ce que nous croyons déjà.

Concrètement : si vous croyez qu'une technologie est dangereuse, vous retiendrez instinctivement les articles qui le confirment et minimiserez ceux qui le contredisent.

**Comment y résister** : cherchez activement des sources qui contredisent votre opinion. Si vous ne trouvez aucun argument contre votre point de vue, c'est suspect.`,
      },
      {
        titre: "L'effet de vérité illusoire",
        contenu: `Une affirmation répétée plusieurs fois nous semble plus vraie, indépendamment de sa véracité réelle. C'est pourquoi les campagnes de désinformation répètent inlassablement les mêmes messages.

Les réseaux sociaux amplifient cet effet : un post partagé des milliers de fois semble plus crédible qu'un article de qualité peu diffusé.

**Comment y résister** : la popularité d'une information n'est pas une preuve de sa véracité. Posez-vous la question : "Est-ce que je considère cela comme vrai parce que j'ai des preuves, ou parce que je l'ai souvent entendu ?"`,
      },
      {
        titre: 'Le biais de groupe',
        contenu: `Nous sommes des animaux sociaux. Nous avons tendance à adopter les croyances de notre groupe d'appartenance pour maintenir la cohésion sociale, même si ces croyances sont incorrectes.

Les algorithmes des réseaux sociaux créent des "bulles de filtre" qui renforcent ce biais : vous voyez de plus en plus de contenus que votre groupe partage, renforçant l'illusion que tout le monde pense comme vous.

**Comment y résister** : diversifiez vos sources d'information. Lisez des journalistes ou des experts avec lesquels vous n'êtes pas d'accord. Interrogez-vous : "Est-ce que je crois ça parce que c'est vrai, ou parce que mes amis le croient ?"`,
      },
      {
        titre: 'Entraîner son esprit critique',
        contenu: `L'esprit critique ne s'improvise pas, il se cultive :

- **SIFT** (Stop, Investigate, Find better coverage, Trace claims) : une méthode simple pour évaluer une information.
- **Slow news** : prenez le temps de lire en profondeur plutôt que de survoler des titres.
- **Journaux de bord** : notez vos croyances et vérifiez si elles résistent à l'épreuve des faits six mois plus tard.

La conscience de ses propres biais est le premier pas vers une pensée plus rigoureuse.`,
      },
    ],
  },
  {
    slug: 'verifier-sources',
    titre: 'Vérifier une source en 3 minutes',
    accroche: "La vérification d'une information ne demande pas d'être journaliste. Quelques réflexes suffisent.",
    duree: '3 min',
    sections: [
      {
        titre: 'La méthode SIFT',
        contenu: `SIFT est une méthode développée par Mike Caulfield, chercheur spécialisé en littératie numérique. Elle tient en quatre étapes :

**S — Stop (Arrêtez-vous)** : avant de partager ou de réagir, marquez une pause. L'émotion est l'ennemie de la vérification.

**I — Investigate the source (Enquêtez sur la source)** : qui publie ce contenu ? Depuis quand ? Quel est son historique ?

**F — Find better coverage (Trouvez de meilleures sources)** : d'autres médias indépendants couvrent-ils cette information ?

**T — Trace claims (Remontez aux sources originales)** : l'information cite-t-elle des études, des experts ? Vérifiez ces sources directement.`,
      },
      {
        titre: 'Évaluer un site web',
        contenu: `Quelques questions à se poser face à un site inconnu :

- **Qui est derrière ce site ?** Cherchez la page "À propos". Les sites sérieux indiquent leur équipe, leur financement, leur ligne éditoriale.
- **Quel est le domaine ?** Les domaines comme ".info" ou les noms qui imitent des médias connus (ex: "lemondefrance.net") sont des signaux d'alerte.
- **Y a-t-il des publicités agressives ?** Les sites qui monétisent l'indignation ont peu d'incitation à vérifier leurs informations.
- **Les articles ont-ils des auteurs identifiés ?** Un article sans signature est un signal faible.`,
      },
      {
        titre: 'La recherche inversée',
        contenu: `La recherche inversée d'image est une technique puissante :

1. Faites un clic droit sur l'image suspecte
2. Choisissez "Rechercher l'image" (Chrome/Edge) ou copiez l'URL
3. Collez dans **Google Images** ou **TinEye**

Vous verrez ainsi si l'image a déjà été publiée ailleurs, dans un contexte différent. Une image présentée comme récente mais qui date de dix ans est un signe clair de manipulation.

Pour les vidéos, **InVID** permet d'extraire des images clés et de les soumettre à une recherche inversée.`,
      },
      {
        titre: 'Les sites de fact-checking',
        contenu: `En France, plusieurs organisations professionnelles vérifient les faits :

- **AFP Factuel** (factuel.afp.com) — vérifications de l'Agence France-Presse
- **Les Décodeurs** (Le Monde) — fact-checking journalistique
- **Libération Checknews** — réponses aux questions des lecteurs
- **France Info Vrai ou Fake** — vérifications vidéo

Au niveau international :
- **Snopes** (anglais) — l'un des plus anciens fact-checkers
- **Full Fact** (anglais) — UK

Ces sources ne sont pas infaillibles, mais elles utilisent des méthodes transparentes et publiables.`,
      },
    ],
  },
  {
    slug: 'ia-generative-risques',
    titre: "L'IA générative et ses risques",
    accroche: "ChatGPT, Midjourney, Sora... Les outils d'IA générative révolutionnent la création de contenu — et la désinformation.",
    duree: '4 min',
    sections: [
      {
        titre: "Qu'est-ce que l'IA générative ?",
        contenu: `L'IA générative désigne des modèles d'intelligence artificielle capables de créer du contenu nouveau : textes, images, sons, vidéos. Contrairement aux IA classiques qui classifient ou prédisent, les IA génératives produisent.

Les grands modèles de langage (LLM) comme GPT-4 ou Mistral génèrent du texte. Midjourney, DALL-E ou Stable Diffusion créent des images. Sora ou Runway génèrent des vidéos.

Ces outils sont accessibles à tous, souvent gratuitement, et ne nécessitent aucune compétence technique.`,
      },
      {
        titre: 'Les nouvelles formes de désinformation',
        contenu: `L'IA générative a démocratisé la production de fausses informations :

**Les "hallucinations" de l'IA** : les LLM inventent parfois des faits plausibles mais faux — citations inexistantes, statistiques erronées, événements jamais survenus. Ces erreurs sont présentées avec la même assurance que les informations vraies.

**Les faux articles de presse** : en quelques secondes, une IA peut rédiger un article complet imitant le style d'un grand journal. Sans logo, il est difficile à distinguer d'un vrai article.

**Les fausses citations** : une image d'une personnalité publique accompagnée d'une citation fabriquée peut être créée en minutes.

**Les avatars synthétiques** : de faux experts, présentateurs ou témoins entièrement générés par IA apparaissent dans des vidéos de désinformation.`,
      },
      {
        titre: 'Comment reconnaître un texte généré par IA',
        contenu: `Certains indices peuvent trahir un texte généré :

- **Fluidité excessive** : le texte est trop bien structuré, sans aspérités ni style personnel.
- **Absence de prise de position** : les LLM tendent à "équilibrer" les points de vue même sur des sujets où un consensus scientifique existe.
- **Formulations répétitives** : certaines tournures sont sur-représentées ("Il est important de noter que...", "En conclusion...").
- **Précision sans source** : des chiffres très précis cités sans référence vérifiable.

Des outils comme **GPTZero** ou **Originality.ai** tentent de détecter les textes générés, mais leurs résultats restent imparfaits.`,
      },
      {
        titre: 'Adapter ses pratiques',
        contenu: `Face à la montée de l'IA générative, quelques principes s'imposent :

**Pour les contenus textuels** : redoublez de vigilance sur les citations directes et les statistiques. Cherchez la source primaire — l'étude originale, le discours enregistré — plutôt que la paraphrase.

**Pour les images** : une image très "propre", trop parfaite, avec des détails incohérents (mains, bijoux, arrière-plans) peut être générée. Faites une recherche inversée.

**Pour les vidéos** : les deepfakes vidéo s'améliorent rapidement. Concentrez-vous sur la cohérence du son et de l'image, les transitions, le contexte.

La règle d'or reste : plus une information vous choque ou vous émeut, plus elle mérite d'être vérifiée.`,
      },
    ],
  },
]
