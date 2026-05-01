// China Express Supabase Seeder
// Run this script once to populate Supabase with mock data
// Usage: node backend/supabase-seeder.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bmbeahjvdiglnxfpbzyu.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmVhaGp2ZGlnbG54ZnBienl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODEyNzYsImV4cCI6MjA5MzE1NzI3Nn0.cNl1c65JcUcaFj3E9n99K8Oz9w641IO6j5Iy6dUS2NQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PRODUCTS = [
  {
    slug: "ecouteurs-pro-bt",
    name: "Écouteurs Sans-Fil Pro X9",
    category: "tech",
    images: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "TOP VENTE",
    badge_color: "gold",
    description: "Écouteurs Bluetooth 5.3 avec réduction de bruit active. Autonomie 28h, étui de charge sans-fil, micro HD intégré. Idéal pour la revente sur le marché du téléphone.",
    retail_price: 8500,
    wholesale_price: 5200,
    min_retail: 1,
    min_wholesale: 50,
    suggested_sell_price: 15000,
    weight_kg: 0.18,
    dimensions: "10x50x100",
    rating: 4.8,
    reviews: 1247,
    trending: true,
    status: 'published',
  },
  {
    slug: "lampe-led-rechargeable",
    name: "Lampe LED Solaire Rechargeable",
    category: "maison",
    images: [
      "https://images.unsplash.com/photo-1565636192335-a31ab47cc89a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "PROMO -22%",
    badge_color: "red",
    description: "Lampe LED haute luminosité, panneau solaire intégré + USB. Autonomie 12h. Indispensable pour les zones rurales et coupures de courant.",
    retail_price: 4200,
    wholesale_price: 2400,
    min_retail: 1,
    min_wholesale: 100,
    suggested_sell_price: 7500,
    weight_kg: 0.45,
    dimensions: "10x50x40",
    rating: 4.6,
    reviews: 892,
    trending: true,
    status: 'published',
  },
  {
    slug: "montre-connectee-s9",
    name: "Montre Connectée S9 Ultra",
    category: "tech",
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "NOUVEAU",
    badge_color: "gold",
    description: "Smartwatch écran AMOLED 1.95\", appel Bluetooth, suivi cardiaque, 100+ modes sportifs, étanche IP68. Boîtier alliage, bracelet métallique inclus.",
    retail_price: 18500,
    wholesale_price: 11800,
    min_retail: 1,
    min_wholesale: 30,
    suggested_sell_price: 32000,
    weight_kg: 0.22,
    dimensions: "10x50x40",
    rating: 4.7,
    reviews: 543,
    trending: true,
    status: 'published',
  },
  {
    slug: "robe-wax-premium",
    name: "Tissu Wax Premium 6 Yards",
    category: "mode",
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "BEST DEAL",
    badge_color: "red",
    description: "Tissu wax 100% coton, motifs ethniques exclusifs, qualité Vlisco-like. Coupe de 6 yards. Mix de motifs livré au hasard ou sur demande.",
    retail_price: 12000,
    wholesale_price: 7500,
    min_retail: 1,
    min_wholesale: 20,
    suggested_sell_price: 22000,
    weight_kg: 1.4,
    dimensions: "10x50x40",
    rating: 4.9,
    reviews: 312,
    trending: false,
    status: 'published',
  },
  {
    slug: "perceuse-sans-fil-20v",
    name: "Perceuse Sans-Fil 20V Pro",
    category: "outils",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=900&q=80",
    ],
    badge: null,
    badge_color: null,
    description: "Perceuse-visseuse 20V Lithium-Ion, 2 batteries incluses, mandrin 13mm, 25 niveaux de couple. Coffret + 50 accessoires offerts.",
    retail_price: 28000,
    wholesale_price: 18500,
    min_retail: 1,
    min_wholesale: 15,
    suggested_sell_price: 45000,
    weight_kg: 2.1,
    dimensions: "10x50x40",
    rating: 4.7,
    reviews: 178,
    trending: false,
    status: 'published',
  },
  {
    slug: "rouge-levres-mat-set",
    name: "Set 12 Rouges à Lèvres Mat",
    category: "beaute",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1599733589046-8a35aaeae4ba?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "TOP VENTE",
    badge_color: "gold",
    description: "Coffret de 12 rouges à lèvres mat longue tenue, 12 teintes assorties. Cruelty-free. Parfait pour la revente en cabines beauté.",
    retail_price: 9500,
    wholesale_price: 5500,
    min_retail: 1,
    min_wholesale: 40,
    suggested_sell_price: 16000,
    weight_kg: 0.55,
    dimensions: "10x50x40",
    rating: 4.5,
    reviews: 765,
    trending: true,
    status: 'published',
  },
  {
    slug: "powerbank-30000mah",
    name: "PowerBank 30 000 mAh Charge Rapide",
    category: "tech",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "PROMO -18%",
    badge_color: "red",
    description: "Batterie externe 30 000 mAh, double USB + USB-C, charge rapide 22.5W, écran LED. Pour 8 charges complètes de smartphone.",
    retail_price: 11500,
    wholesale_price: 6800,
    min_retail: 1,
    min_wholesale: 50,
    suggested_sell_price: 19500,
    weight_kg: 0.6,
    dimensions: "10x50x40",
    rating: 4.6,
    reviews: 421,
    trending: true,
    status: 'published',
  },
  {
    slug: "chaussures-sport-running",
    name: "Baskets Running Air Pro",
    category: "mode",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "NOUVEAU",
    badge_color: "gold",
    description: "Baskets de course unisexes, semelle Air, mesh respirant, tailles 36-46. Look streetwear adapté au marché ouest-africain.",
    retail_price: 14500,
    wholesale_price: 8800,
    min_retail: 1,
    min_wholesale: 25,
    suggested_sell_price: 25000,
    weight_kg: 0.85,
    dimensions: "100x100x100",
    rating: 4.4,
    reviews: 234,
    trending: false,
    status: 'published',
  },
  {
    slug: "ventilateur-rechargeable",
    name: "Ventilateur Rechargeable Portable",
    category: "maison",
    images: [
      "https://images.unsplash.com/photo-1622372738946-62e02505feb3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "BEST DEAL",
    badge_color: "red",
    description: "Ventilateur USB rechargeable 8\", 4 vitesses, autonomie 12h, base pliable. Indispensable en saison chaude.",
    retail_price: 7800,
    wholesale_price: 4500,
    min_retail: 1,
    min_wholesale: 50,
    suggested_sell_price: 13500,
    weight_kg: 1.1,
    dimensions: "10x50x100",
    rating: 4.5,
    reviews: 588,
    trending: true,
    status: 'published',
  },
  {
    slug: "ensemble-cuisine-inox",
    name: "Set Casseroles Inox 12 Pièces",
    category: "maison",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=900&q=80",
    ],
    badge: null,
    badge_color: null,
    description: "Batterie de cuisine inox 304, 12 pièces, fonds épais induction-compatibles. Coffret cadeau premium.",
    retail_price: 35000,
    wholesale_price: 22000,
    min_retail: 1,
    min_wholesale: 10,
    suggested_sell_price: 58000,
    weight_kg: 6.5,
    dimensions: "100x100x100",
    rating: 4.8,
    reviews: 145,
    trending: false,
    status: 'published',
  },
  {
    slug: "perruque-bresilienne",
    name: "Perruque Brésilienne 26\" Naturelle",
    category: "beaute",
    images: [
      "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "TOP VENTE",
    badge_color: "gold",
    description: "Perruque cheveux humains 26 pouces, lace frontal, bouclée. Ondulations naturelles, peut être lissée et teinte.",
    retail_price: 42000,
    wholesale_price: 27500,
    min_retail: 1,
    min_wholesale: 10,
    suggested_sell_price: 70000,
    weight_kg: 0.4,
    dimensions: "10x50x40",
    rating: 4.9,
    reviews: 678,
    trending: true,
    status: 'published',
  },
  {
    slug: "kit-soudure-electrique",
    name: "Poste à Souder Inverter 250A",
    category: "outils",
    images: [
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "PROMO -15%",
    badge_color: "red",
    description: "Poste à souder inverter MMA 250A, écran digital, anti-collage, électrodes 2.5/3.2/4mm. Coffret complet avec masque LCD.",
    retail_price: 48000,
    wholesale_price: 32000,
    min_retail: 1,
    min_wholesale: 8,
    suggested_sell_price: 78000,
    weight_kg: 5.8,
    dimensions: "10x50x40",
    rating: 4.7,
    reviews: 92,
    trending: false,
    status: 'published',
  },
];

const SHIPPING_OPTIONS = [
  {
    id: "maritime",
    label: "Maritime",
    icon: "Ship",
    price_per_kg: 1200,
    price_per_cbm: 230000,
    estimated_days: "35-50 jours",
    description: "Le plus économique. Idéal pour les commandes en gros.",
    color: "#3B82F6",
  },
  {
    id: "aerien_std",
    label: "Aérien Standard",
    icon: "Plane",
    price_per_kg: 12000,
    price_per_cbm: null,
    estimated_days: "12-18 jours",
    description: "Bon équilibre prix / délai.",
    color: "#B8941E",
  },
  {
    id: "aerien_express",
    label: "Aérien Express",
    icon: "Zap",
    price_per_kg: 20000,
    price_per_cbm: null,
    estimated_days: "5-8 jours",
    description: "Le plus rapide. Pour les urgences ou échantillons.",
    color: "#C8102E",
  },
];

const TRACKINGS = [
  {
    code: "CE2026A1",
    product: "Lot écouteurs Pro X9 (50 unités)",
    weight: "9 kg",
    transport: "Aérien Standard",
    origin: "Shenzhen, Chine",
    destination: "Ouagadougou, Burkina Faso",
    estimated_delivery: "12 mars 2026",
    current_step: 2,
    history: [
      { step: 0, date: "28/02/2026 09:14", note: "Commande validée." },
      { step: 1, date: "03/03/2026 18:42", note: "Expédié — vol CZ8472." },
      { step: 2, date: "07/03/2026 04:30", note: "Hub Addis-Abeba — en route Ouaga." },
    ],
  },
  {
    code: "CE2026B7",
    product: "Container partiel — Tissus Wax (200kg)",
    weight: "200 kg",
    transport: "Maritime",
    origin: "Port de Shanghai",
    destination: "Port de Lomé → Ouagadougou",
    estimated_delivery: "15 avril 2026",
    current_step: 1,
    history: [
      { step: 0, date: "20/02/2026 11:00", note: "Commande consolidée." },
      { step: 1, date: "01/03/2026 06:00", note: "Embarqué sur le navire MAERSK SHANGHAI." },
    ],
  },
  {
    code: "CE2026D3",
    product: "Montres connectées S9 (30 unités)",
    weight: "7 kg",
    transport: "Aérien Express",
    origin: "Shenzhen, Chine",
    destination: "Ouagadougou, Burkina Faso",
    estimated_delivery: "Livré",
    current_step: 4,
    history: [
      { step: 0, date: "18/02/2026 10:00", note: "Commande validée." },
      { step: 1, date: "19/02/2026 22:00", note: "Décollage Shenzhen." },
      { step: 2, date: "21/02/2026 14:30", note: "Arrivée Ouagadougou." },
      { step: 3, date: "22/02/2026 09:15", note: "Dédouanement effectué." },
      { step: 4, date: "22/02/2026 16:40", note: "Livré au client." },
    ],
  },
];

const FAQS = [
  {
    question: "Comment passer ma première commande ?",
    answer: "Choisissez un produit, utilisez le calculateur de profit pour estimer votre marge, puis cliquez sur \"Commander\". On vous contacte sur WhatsApp pour valider quantité, transport et règlement (Orange Money, Moov Money, Wave etc...).",
    order_index: 0,
  },
  {
    question: "Quelle est la différence entre Maritime, Aérien Standard et Aérien Express ?",
    answer: "Maritime : le plus économique (40-60 j), idéal pour les produits lourds et avec de gros volumes(>50 kg). Aérien Standard : équilibre prix/vitesse pour les produits de taille et poids moyens (12-18 j). Aérien Express : 5-8 j, parfait pour les échantillons et les urgences mais plus cher.",
    order_index: 1,
  },
  {
    question: "Quels sont vos délais réels de livraison vers Ouagadougou ?",
    answer: "Maritime : 40 à 60 jours porte-à-porte. Aérien Standard : 12 à 18 jours. Aérien Express : 5 à 8 jours. Ces délais incluent le sourcing, le contrôle qualité, l'expédition et le dédouanement (si nécessaire) pris en charge par notre transitaire affilie.",
    order_index: 2,
  },
  {
    question: "Comment se passe le paiement ?",
    answer: "Le paiement se fait avant la validation de la commande à 100% (prix final du produit + frais de transport + notre commission) . Une fois plusieurs commandes regroupées, on lance la commande groupée chez le fournisseur, on vérifie la qualité puis on expédie. Arrivée, on vous contacte par WhatsApp, vous venez recuperer votre colis ou vous engager un livreur.",
    order_index: 3,
  },
  {
    question: "Vérifiez-vous la qualité avant expédition ?",
    answer: "Oui. Notre partenaire sur place en Chine contrôle visuellement chaque lot avant emballage. Photos et vidéos vous sont envoyées sur demande.",
    order_index: 4,
  },
  {
    question: "Puis-je commander un produit que je trouve sur Tiktok / Facebook / Alibaba...?",
    answer: "Absolument. Envoyez-nous le lien sur WhatsApp, on négocie le prix avec le fournisseur, on vérifie la qualité, et on intègre votre lot dans la prochaine commande groupée.",
    order_index: 5,
  },
  {
    question: "Y a-t-il un minimum de commande ?",
    answer: "Non, pas de minimum global. Chaque produit a son propre minimum gros (affiché sur la fiche). En dessous, c'est le tarif détail qui s'applique automatiquement.",
    order_index: 6,
  },
  {
    question: "Livrez-vous hors Burkina Faso ?",
    answer: "Oui : Côte d'Ivoire, Mali, Niger, Togo, Bénin, Sénégal, Ghana. Frais de réacheminement local en sus, devis sur demande.",
    order_index: 7,
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Tu envoies le lien ou une photo",
    description: "Lien Alibaba, ou simplement une photo. On identifie le produit, on fait les recherches et on contacte le fournisseur.",
    icon: "Link2",
  },
  {
    step: 2,
    title: "On négocie",
    description: "Pour les grosses commande il y'a une possibilité de négocie le prix, commander un echantillon, vérifier la qualité, et te confirme un devis ferme.",
    icon: "Handshake",
  },
  {
    step: 3,
    title: "Tu paies, on expédie",
    description: "Paiement validé → la commande rejoint la prochaine commande groupée → expédition Maritime / Aérien selon ton choix. Par demande, le colis peut être expedier seul sans groupement (Dans le cas des commandes de petits colis en gros).",
    icon: "Send",
  },
  {
    step: 4,
    title: "Tu reçois, tu kiffes",
    description: "Livraison à Ouaga (ou ailleurs en Afrique de l'Ouest). Tu vends, tu utilises, tu kiffes. Point.",
    icon: "PackageCheck",
  },
];

async function seed() {
  console.log('🚀 Starting China Express Supabase Seeder...\n');

  // Seed products
  console.log('📦 Seeding products...');
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .upsert(PRODUCTS, { onConflict: 'slug' })
    .select();
  if (productsError) {
    console.error('❌ Error seeding products:', productsError.message);
  } else {
    console.log(`✅ Inserted ${productsData.length} products`);
  }

  // Seed shipping options
  console.log('\n🚚 Seeding shipping options...');
  const { data: shippingData, error: shippingError } = await supabase
    .from('shipping_options')
    .upsert(SHIPPING_OPTIONS, { onConflict: 'id' })
    .select();
  if (shippingError) {
    console.error('❌ Error seeding shipping options:', shippingError.message);
  } else {
    console.log(`✅ Inserted ${shippingData.length} shipping options`);
  }

  // Seed trackings
  console.log('\n📋 Seeding trackings...');
  const { data: trackingData, error: trackingError } = await supabase
    .from('trackings')
    .upsert(TRACKINGS, { onConflict: 'code' })
    .select();
  if (trackingError) {
    console.error('❌ Error seeding trackings:', trackingError.message);
  } else {
    console.log(`✅ Inserted ${trackingData.length} trackings`);
  }

  // Seed faqs
  console.log('\n❓ Seeding FAQs...');
  const { data: faqsData, error: faqsError } = await supabase
    .from('faqs')
    .upsert(FAQS, { onConflict: 'order_index' })
    .select();
  if (faqsError) {
    console.error('❌ Error seeding FAQs:', faqsError.message);
  } else {
    console.log(`✅ Inserted ${faqsData.length} FAQs`);
  }

  // Seed how_it_works
  console.log('\n📖 Seeding how_it_works...');
  const { data: howItWorksData, error: howItWorksError } = await supabase
    .from('how_it_works')
    .upsert(HOW_IT_WORKS, { onConflict: 'step' })
    .select();
  if (howItWorksError) {
    console.error('❌ Error seeding how_it_works:', howItWorksError.message);
  } else {
    console.log(`✅ Inserted ${howItWorksData.length} how_it_works steps`);
  }

  console.log('\n🎉 Seeding completed!');
}

seed().catch(console.error);
