# Ce qu'on a fait et pourquoi — Jour 1

Ce fichier explique les choix techniques faits durant le Jour 1, pour que toute l'équipe comprenne la structure du projet.

---

## Structure du projet

```
specialweek1/
├── application/   ← tout le frontend React
├── backend/       ← tout le backend Python
├── docs/          ← documentation (API, schéma données)
└── tasks/         ← todo par jour + ce fichier
```

On a séparé le frontend et le backend dans deux dossiers distincts. Ça permet à Jean-Marc / Sébastien de bosser sur `application/` sans toucher à `backend/`, et à Enora / Hugo de bosser sur `backend/` sans conflit Git.

---

## Frontend — React + TypeScript (Vite)

### Pourquoi React Router ?

Sans router, une SPA (Single Page Application) React n'a qu'une seule URL. On a installé `react-router-dom` pour avoir de vraies URLs par page (`/comprendre`, `/jouer/quiz`, etc.), ce qui permet :
- de naviguer avec le bouton retour du navigateur
- de partager un lien direct vers une page
- de découper le code par route (lazy loading plus tard)

### Comment ça marche ?

Dans `App.tsx`, on a un `<BrowserRouter>` qui enveloppe tout, puis des `<Routes>` qui définissent quelle page s'affiche selon l'URL.

```
/              → Home.tsx
/comprendre    → Comprendre.tsx
/illustrer     → Illustrer.tsx
/jouer         → Jouer.tsx  (liste des mini-jeux)
/jouer/quiz    → Quiz.tsx
/dashboard     → Dashboard.tsx
/regles        → ReglesAntiDesinfo.tsx
/*             → NotFound.tsx  (page 404)
```

Toutes ces pages s'affichent à l'intérieur du `<Layout>` (qui contient la Navbar + le Footer), grâce à `<Outlet />`.

### Les Types TypeScript (`src/types/`)

On a défini des interfaces TypeScript pour les données qu'on va utiliser dans toute l'app :

- `content.ts` → `Lesson`, `GalleryItem`, `SuspectZone`, `Rule`
- `quiz.ts` → `Question`, `QuizAnswer`, `QuizResult`
- `score.ts` → `Score`, `SubmitScorePayload`, `Module`

**Pourquoi ?** Ça permet à TypeScript de nous signaler une erreur si on utilise une propriété qui n'existe pas. Par exemple, si on essaie d'accéder à `question.reponse` alors que la propriété s'appelle `bonne_reponse`, TypeScript nous arrête avant même de lancer l'app.

### Les Services (`src/services/`)

**`api.ts`** — le client HTTP de base. Il lit la variable d'environnement `VITE_API_URL` (définie dans `.env`) pour savoir où est le backend. Toutes les requêtes passent par ses fonctions `get()` et `post()`.

**`contentService.ts`** — regroupe tous les appels liés au contenu : leçons, galerie, règles.

**`scoreService.ts`** — regroupe les appels liés aux scores : soumettre, récupérer le leaderboard, scores d'un utilisateur.

**Pourquoi séparer en services ?** Pour ne pas mélanger la logique réseau dans les composants React. Un composant ne doit pas savoir que les données viennent d'une API — il appelle juste `getLessons()` et reçoit ses données.

### Le Fallback (`src/data/fallback.ts`)

Ce fichier contient toutes les données en dur : 10 questions, 3 leçons, 2 exemples de galerie, 5 règles.

**Pourquoi ?** Si le backend est éteint pendant la démo (ou si Enora est en train de le modifier), l'app continue de fonctionner. Les services essaient d'abord l'API, et si ça échoue ils utilisent le fallback automatiquement.

### Le Hook `useLocalStorage`

Un hook React personnalisé qui fonctionne comme `useState` mais sauvegarde la valeur dans le `localStorage` du navigateur. La valeur survit donc à un rechargement de page.

**Utilisé pour :** garder en mémoire le pseudo du joueur, sa progression dans les leçons, ses scores locaux.

### Variables CSS (`src/index.css`)

