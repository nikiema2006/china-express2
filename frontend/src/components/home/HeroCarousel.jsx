import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { getTrendingProducts } from "../../data/products";
import { formatXOF } from "../../lib/format";

export default function HeroCarousel() {
  const slides = useMemo(() => getTrendingProducts().slice(0, 4), []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section
      data-testid="hero-carousel"
      className="relative overflow-hidden h-[78vh] min-h-[540px] md:h-[88vh] md:min-h-[620px] bg-[#0A0A0A]"
    >
      {/* Phoenix motif background */}
      <div
        className="absolute inset-0 opacity-[0.07] animate-phoenix mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "url('https://customer-assets.emergentagent.com/job_china-africa-trade-1/artifacts/gm0lbsx0_logochinaexpress-removebg-preview.png')",
          backgroundSize: "70% auto",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Slide image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={current.images[0]}
            alt={current.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl space-y-6 md:space-y-8">
          {/* Tagline */}
          <motion.div
            key={`tag-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#D4AF37]/30"
          >
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-medium">
              {current.badge || "Produit phare"}
            </span>
          </motion.div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${current.id}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#FDFBF7] leading-[1.05]"
            >
              {current.name}
              <br />
              <span className="text-gold-gradient">à prix d'usine.</span>
            </motion.h1>
          </AnimatePresence>

          <motion.p
            key={`desc-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-base md:text-lg text-[#A19D98] leading-relaxed max-w-xl"
          >
            De Shenzhen à Ouaga, sans intermédiaire. Calcule ta marge, lance ta commande, reçois ton colis.
            <span className="text-[#FDFBF7] font-medium"> Le Made in China devient Made for You.</span>
          </motion.p>

          {/* Price */}
          <motion.div
            key={`price-${current.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-end gap-6"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#A19D98]">Prix gros dès</p>
              <p className="font-mono text-3xl md:text-4xl font-bold text-[#D4AF37]">
                {formatXOF(current.wholesalePrice)}
              </p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#D4AF37]/20" />
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#A19D98]">Revente locale</p>
              <p className="font-mono text-xl text-[#FDFBF7] flex items-center gap-1.5">
                <TrendingUp size={16} className="text-[#5DBA67]" />
                {formatXOF(current.suggestedSellPrice)}
              </p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <Link
              to={`/produit/${current.slug}`}
              data-testid="hero-cta-product"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-[#FDFBF7] rounded-md font-semibold hover:brightness-110 transition-all glow-red text-sm uppercase tracking-wider"
            >
              Voir le produit
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/catalogue"
              data-testid="hero-cta-catalog"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#D4AF37] text-[#D4AF37] rounded-md font-semibold hover:bg-[#D4AF37]/10 transition-all text-sm uppercase tracking-wider"
            >
              Tout le catalogue
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            data-testid={`hero-dot-${i}`}
            aria-label={`Aller au produit ${i + 1}`}
            className={`h-1 rounded-full transition-all ${
              i === index ? "w-10 bg-[#D4AF37]" : "w-5 bg-[#FDFBF7]/20 hover:bg-[#FDFBF7]/40"
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="hidden md:flex absolute top-8 right-8 items-center gap-3 font-mono text-xs tracking-wider text-[#A19D98]">
        <span className="text-[#D4AF37] text-2xl">{String(index + 1).padStart(2, "0")}</span>
        <div className="w-12 h-px bg-[#D4AF37]/30" />
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
