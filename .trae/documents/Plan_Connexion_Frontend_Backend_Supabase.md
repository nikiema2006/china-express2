# Plan: Connecter Frontend China Express au Backend Supabase

## Contexte
- **Frontend**: React 19 avec données mockées (`products.js`, `tracking.js`, `faqs.js`)
- **Backend cible**: Supabase (PostgreSQL)
- **URL Supabase**: `https://bmbeahjvdiglnxfpbzyu.supabase.co`
- **Clé anon**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmVhaGp2ZGlnbG54ZnBienl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODEyNzYsImV4cCI6MjA5MzE1NzI3Nn0.cNl1c65JcUcaFj3E9n99K8Oz9w641IO6j5Iy6dUS2NQ`
- **Approche**: Frontend appelle Supabase directement via `@supabase/supabase-js`
- **Seeder**: Script pour peupler les tables avec les données mockées existantes

---

## Étape 1: Installer le client Supabase dans le frontend

1. Installer le package `@supabase/supabase-js` dans `frontend/package.json`
2. Créer `frontend/src/lib/supabase.js` avec:
   - Import de `createClient`
   - Configuration avec l'URL et la clé anon
   - Export du client supabase

---

## Étape 2: Créer le schéma SQL pour Supabase

Créer un fichier SQL `backend/supabase-schema.sql` avec les tables suivantes:

### Table `products`
- `id` (uuid, primary key)
- `slug` (text, unique, not null)
- `name` (text, not null)
- `category` (text, not null)
- `images` (text[], not null)
- `badge` (text, nullable)
- `badge_color` (text, nullable)
- `description` (text, not null)
- `retail_price` (integer, not null)
- `wholesale_price` (integer, not null)
- `min_retail` (integer, not null)
- `min_wholesale` (integer, not null)
- `suggested_sell_price` (integer, not null)
- `weight_kg` (numeric, not null)
- `dimensions` (text, not null)
- `rating` (numeric, not null)
- `reviews` (integer, not null)
- `trending` (boolean, not null, default false)
- `created_at` (timestamp with time zone, default now())

### Table `shipping_options`
- `id` (text, primary key)
- `label` (text, not null)
- `icon` (text, not null)
- `price_per_kg` (integer, not null)
- `price_per_cbm` (integer, nullable)
- `estimated_days` (text, not null)
- `description` (text, not null)
- `color` (text, not null)

### Table `trackings`
- `id` (uuid, primary key)
- `code` (text, unique, not null)
- `product` (text, not null)
- `weight` (text, not null)
- `transport` (text, not null)
- `origin` (text, not null)
- `destination` (text, not null)
- `estimated_delivery` (text, not null)
- `current_step` (integer, not null)
- `history` (jsonb, not null)
- `created_at` (timestamp with time zone, default now())

### Table `faqs`
- `id` (uuid, primary key)
- `question` (text, not null)
- `answer` (text, not null)
- `order_index` (integer, not null)

### Table `how_it_works`
- `id` (uuid, primary key)
- `step` (integer, not null)
- `title` (text, not null)
- `description` (text, not null)
- `icon` (text, not null)

### Politiques RLS (Row Level Security)
- Activer RLS sur toutes les tables
- Créer des politiques `SELECT` publiques (lecture seule pour anon)

---

## Étape 3: Créer le script seeder

Créer `backend/supabase-seeder.js` (Node.js script) qui:
1. Lit les données de `frontend/src/data/products.js`, `tracking.js`, `faqs.js`
2. Utilise le client Supabase pour insérer les données dans les tables
3. Convertit les structures JS vers le format SQL

Ce script sera exécuté une fois pour peupler la base.

---

## Étape 4: Créer les hooks/data services pour le frontend

### `frontend/src/services/products.js`
- `getProducts()` → retourne tous les produits
- `getProductBySlug(slug)` → retourne un produit par slug
- `getProductById(id)` → retourne un produit par id
- `getTrendingProducts()` → retourne les produits trending
- `getProductsByCategory(catId)` → retourne les produits par catégorie
- `getShippingOptions()` → retourne les options de livraison

### `frontend/src/services/tracking.js`
- `getTrackingByCode(code)` → retourne un tracking par code
- `getAllTrackingCodes()` → retourne tous les codes de tracking disponibles

### `frontend/src/services/content.js`
- `getFAQs()` → retourne toutes les FAQs
- `getHowItWorks()` → retourne les étapes "comment ça marche"

Chaque service utilise `@supabase/supabase-js` pour faire les requêtes `.from('table').select()`.

---

## Étape 5: Mettre à jour les pages pour utiliser Supabase

### `frontend/src/pages/Catalog.jsx`
- Remplacer l'import `PRODUCTS, CATEGORIES` par les appels aux services
- Utiliser `useEffect` + `useState` pour charger les produits au montage
- Ajouter un état de loading et gestion d'erreur
- Conserver la logique de tri/filtrage côté client (sur les données chargées)

### `frontend/src/pages/Home.jsx`
- Remplacer l'import `PRODUCTS, getTrendingProducts, CATEGORIES`
- Charger les produits et catégories via les services Supabase
- Ajouter loading states

### `frontend/src/pages/ProductDetail.jsx`
- Remplacer `getProductBySlug` par le service Supabase
- Charger le produit et les produits liés via Supabase
- Ajouter loading state

### `frontend/src/pages/Tracking.jsx`
- Remplacer `MOCK_TRACKINGS` par le service Supabase
- La recherche de tracking appelle `getTrackingByCode(code)` via Supabase
- Mettre à jour la logique de fallback/erreur
- Supprimer le message "FONCTIONNALITE HORS OPERATION"

### `frontend/src/pages/Infos.jsx`
- Remplacer les imports `FAQS`, `HOW_IT_WORKS` par les services Supabase
- Charger FAQs et étapes via Supabase

### `frontend/src/components/products/ProfitCalculator.jsx`
- Remplacer l'import `SHIPPING_OPTIONS` par le service Supabase

### `frontend/src/components/home/HeroCarousel.jsx`
- Remplacer l'import des produits par le service Supabase

---

## Étape 6: Tester et vérifier

1. Exécuter le script SQL dans le Supabase Dashboard (SQL Editor)
2. Exécuter le script seeder pour peupler les données
3. Installer `@supabase/supabase-js` dans le frontend
4. Lancer le frontend avec `npm start`
5. Vérifier que toutes les pages chargent correctement les données depuis Supabase
6. Tester le tracking avec les codes existants
7. Vérifier le calculateur de profit avec les shipping options depuis Supabase

---

## Ordre d'exécution

1. ✅ Créer le schéma SQL (`supabase-schema.sql`)
2. ✅ Créer le script seeder (`supabase-seeder.js`)
3. ✅ Installer le package `@supabase/supabase-js`
4. ✅ Créer le client Supabase (`lib/supabase.js`)
5. ✅ Créer les services (`services/*.js`)
6. ✅ Mettre à jour toutes les pages et composants
7. ✅ Exécuter le schema SQL dans Supabase Dashboard
8. ✅ Exécuter le seeder pour peupler les données
9. ✅ Tester le frontend

---

## Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `backend/supabase-schema.sql` | Schéma SQL pour Supabase |
| `backend/supabase-seeder.js` | Script Node.js pour peupler les données |
| `frontend/src/lib/supabase.js` | Client Supabase configuré |
| `frontend/src/services/products.js` | Service produits + shipping |
| `frontend/src/services/tracking.js` | Service tracking |
| `frontend/src/services/content.js` | Service FAQs + how it works |

## Fichiers à modifier

| Fichier | Modification |
|---------|--------------|
| `frontend/package.json` | Ajouter `@supabase/supabase-js` |
| `frontend/src/pages/Catalog.jsx` | Utiliser les services Supabase |
| `frontend/src/pages/Home.jsx` | Utiliser les services Supabase |
| `frontend/src/pages/ProductDetail.jsx` | Utiliser les services Supabase |
| `frontend/src/pages/Tracking.jsx` | Utiliser les services Supabase |
| `frontend/src/pages/Infos.jsx` | Utiliser les services Supabase |
| `frontend/src/components/products/ProfitCalculator.jsx` | Utiliser les services Supabase |
| `frontend/src/components/home/HeroCarousel.jsx` | Utiliser les services Supabase |
