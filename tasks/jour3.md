# Jour 3 — Backend + Mini-jeux

**Critère done** : Les deux mini-jeux sont jouables. Mock IA répond. Toutes les pages connectées au backend. Flux Home → Quiz → Score → Dashboard testé end-to-end.

## Jean-Marc — Lead Frontend
- [ ] Implémenter `FakeOrReal.tsx` : afficher item galerie, boutons "Fake"/"Réel", feedback immédiat
- [ ] Implémenter `Dashboard.tsx` : score perso (localStorage) + leaderboard `GET /scores`
- [ ] Créer `ScoreBoard.tsx` : tableau top 10

## Sébastien — UI/UX
- [ ] Implémenter `SpotTheZone.tsx` : image cliquable avec zones suspectes (coords en %)
- [ ] Feedback zones : vert + explication si correct, "cherche encore" sinon
- [ ] Check responsive mobile (375px) sur toutes les pages existantes
- [ ] Commencer maquettes Figma haute fidélité (livrable niveau 3)

## Enora — Backend
- [ ] Vérifier `POST /ai/analyze` (mock IA déjà codé — tester avec curl)
- [ ] Vérifier `GET /rules` fonctionne
- [ ] Rédiger `docs/api.md` : documenter chaque endpoint avec exemples (livrable niveau 2)
- [ ] Nettoyer Swagger UI : vérifier descriptions et exemples

## Hugo — Fullstack
- [ ] Intégrer mock IA dans `SpotTheZone` : clic zone → `POST /ai/analyze` → feedback enrichi
- [ ] Créer `ProgressTracker.tsx` : progression dans les leçons (localStorage)
- [ ] Implémenter `useScore.ts` : hook centralisant localStorage + soumission API
- [ ] Tester flux complet : Home → Comprendre → Quiz → Score soumis → Dashboard affiché