On a défini des variables CSS globales pour les couleurs du projet :

```css
--accent         → violet principal (#7c3aed)
--accent-bg      → fond violet transparent
--danger         → rouge pour les fausses infos (#dc2626)
--success        → vert pour les bonnes réponses (#16a34a)
--warning        → orange pour les alertes (#d97706)
```

**Pourquoi ?** Ça permet de changer la couleur principale de toute l'app en modifiant une seule ligne. Et ça s'adapte automatiquement au mode sombre/clair.

---

## Backend — Python + FastAPI

### Pourquoi FastAPI ?

FastAPI est un framework Python moderne qui :
- génère automatiquement une documentation interactive (Swagger UI sur `/docs`)
- valide automatiquement les données reçues grâce à Pydantic
- est très rapide à coder et à lire

### Structure des fichiers

```
backend/app/
├── main.py          ← point d'entrée, configure CORS, monte les routers
├── routers/         ← un fichier par "domaine" de l'API
│   ├── content.py   ← leçons et galerie
│   ├── quiz.py      ← questions du quiz
│   ├── scores.py    ← soumission et lecture des scores
│   ├── ai_mock.py   ← fausse IA (répond comme si elle analysait une image/texte)
│   └── rules.py     ← les 5 règles anti-désinfo
├── models/
│   └── score.py     ← modèle Pydantic pour valider les scores
└── data/            ← fichiers JSON (base de données simple)
    ├── questions.json
    ├── lessons.json
    ├── gallery.json
    ├── rules.json
    └── scores.json  ← commence vide, se remplit au fur et à mesure
```

**Pourquoi des fichiers JSON et pas une vraie base de données ?** C'est la semaine spéciale, on n'a pas le temps de configurer PostgreSQL. Les fichiers JSON sont simples, lisibles par tous, et suffisent pour stocker quelques dizaines de scores.

### Le CORS

CORS (Cross-Origin Resource Sharing) est une sécurité du navigateur qui bloque les requêtes vers un domaine différent de celui de la page. Notre frontend est sur `localhost:5173` et notre backend sur `localhost:8000` — ce sont deux "origins" différentes.

On a configuré FastAPI pour **autoriser** les requêtes venant de `localhost:5173` et `5174`. Sans ça, le navigateur bloquerait toutes nos requêtes API.

### Le Mock IA (`ai_mock.py`)

Ce router simule une IA qui analyse du texte ou une image et dit si c'est probablement faux. En réalité, il cherche des mots-clés suspects dans le texte ("scandale", "choquant", etc.) et génère une réponse semi-aléatoire avec un niveau de confiance.

**Pourquoi pas une vraie IA ?** Une vraie IA (OpenAI, Mistral...) nécessite une clé API, coûte de l'argent, et introduit une dépendance externe. Le mock suffit pour démontrer le concept lors du pitch.

### Lancer le backend

```bash
cd backend
python3 -m uvicorn app.main:app --reload --port 8000
```

Le `--reload` relance automatiquement le serveur quand tu modifies un fichier Python. La doc Swagger est dispo sur `http://localhost:8000/docs`.

---

## Le `.env`

Le fichier `.env` dans `application/` contient :
```
VITE_API_URL=http://localhost:8000
```

Ce fichier est dans le `.gitignore` (il ne sera pas pushé sur Git) car il peut contenir des secrets (clés API, mots de passe). En prod, on mettrait l'URL du serveur de déploiement.

---

## Résumé visuel du flux de données

```
Navigateur
    │
    ├─ React (application/)
    │      │
    │      ├─ src/services/api.ts          → fetch vers :8000
    │      ├─ src/data/fallback.ts         → données statiques si API down
    │      └─ localStorage                 → scores + progression locale
    │
    └─ FastAPI (backend/)
           │
           ├─ /content/lessons             → lessons.json
           ├─ /content/gallery             → gallery.json
           ├─ /quiz/questions              → questions.json
           ├─ /scores                      → scores.json
           ├─ /rules                       → rules.json
           └─ /ai/analyze                  → logique mock en Python
```
