"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { formatXOF } from "@/lib/format";

export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section
      data-testid="hero-carousel"
      className="relative overflow-hidden h-[78vh] min-h-[540px] md:h-[88vh] md:min-h-[620px] bg-[#FDFBF7]"
    >
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/0 to-[#FDFBF7]/0" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl space-y-6 md:space-y-8">
          <motion.div
            key={`tag-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#B8941E]/30"
          >
            <Sparkles size={12} className="text-[#B8941E]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] font-medium">
              {current.badge || "Produit phare"}
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${current.id}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1A1515] leading-[1.05]"
            >
              {current.name}
              <br />
              <span className="text-gold-gradient">à prix d&apos;usine.</span>
            </motion.h1>
          </AnimatePresence>

          <motion.p
            key={`desc-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-base md:text-lg text-[#5C5854] leading-relaxed max-w-xl"
          >
            {current.description?.slice(0, 100) + "..." || "Aucune description disponible"}
           
          </motion.p>

          <motion.div
            key={`price-${current.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-end gap-6"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#5C5854]">Prix gros dès</p>
              <p className="font-mono text-3xl md:text-4xl font-bold text-[#B8941E]">
                {formatXOF(current.wholesalePrice)}
              </p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-[#B8941E]/20" />
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#5C5854]">Revente locale</p>
              <p className="font-mono text-xl text-[#1A1515] flex items-center gap-1.5">
                <TrendingUp size={16} className="text-[#1F6B23]" />
                {formatXOF(current.suggestedSellPrice)}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <Link
              href={`/produit/${current.slug}`}
              data-testid="hero-cta-product"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-white rounded-md font-semibold hover:brightness-110 transition-all glow-red text-sm uppercase tracking-wider"
            >
              Voir le produit
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/catalogue"
              data-testid="hero-cta-catalog"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#B8941E] text-[#B8941E] rounded-md font-semibold hover:bg-[#B8941E]/10 transition-all text-sm uppercase tracking-wider"
            >
              Tout le catalogue
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            data-testid={`hero-dot-${i}`}
            aria-label={`Aller au produit ${i + 1}`}
            className={`h-1 rounded-full transition-all ${
              i === index ? "w-10 bg-[#B8941E]" : "w-5 bg-[#1A1515]/20 hover:bg-[#1A1515]/40"
            }`}
          />
        ))}
      </div>

      <div className="hidden md:flex absolute top-8 right-8 items-center gap-3 font-mono text-xs tracking-wider text-[#5C5854]">
        <span className="text-[#B8941E] text-2xl">{String(index + 1).padStart(2, "0")}</span>
        <div className="w-12 h-px bg-[#B8941E]/30" />
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
