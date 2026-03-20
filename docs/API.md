# Documentation API — VériIA

**Base URL (dev)** : `http://localhost:8000`
**Proxy Vite** : les routes `/actus`, `/quiz`, `/scores` sont proxifiées automatiquement en dev.

---

## Authentification

L'API backend est **publique** (pas de token requis). L'authentification est gérée côté Supabase (RLS) pour les opérations sur la base de données.

---

## Actualités

### `GET /actus`

Retourne les dernières actualités IA (flux Google News RSS, 7 derniers jours).

**Cache** : 1 heure en mémoire.

**Réponse** `200 OK`
```json
[
  {
    "id": "rss-0-1742400000000",
    "titre": "ChatGPT franchit le cap des 300 millions d'utilisateurs",
    "resume": "OpenAI annonce une nouvelle étape pour son assistant IA...",
    "source": "Le Monde",
    "lien": "https://...",
    "categorie": "Business",
    "date": "19 mars 2026",
    "timestamp": 1742400000000,
    "une": true
  }
]
```

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | Identifiant unique |
| `titre` | `string` | Titre de l'article |
| `resume` | `string` | Extrait (max 150 chars) |
| `source` | `string` | Nom du media |
| `lien` | `string` | URL de l'article original |
| `categorie` | `string` | `IA & Tech`, `Politique`, `Éducation`, `Réseaux Sociaux`, `Business`, `Cybersécurité` |
| `date` | `string` | Date formatée en français |
| `timestamp` | `number` | Timestamp ms (pour tri) |
| `une` | `boolean` | `true` pour le premier article (mis en avant) |

---

### `GET /actus-summary`

Génère un résumé IA des 7 dernières actualités via Groq (llama-3.3-70b).

**Prérequis** : variable d'env `GROQ_API_KEY`.
**Cache** : 1 heure.

**Réponse** `200 OK`
```json
{
  "summary": "L'IA continue de transformer l'éducation avec de nouveaux outils..."
}
```

**Erreur** `502`
```json
{ "detail": "Impossible de générer le résumé." }
```

---

## Quiz

### `GET /quiz/questions`

Retourne les questions du quiz.

**Query params**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `shuffle` | `string` | — | Mettre `true` pour mélanger les questions |

**Réponse** `200 OK`
```json
{
  "questions": [
    {
      "id": 1,
      "texte": "Qu'est-ce qu'un deepfake ?",
      "options": ["Une fausse vidéo générée par IA", "Un virus informatique", "Un réseau social", "Un logiciel de retouche"],
      "bonne_reponse": 0,
      "explication": "Un deepfake est une vidéo ou image falsifiée par IA...",
      "categorie": "deepfake",
      "difficulte": "facile"
    }
  ]
}
```

| Champ | Type | Valeurs |
|-------|------|---------|
| `id` | `number` | — |
| `texte` | `string` | — |
| `options` | `string[4]` | 4 options |
| `bonne_reponse` | `0 \| 1 \| 2 \| 3` | Index de la bonne réponse |
| `explication` | `string` | — |
| `categorie` | `string` | `fake_news`, `ia`, `deepfake`, `sources` |
| `difficulte` | `string` | `facile`, `moyen`, `difficile` |

---

### `GET /quiz/questions/:id`

Retourne une question par son ID.

**Réponse** `200 OK` : question unique
**Réponse** `404` : question introuvable

---

## Scores

### `POST /scores`

Soumet un score après une partie.

**Body**
```json
{
  "username": "alice",
  "score": 8,
  "total": 10,
  "module": "quiz"
}
```

| Champ | Type | Contraintes |
|-------|------|-------------|
| `username` | `string` | requis, max 50 chars |
| `score` | `number` | entier ≥ 0, ≤ total |
| `total` | `number` | entier entre 1 et 1000 |
| `module` | `string` | `quiz`, `fake_or_real`, `incoherences`, `spot_zone` |

**Réponse** `201 Created`
```json
{
  "id": "uuid",
  "username": "alice",
  "score": 8,
  "total": 10,
  "module": "quiz",
  "timestamp": "2026-03-19T12:00:00.000Z"
}
```

**Erreur** `400 Bad Request`
```json
{ "error": "Score cannot exceed total" }
```

---

### `GET /scores`

Leaderboard (meilleurs scores).

**Query params**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `limit` | `number` | `10` | Max résultats (1–100) |
| `module` | `string` | — | Filtrer par module |

**Réponse** `200 OK`
```json
{
  "scores": [
    {
      "id": "uuid",
      "username": "alice",
      "score": 10,
      "total": 10,
      "module": "quiz",
      "timestamp": "2026-03-19T12:00:00.000Z"
    }
  ]
}
```

---

### `GET /scores/:username`

Scores d'un utilisateur spécifique (insensible à la casse).

**Réponse** `200 OK`
```json
{
  "scores": [...]
}
```

---

## IA

### `POST /ai/analyze`

Analyse de contenu (texte ou image) pour détecter la désinformation.
**Note** : réponse simulée (mock), pas de vrai modèle.

**Body**
```json
{
  "type": "text",
  "content": "RÉVÉLATION CHOC : le gouvernement censure cette vérité !"
}
```

| Champ | Valeurs |
|-------|---------|
| `type` | `text`, `image_url` |
| `content` | Texte ou URL |

**Réponse** `200 OK`
```json
{
  "is_likely_fake": true,
  "confidence": 0.82,
  "reasons": [
    "Le titre utilise des termes alarmistes",
    "Aucune source citée",
    "Le contenu joue sur les émotions"
  ],
  "tips": [
    "Vérifie la source de l'information",
    "Cherche d'autres articles sur le même sujet",
    "Méfie-toi des titres en majuscules"
  ]
}
```

---

### `POST /ai/chat`

Chat avec l'assistant pédagogique IA (Groq / llama-3.3-70b).

**Prérequis** : `GROQ_API_KEY`.

**Body**
```json
{
  "message": "C'est quoi un deepfake ?",
  "history": [
    { "role": "user", "content": "Bonjour" },
    { "role": "assistant", "content": "Bonjour ! Comment puis-je t'aider ?" }
  ]
}
```

| Champ | Contraintes |
|-------|-------------|
| `message` | 1–2000 chars, requis |
| `history` | Tableau de `{role, content}`, max 10 échanges |

**Réponse** `200 OK`
```json
{
  "reply": "Un deepfake est une vidéo ou image falsifiée grâce à l'intelligence artificielle...",
  "model": "llama-3.3-70b-versatile"
}
```

**Erreurs**

| Code | Cause |
|------|-------|
| `400` | Message invalide ou historique malformé |
| `500` | Clé API manquante |
| `502` | Service Groq indisponible |
| `504` | Timeout (>30s) |

---

## Contenu éducatif

### `GET /content/lessons` — Liste des leçons
### `GET /content/lessons/:id` — Leçon par ID (`404` si introuvable)
### `GET /content/gallery` — Galerie d'images pédagogiques
### `GET /rules` — Règles anti-désinformation

---

## Variables d'environnement backend

| Variable | Requis | Description |
|----------|--------|-------------|
| `GROQ_API_KEY` | Optionnel | Clé API Groq (chat IA + résumé actus) |
| `FRONTEND_URL` | Optionnel | URL du frontend autorisée CORS |
| `PORT` | Optionnel | Port serveur (défaut : `8000`) |
