import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ship, Plane, Zap, ShieldCheck, MessageCircle } from "lucide-react";
import HeroCarousel from "../components/home/HeroCarousel";
import ProductCard from "../components/products/ProductCard";
import { PRODUCTS, getTrendingProducts, CATEGORIES } from "../data/products";

export default function Home() {
  const trending = getTrendingProducts();
  const recent = PRODUCTS.slice(0, 6);

  return (
    <div data-testid="home-page">
      <HeroCarousel />

      {/* Marquee announcement */}
      <div className="bg-gradient-to-r from-[#C8102E]/15 via-[#D4AF37]/10 to-[#C8102E]/15 border-y border-[#D4AF37]/15 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12 text-sm">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0">
              <span className="text-[#D4AF37] font-medium">中国速运</span>
              <span className="text-[#A19D98]">Commandes groupées = prix cassés</span>
              <span className="text-[#D4AF37]">⬢</span>
              <span className="text-[#A19D98]">Maritime · Aérien Standard · Aérien Express</span>
              <span className="text-[#D4AF37]">⬢</span>
              <span className="text-[#A19D98]">De Shenzhen à Ouaga, sans stress</span>
              <span className="text-[#D4AF37]">⬢</span>
              <span className="text-[#A19D98]">Paiement sécurisé Mobile Money</span>
              <span className="text-[#D4AF37]">⬢</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories quick access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Catégories</p>
            <h2 className="font-display text-2xl md:text-3xl text-[#FDFBF7]">Trouve ton créneau</h2>
          </div>
          <Link to="/catalogue" className="hidden md:inline-flex items-center gap-1.5 text-sm text-[#A19D98] hover:text-[#D4AF37]">
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat, i) => (
            <Link
              key={cat.id}
              to={`/catalogue?cat=${cat.id}`}
              data-testid={`home-category-${cat.id}`}
              className="aspect-square rounded-xl bg-[#141010] border border-white/5 flex items-center justify-center text-center p-3 hover:border-[#D4AF37]/40 hover:bg-[#1A1515] transition-all group"
            >
              <span className="font-display text-sm md:text-base text-[#A19D98] group-hover:text-[#D4AF37] transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">🔥 Tendances</p>
            <h2 className="font-display text-2xl md:text-4xl text-[#FDFBF7]">Best deals du moment</h2>
            <p className="text-sm text-[#A19D98] mt-2 max-w-md">Ce que les revendeurs commandent en ce moment.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {trending.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Transport explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="rounded-2xl border border-[#D4AF37]/15 bg-gradient-to-br from-[#141010] to-[#0F0C0C] p-6 md:p-12 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C8102E]/10 blur-3xl rounded-full" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">3 façons d'expédier</p>
            <h2 className="font-display text-2xl md:text-4xl text-[#FDFBF7] mb-3">
              Ton transport, <span className="text-gold-gradient">ta marge.</span>
            </h2>
            <p className="text-sm md:text-base text-[#A19D98] max-w-2xl mb-8">
              Le bon mode de transport peut multiplier ta marge par 2. Notre calculateur t'aide à choisir en 5 secondes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { Icon: Ship, label: "Maritime", days: "35-50 jours", price: "1 200 FCFA / kg", desc: "Imbattable sur le gros volume.", color: "#3B82F6" },
                { Icon: Plane, label: "Aérien Standard", days: "12-18 jours", price: "4 800 FCFA / kg", desc: "Le bon compromis prix / vitesse.", color: "#D4AF37" },
                { Icon: Zap, label: "Aérien Express", days: "5-8 jours", price: "7 500 FCFA / kg", desc: "Quand chaque jour compte.", color: "#C8102E" },
              ].map(({ Icon, label, days, price, desc, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -4 }}
                  className="rounded-xl bg-[#1A1515] border border-white/5 p-5 hover:border-[#D4AF37]/30 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                  <p className="font-display text-xl text-[#FDFBF7] mb-1">{label}</p>
                  <p className="font-mono text-xs text-[#D4AF37] uppercase tracking-wider mb-3">{days}</p>
                  <p className="text-sm text-[#A19D98] mb-3">{desc}</p>
                  <p className="font-mono text-sm text-[#FDFBF7]">{price}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured / new */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl md:text-4xl text-[#FDFBF7]">Vu récemment</h2>
          <Link to="/catalogue" className="text-sm text-[#D4AF37] hover:underline">Voir tout</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {recent.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Trust + WhatsApp CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#141010] border border-white/5 p-8 md:p-10 relative overflow-hidden">
            <ShieldCheck size={36} className="text-[#D4AF37] mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-[#FDFBF7] mb-3">Tu envoies. On vérifie.</h3>
            <p className="text-sm md:text-base text-[#A19D98] leading-relaxed">
              Notre équipe à Shenzhen contrôle visuellement chaque lot avant emballage. Photos et vidéos disponibles sur demande pour les commandes &gt; 100 000 FCFA.
            </p>
          </div>

          <a
            href="https://wa.me/22606900288"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="home-whatsapp-cta"
            className="rounded-2xl bg-gradient-to-br from-[#C8102E]/20 to-[#0F0C0C] border border-[#C8102E]/30 p-8 md:p-10 hover:border-[#C8102E]/60 transition-all relative overflow-hidden group"
          >
            <MessageCircle size={36} className="text-[#C8102E] mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-[#FDFBF7] mb-3">Une question ? Un lien Alibaba ?</h3>
            <p className="text-sm md:text-base text-[#A19D98] leading-relaxed mb-4">
              Envoie-nous le lien sur WhatsApp, on s'occupe du reste : négociation, qualité, expédition.
            </p>
            <span className="inline-flex items-center gap-2 text-[#D4AF37] font-medium text-sm group-hover:translate-x-1 transition-transform">
              +226 06 90 02 88 <ArrowRight size={16} />
            </span>
          </a>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
