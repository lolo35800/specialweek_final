# Schéma de données — VériIA

## Vue d'ensemble

```
auth.users (Supabase Auth)
    │
    └─── profiles (1:1)
              │
              ├─── posts (1:N)
              │       │
              │       ├─── likes (N:M via user_id)
              │       └─── play_sessions (1:N)
              │
              ├─── likes (1:N)
              ├─── play_sessions (1:N)
              ├─── role_requests (1:N)
              ├─── challenges (1:N)  ← professeurs uniquement
              └─── challenge_participations (N:M via challenges)
```

---

## Tables

### `profiles`

Extension du profil utilisateur (lié à `auth.users`).

```
┌─────────────────────────────────────────────────────────────┐
│ profiles                                                     │
├──────────────┬───────────────────────────────┬──────────────┤
│ id           │ uuid PK, FK auth.users         │ NOT NULL     │
│ username     │ text UNIQUE                   │ NOT NULL     │
│ avatar_url   │ text                          │ nullable     │
│ banner_url   │ text                          │ nullable     │
│ bio          │ text                          │ nullable     │
│ role         │ text                          │ DEFAULT user │
│ xp           │ integer                       │ DEFAULT 0    │
│ games_played │ integer                       │ DEFAULT 0    │
│ posts_created│ integer                       │ DEFAULT 0    │
│ is_banned    │ boolean                       │ DEFAULT false│
│ created_at   │ timestamptz                   │ DEFAULT now()│
└──────────────┴───────────────────────────────┴──────────────┘
```

**Rôles possibles** : `user` · `admin` · `etudiant` · `expert_ia` · `professeur`

**RLS** :
- Lecture : public
- Modification : propriétaire uniquement

**Trigger** : création automatique à l'inscription (`handle_new_user`)

---

### `posts`

Contenu créé par les utilisateurs (quiz ou fake-or-real).

```
┌─────────────────────────────────────────────────────────────┐
│ posts                                                        │
├──────────────┬───────────────────────────────┬──────────────┤
│ id           │ uuid PK                       │ DEFAULT uuid │
│ author_id    │ uuid FK → profiles            │ NOT NULL     │
│ title        │ text                          │ NOT NULL     │
│ description  │ text                          │ nullable     │
│ type         │ text CHECK(quiz|fake_or_real) │ NOT NULL     │
│ content      │ jsonb                         │ DEFAULT {}   │
│ thumbnail_url│ text                          │ nullable     │
│ likes_count  │ integer                       │ DEFAULT 0    │
│ plays_count  │ integer                       │ DEFAULT 0    │
│ is_published │ boolean                       │ DEFAULT true │
│ is_flagged   │ boolean                       │ DEFAULT false│
│ created_at   │ timestamptz                   │ DEFAULT now()│
└──────────────┴───────────────────────────────┴──────────────┘
```

**Structure du champ `content` (JSONB)** :

Pour `type = 'quiz'` :
```json
{
  "questions": [
    {
      "id": "string",
      "texte": "string",
      "options": ["string", "string", "string", "string"],
      "bonne_reponse": 0,
      "explication": "string"
    }
  ]
}
```

Pour `type = 'fake_or_real'` :
```json
{
  "image_url": "string",
  "is_real": true,
  "explication": "string",
  "indices": ["string", "string"]
}
```

**RLS** :
- Lecture publique : `is_published = true AND is_flagged = false`
- Lecture admin : tous les posts
- Insertion : utilisateur authentifié (auteur)
- Modification / suppression : auteur ou admin

**XP accordé à la création** : +200 XP

---

### `likes`

Table de liaison utilisateur ↔ post.

```
┌─────────────────────────────────────────────────────────────┐
│ likes                                                        │
├──────────────┬───────────────────────────────┬──────────────┤
│ id           │ uuid PK                       │ DEFAULT uuid │
│ user_id      │ uuid FK → profiles            │ NOT NULL     │
│ post_id      │ uuid FK → posts               │ NOT NULL     │
│ created_at   │ timestamptz                   │ DEFAULT now()│
├──────────────┴───────────────────────────────┴──────────────┤
│ UNIQUE (user_id, post_id)                                    │
└─────────────────────────────────────────────────────────────┘
```

**RLS** : lecture publique · insertion/suppression : propriétaire

**RPCs** : `increment_likes(post_id)` · `decrement_likes(post_id)`

---

### `play_sessions`

Trace chaque partie jouée (anonyme ou connecté).

```
┌─────────────────────────────────────────────────────────────┐
│ play_sessions                                                │
├──────────────┬───────────────────────────────┬──────────────┤
│ id           │ uuid PK                       │ DEFAULT uuid │
│ user_id      │ uuid FK → profiles            │ nullable     │
│ post_id      │ uuid FK → posts               │ NOT NULL     │
│ score        │ integer                       │ NOT NULL     │
│ total        │ integer                       │ NOT NULL     │
│ duration_s   │ integer                       │ nullable     │
│ created_at   │ timestamptz                   │ DEFAULT now()│
└──────────────┴───────────────────────────────┴──────────────┘
```

