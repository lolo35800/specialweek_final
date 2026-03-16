# VériIA — Plan Spéciale Week

**Stack** : React + TypeScript (PWA) · Python + FastAPI · JSON

## Équipe
| Membre | Niveau | Rôle |
|--------|--------|------|
| Jean-Marc | B2 (Lead) | Lead Frontend (React/TS) + PWA |
| Sébastien | B2 | Frontend UI/UX + contenu pédagogique |
| Enora | B1 | Backend (Python/FastAPI) |
| Hugo | B1 | Fullstack + DevOps + mini-jeux |

## Jours
- [Jour 1 — Bases & Setup](jour1.md) ✅
- [Jour 2 — Dev Web](jour2.md)
- [Jour 3 — Backend + Mini-jeux](jour3.md)
- [Jour 4 — Mobile + Dashboard](jour4.md)
- [Jour 5 — Finitions + Pitch](jour5.md)

## Livrables
| Niveau | Livrable |
|--------|----------|
| 1 | Frontend PWA + Backend FastAPI + Stockage JSON |
| 2 | `docs/api.md` + `docs/schema_donnees.md` |
| 3 | Maquettes Figma (export PDF) |
| 4 | Démo 3 min scénario concret (web + mobile) |

## Points de vigilance
- **CORS** : `allow_origins` FastAPI inclut `localhost:5173` et `5174`
- **PWA** : tester en `npm run build && npm run preview` (pas en dev)
- **Zones suspectes** : coordonnées en **% relatif**, pas en pixels
- **Fallback** : `src/data/fallback.ts` obligatoire si API down pendant la démo
