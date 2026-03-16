# Jour 4 — Mobile + Dashboard

**Critère done** : App installable comme PWA (Lighthouse audit OK). Tous les modules responsive. Dashboard avec graphiques. Tests manuels documentés.

## Jean-Marc — Lead Frontend
- [ ] Installer `vite-plugin-pwa` : `npm install vite-plugin-pwa -D`
- [ ] Configurer PWA dans `vite.config.ts` (nom, couleurs, stratégie cache)
- [ ] Créer `public/manifest.json` : `name`, `start_url`, `display: standalone`, `theme_color`
- [ ] Ajouter meta tags PWA dans `index.html`
- [ ] Tester installation PWA Chrome mobile + Lighthouse audit
- [ ] Implémenter `ReglesAntiDesinfo.tsx` : 5 règles en cards tactiles depuis `GET /rules`

## Sébastien — UI/UX
- [ ] Audit responsive complet : 375px / 768px / 1280px sur toutes les pages
- [ ] Corriger les problèmes de layout mobile identifiés
- [ ] Swipe tactile dans `FakeOrReal` : gauche = Fake, droite = Réel
- [ ] Zones `SpotTheZone` plus grandes sur mobile (touch targets ≥ 44px)
- [ ] Finaliser maquettes Figma + export PDF (livrable niveau 3)
- [ ] Créer icônes PWA 192×192 et 512×512 px

## Enora — Backend
- [ ] Écrire `backend/Dockerfile`
- [ ] Créer `docker-compose.yml` à la racine
- [ ] Rédiger `docs/schema_donnees.md` : schéma JSON commenté (livrable niveau 2)
- [ ] Ajouter `GET /stats` : total parties, score moyen, question la plus ratée
- [ ] Vérifier CORS pour la prod (ajouter domaine de déploiement si besoin)

## Hugo — Fullstack + DevOps
- [ ] Rédiger `tasks/tests.md` : 3 scénarios de test manuels complets
- [ ] Exécuter les 3 scénarios et corriger les bugs trouvés
- [ ] Lazy loading images + code splitting routes React
- [ ] Tester sur un vrai appareil mobile physique
