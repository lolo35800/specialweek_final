# Compte-rendu — Jour 1
**Projet :** Portail de sensibilisation à la désinformation par l'IA
**Commanditaire :** Capgemini × SupDeVinci
**Équipe :** Jean-Marc, Sébastien, Enora, Hugo

---

## Ateliers UX / pédagogie (AEI style)

[je ne sais pas]

---

## Maquettes Figma Web + Mobile

[je ne sais pas]

---

## Setup projet (front + backend)

Nous avons mis en place la structure complète du projet, séparée en deux parties distinctes : le frontend (ce que l'utilisateur voit) et le backend (le serveur qui fournit les données).

**Pourquoi cette séparation ?**
Pour que chaque membre de l'équipe puisse travailler sur sa partie sans bloquer les autres, et pour respecter une architecture professionnelle proche de ce qu'on retrouve en entreprise.

**Frontend — React + TypeScript**
Nous avons choisi React car c'est le framework le plus utilisé en entreprise pour créer des interfaces web interactives. TypeScript a été ajouté pour éviter les erreurs de code grâce à la vérification des types. Le projet utilise Vite comme outil de build, ce qui permet un démarrage très rapide en développement.

Nous avons mis en place la navigation entre les pages (React Router), un menu de navigation commun à toutes les pages, et une structure de dossiers claire pour faciliter le travail en équipe.

**Backend — Python + FastAPI**
Nous avons choisi Python car il est simple à lire et à écrire, et FastAPI car il génère automatiquement une documentation interactive. Le backend expose des routes (endpoints) que le frontend peut appeler pour récupérer les données (leçons, questions de quiz, scores, etc.).

Les données sont stockées dans des fichiers JSON, ce qui est suffisant pour la semaine et évite de configurer une base de données.

---

## Création des premiers contenus (exemples, quiz)

Nous avons rédigé les premiers contenus directement intégrés dans le projet :

- **10 questions de quiz** sur les thèmes : deepfakes, fake news, sources fiables, fonctionnement de l'IA
- **3 leçons pédagogiques** : "C'est quoi l'IA ?", "Qu'est-ce qu'une fake news ?", "Comment repérer un contenu douteux ?"
- **5 règles anti-désinformation** à afficher sur la version mobile
- **2 exemples pour la galerie** illustrant des contenus suspects générés par IA

**Pourquoi le faire dès le Jour 1 ?**
Pour que le reste de la semaine soit consacré au développement et non à la rédaction. Avoir du vrai contenu dès le départ permet aussi de tester l'application avec des données réelles.
