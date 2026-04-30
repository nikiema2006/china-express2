# China Express (中国速运) — PRD

## Problem statement (original — verbatim, FR)

Site e-commerce moderne, mobile-first, pour un agent d'importation basé en Chine (China Express, Shenzhen → Burkina Faso, Ouagadougou).
Pages : Home, Catalogue produits, Détail produit avec **calculateur de profit** (transport maritime / aérien std / aérien express, quantité, prix de revente, calcul auto coût/revenu/marge avec graphique temps réel), Tracking colis, FAQ.
Navigation : tab bar mobile (Home, Catalogue, Tracking, Profil/Infos), responsive desktop.
Direction artistique inspirée du logo (phénix rouge/or sur fond noir, 中国速运) et de l'affiche marketing fournie. Devise : XOF (FCFA). Langue : FR.

## User decisions

- **Périmètre** : démo UI/UX (mock data, pas de backend métier)
- **Auth** : aucune
- **Langue** : Français uniquement
- **Devise** : XOF (FCFA)
- **Palette** : dérivée du logo et de l'affiche marketing (rouge impérial #C8102E, or #D4AF37, noir #0A0A0A, crème #FDFBF7)
- **Numéros** : +226 06 90 02 88 / +226 07 33 67 00

## Architecture

- **Frontend** : React 19 + react-router-dom v7 + framer-motion + recharts + shadcn/ui + tailwind. Theme dark only (Archetype 5 — Jewel & Luxury).
- **Backend** : FastAPI (template d'origine, /api/status uniquement — aucune logique métier ajoutée pour cette phase).
- **Mock data** : `/app/frontend/src/data/{products,tracking,faqs}.js` (12 produits, 3 codes tracking, 10 FAQ, 4 étapes "comment ça marche").

## Implemented (V1 — 30/04/2026)

- [x] Header sticky + logo China Express + nav desktop + CTA téléphone
- [x] Bottom tab bar mobile (Accueil, Catalogue, Tracking, Infos)
- [x] Hero carousel auto-play 4 produits phares + indicateurs
- [x] Page accueil : marquee, catégories quick-access, tendances, comparatif transports, vu récemment, CTA WhatsApp
- [x] Catalogue : 12 produits, recherche, tri (4 modes), filtres catégories (chips scrollables), query param ?cat
- [x] Carte produit : badge promo/top vente, prix détail + gros, rating, hover gold border
- [x] Détail produit : galerie + thumbs, infos, specs, CTAs WhatsApp/tel
- [x] **Calculateur de profit** : 3 transports, quantité (+ presets), prix revente, calcul temps réel coût/revenu/profit/ROI/coût unitaire débarqué/poids, graphique recharts 4 barres, recommandation auto profit positif/négatif, bascule auto détail↔gros selon quantity ≥ minWholesale
- [x] Tracking : input code, 3 codes mock (CE2026A1, CE2026B7, CE2026D3), timeline 5 étapes (préparation, expédié, transit, dédouanement, livré) avec historique
- [x] Page Infos : 4 étapes "comment ça marche", tableau comparatif transports, FAQ accordion (10 questions), CTAs contact
- [x] Footer desktop avec liens, contacts, slogans
- [x] Animations framer-motion : fade-up cards, pulse phoenix bg, marquee, slide carousel
- [x] Toaster sonner configuré (theme dark, accent or)
- [x] data-testid sur tous éléments clés

## Tests (iteration_1.json — 30/04/2026)

- ✅ 100% frontend : 5 pages, calculateur (math validé), tracking, FAQ accordion, navigation desktop/mobile
- ⚪ Backend non testé (pas demandé, MVP UI démo)

## Backlog / améliorations futures (P0 → P2)

### P0 — Lancement
- [ ] Vraie image OG / favicon avec le phénix
- [ ] Brancher le bouton "Commander sur WhatsApp" sur un message pré-rempli (produit + qty + transport calculé)

### P1 — Conversion / business
- [ ] Page checkout (formulaire commande : produit, qty, transport, ville livraison, mode de paiement Mobile Money)
- [ ] Sauvegarde des simulations de profit (localStorage puis backend)
- [ ] Comparaison côte-à-côte maritime vs aérien dans le calculateur
- [ ] Recommandation automatique du meilleur transport selon volume/poids
- [ ] Section vidéos produit (reels horizontaux scrollables)

### P2 — Plus tard
- [ ] Backend FastAPI : CRUD produits, tracking réel, leads (admin)
- [ ] Authentification client (Mobile Money KYC)
- [ ] Multi-langue FR/EN
- [ ] Notifications WhatsApp automatiques sur changement d'état tracking
- [ ] Programme de parrainage (revendeur)

## Personas

- **Aïcha, 28 ans, revendeuse à Ouagadougou** — achète en gros (50–500 unités), revend sur Facebook/marché. Veut savoir SA marge avant de commander.
- **Boukari, 35 ans, gérant boutique électronique** — commande des lots tech (smartwatches, écouteurs). Sensible aux délais.
- **Fatim, 24 ans, débute le e-commerce** — petites quantités test (1–20), veut comprendre le fonctionnement de A à Z.