**RLS** : insertion anonyme autorisée · lecture : propriétaire uniquement

**RPC** : `increment_plays(post_id)`

---

### `role_requests`

Demandes de changement de rôle soumises par les utilisateurs.

```
┌─────────────────────────────────────────────────────────────┐
│ role_requests                                                │
├──────────────┬───────────────────────────────┬──────────────┤
│ id           │ uuid PK                       │ DEFAULT uuid │
│ user_id      │ uuid FK → profiles            │ NOT NULL     │
│ username     │ text                          │ NOT NULL     │
│ requested_role│ text                         │ NOT NULL     │
│ message      │ text                          │ nullable     │
│ status       │ text                          │ DEFAULT pending│
│ created_at   │ timestamptz                   │ DEFAULT now()│
└──────────────┴───────────────────────────────┴──────────────┘
```

**Statuts** : `pending` · `approved` · `rejected`

**Rôles demandables** : `etudiant` · `expert_ia` · `professeur`

---

### `challenges`

Challenges créés par les professeurs.

```
┌─────────────────────────────────────────────────────────────┐
│ challenges                                                   │
├──────────────┬───────────────────────────────┬──────────────┤
│ id           │ uuid PK                       │ DEFAULT uuid │
│ creator_id   │ uuid FK → profiles            │ NOT NULL     │
│ title        │ text                          │ NOT NULL     │
│ type         │ text CHECK(quiz|fake_or_real) │ NOT NULL     │
│ join_code    │ text UNIQUE                   │ NOT NULL     │
│ config       │ jsonb                         │ DEFAULT {}   │
│ status       │ text CHECK(open|closed)       │ DEFAULT open │
│ created_at   │ timestamptz                   │ DEFAULT now()│
└──────────────┴───────────────────────────────┴──────────────┘
```

**`join_code`** : 6 caractères alphanumériques (charset sans O/0/I/1 pour lisibilité)

**`config` (JSONB, extensible)** :
```json
{
  "category": "fake_news | ia | deepfake | sources",
  "questionCount": 10
}
```

**RLS** :
- Lecture : tout utilisateur authentifié
- Création : rôle `professeur` uniquement
- Modification : créateur uniquement

---

### `challenge_participations`

Résultats des étudiants par challenge.

```
┌─────────────────────────────────────────────────────────────┐
│ challenge_participations                                     │
├──────────────┬───────────────────────────────┬──────────────┤
│ id           │ uuid PK                       │ DEFAULT uuid │
│ challenge_id │ uuid FK → challenges          │ NOT NULL     │
│ user_id      │ uuid FK → profiles            │ NOT NULL     │
│ score        │ integer                       │ nullable     │
│ total        │ integer                       │ nullable     │
│ duration_s   │ integer                       │ nullable     │
│ completed_at │ timestamptz                   │ nullable     │
│ joined_at    │ timestamptz                   │ DEFAULT now()│
├──────────────┴───────────────────────────────┴──────────────┤
│ UNIQUE (challenge_id, user_id)                               │
└──────────────┴───────────────────────────────┴──────────────┘
```

**Cycle de vie** :
1. `joined_at` rempli, `score = NULL` → étudiant rejoint
2. `score`, `total`, `completed_at` remplis → partie terminée

**RLS** :
- Lecture : propriétaire OU créateur du challenge
- Insertion : utilisateur authentifié
- Modification : propriétaire

**XP accordé à la complétion** : `50 + score × 10`

---

## Fonctions RPC (Supabase)

| Fonction | Description |
|----------|-------------|
| `increment_likes(post_id uuid)` | Incrémente `posts.likes_count` |
| `decrement_likes(post_id uuid)` | Décrémente `posts.likes_count` (min 0) |
| `increment_plays(post_id uuid)` | Incrémente `posts.plays_count` |

---

## Données fichiers (backend local)

En complément de Supabase, le backend gère des données statiques en JSON :

| Fichier | Route | Description |
|---------|-------|-------------|
| `backend/src/data/questions.json` | `GET /quiz/questions` | Questions du quiz |
| `backend/src/data/scores.json` | `GET/POST /scores` | Leaderboard local |
| `backend/src/data/lessons.json` | `GET /content/lessons` | Cours éducatifs |
| `backend/src/data/gallery.json` | `GET /content/gallery` | Galerie pédagogique |
| `backend/src/data/rules.json` | `GET /rules` | Règles anti-désinformation |

---

## Système XP

| Action | XP gagné |
|--------|----------|
| Créer un post | +200 |
| Terminer un jeu (score s) | +50 + s × 10 |
| Terminer un challenge (score s) | +50 + s × 10 |

**Niveau** = `floor(sqrt(xp / 100)) + 1`
