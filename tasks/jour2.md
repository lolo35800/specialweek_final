# Jour 2 — Dev Web

**Critère done** : "Comprendre" affiche du vrai contenu depuis l'API. Galerie navigable. Quiz 10 questions fonctionnel avec score. Scores soumis à l'API.

## Jean-Marc — Lead Frontend
- [ ] Implémenter `Comprendre.tsx` : fetch `/content/lessons`, afficher avec `LessonCard.tsx`
- [ ] Créer `LessonPage.tsx` : page détail leçon + bouton retour
- [ ] Connecter soumission score quiz à `POST /scores` via `scoreService.ts`

## Sébastien — UI/UX
- [ ] Implémenter `Illustrer.tsx` + `GalleryItem.tsx` : grille cliquable
- [ ] Créer `Modal.tsx` : popup explication au clic sur un exemple
- [ ] Ajouter badge "FICTIF" visible sur chaque item de galerie
- [ ] Polish `Home.tsx` : hero visuel fort, CTA clair, animations hover
- [ ] Composants UI réutilisables : `Button.tsx`, `Card.tsx`, `ProgressBar.tsx`

## Enora — Backend
- [ ] Vérifier `GET /quiz/questions` fonctionne (déjà codé, tester avec curl)
- [ ] Vérifier `GET /content/gallery` (déjà codé, tester avec curl)
- [ ] Valider tous les endpoints sur Swagger UI (`/docs`)
- [ ] Tester `POST /scores` + `GET /scores` avec données réelles

## Hugo — Fullstack
- [ ] Implémenter `Quiz.tsx` + `useQuiz.ts` : logique complète (question courante, score)
- [ ] Créer `QuizQuestion.tsx` : affichage question + 4 options
- [ ] Créer `QuizScore.tsx` : écran fin avec score, recap, bouton replay
- [ ] Timer 30s par question avec `ProgressBar`
- [ ] Fetch questions depuis API (fallback automatique si API down)
