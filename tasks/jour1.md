# Jour 1 — Bases & Setup ✅

**Critère done** : React tourne avec navigation, backend FastAPI répond sur `/`, types TS créés, 10 questions rédigées.

## Fait ✅
- [x] Structure `tasks/`, `backend/`, `docs/` créée
- [x] `react-router-dom` installé
- [x] `App.tsx` refactorisé avec `BrowserRouter` + `Routes`
- [x] Pages vierges : Home, Comprendre, Illustrer, Jouer, Quiz, Dashboard, ReglesAntiDesinfo, NotFound
- [x] `Navbar.tsx` + `Layout.tsx` + `Footer.tsx` avec CSS
- [x] Types TypeScript : `src/types/content.ts` · `quiz.ts` · `score.ts`
- [x] Services : `api.ts` · `contentService.ts` · `scoreService.ts`
- [x] Hook `useLocalStorage.ts`
- [x] `src/data/fallback.ts` (10 questions + 3 leçons + galerie + 5 règles)
- [x] `.env` avec `VITE_API_URL=http://localhost:8000`
- [x] Proxy Vite `/api → :8000` dans `vite.config.ts`
- [x] Backend FastAPI : `main.py` + CORS + tous les routers
- [x] Routers : `content` · `quiz` · `scores` · `ai_mock` · `rules`
- [x] Données JSON : `questions.json` · `lessons.json` · `gallery.json` · `rules.json` · `scores.json`
- [x] Variables CSS projet (`--accent`, `--danger`, `--success`, `--warning`)
- [x] Build prod sans erreur (0 erreur TypeScript)

## Reste à faire manuellement
- [ ] **Sébastien** : Wireframes Figma (Home, Comprendre, Jouer, Illustrer)
- [ ] Brief UX commun : valider palette + typographie + ton
- [ ] Initialiser Git + `.gitignore`

## Commandes pour démarrer
```bash
# Frontend
cd application && npm run dev       # → http://localhost:5173

# Backend
cd backend && python3 -m uvicorn app.main:app --reload --port 8000
# Swagger → http://localhost:8000/docs
```
