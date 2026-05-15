"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, MessageCircle, Sparkles, Headphones, Shirt, Home as HomeIcon, Sparkle, Wrench } from "lucide-react";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { getTrendingProducts, CATEGORIES } from "@/services/products";

const CAT_ICONS = {
  tech: Headphones,
  mode: Shirt,
  maison: HomeIcon,
  beaute: Sparkle,
  outils: Wrench,
};

const PAGE_SIZE = 6;

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleTrending, setVisibleTrending] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const data = await getTrendingProducts();
        setTrending(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleTrending < trending.length) {
          setVisibleTrending((v) => Math.min(v + PAGE_SIZE, trending.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleTrending, trending.length]);

  return (
    <div data-testid="home-page">
      <HeroCarousel />

      <div className="bg-gradient-to-r from-[#C8102E]/8 via-[#B8941E]/10 to-[#C8102E]/8 border-y border-[#B8941E]/20 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12 text-sm">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0">
              <span className="text-[#B8941E] font-semibold">中国速运</span>
              <span className="text-[#5C5854]">Commandes groupées = prix cassés</span>
              <span className="text-[#B8941E]">⬢</span>
              <span className="text-[#5C5854]">Maritime · Aérien Standard · Aérien Express</span>
              <span className="text-[#B8941E]">⬢</span>
              <span className="text-[#5C5854]">De Shenzhen à Ouaga, sans stress</span>
              <span className="text-[#B8941E]">⬢</span>
              <span className="text-[#5C5854]">Paiement sécurisé Mobile Money</span>
              <span className="text-[#B8941E]">⬢</span>
            </div>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">Catégories</p>
            <h2 className="font-display text-2xl md:text-3xl text-[#1A1515]">Trouve ton créneau</h2>
          </div>
          <Link href="/catalogue" className="hidden md:inline-flex items-center gap-1.5 text-sm text-[#5C5854] hover:text-[#B8941E]">
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1 md:hidden">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const Icon = CAT_ICONS[cat.id] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/catalogue?cat=${cat.id}`}
                data-testid={`home-category-${cat.id}`}
                className="shrink-0 flex flex-col items-center gap-1.5 w-[72px]"
              >
                <div className="w-[60px] h-[60px] rounded-2xl bg-white border border-[#1A1515]/8 shadow-soft flex items-center justify-center hover:border-[#B8941E]/40 transition-all">
                  <Icon size={22} className="text-[#B8941E]" strokeWidth={1.7} />
                </div>
                <span className="text-[11px] font-medium text-[#1A1515] text-center leading-tight">{cat.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:grid grid-cols-5 gap-3">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const Icon = CAT_ICONS[cat.id] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/catalogue?cat=${cat.id}`}
                data-testid={`home-category-desktop-${cat.id}`}
                className="aspect-[3/2] rounded-xl bg-white border border-[#1A1515]/8 flex flex-col items-center justify-center gap-2 hover:border-[#B8941E]/50 hover:shadow-elev transition-all group"
              >
                <Icon size={26} className="text-[#B8941E] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <span className="font-display text-base text-[#1A1515]">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">Tendances</p>
            <h2 className="font-display text-2xl md:text-4xl text-[#1A1515]">Best deals du moment</h2>
            <p className="text-sm text-[#5C5854] mt-2 max-w-md">Ce que les revendeurs commandent en ce moment.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {trending.slice(0, visibleTrending).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {visibleTrending < trending.length && (
              <div ref={sentinelRef} className="flex justify-center mt-8" data-testid="home-trending-sentinel">
                <button
                  onClick={() => setVisibleTrending((v) => Math.min(v + PAGE_SIZE, trending.length))}
                  data-testid="home-trending-load-more"
                  className="px-6 py-3 rounded-full bg-white border border-[#B8941E]/40 text-[#B8941E] hover:bg-[#B8941E]/8 transition-all text-sm font-semibold uppercase tracking-wider shadow-soft"
                >
                  Charger plus ({trending.length - visibleTrending} restant{trending.length - visibleTrending > 1 ? "s" : ""})
                </button>
              </div>
            )}
            {visibleTrending >= trending.length && (
              <p className="text-center mt-8 text-sm text-[#8A857F]" data-testid="home-trending-end">
                Tu as tout vu — file vers le <Link href="/catalogue" className="text-[#B8941E] hover:underline">catalogue complet</Link>.
              </p>
            )}
          </>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl bg-white border border-[#1A1515]/8 shadow-soft p-8 md:p-10 relative overflow-hidden"
          >
            <ShieldCheck size={36} className="text-[#B8941E] mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-[#1A1515] mb-3">Tu envoies. On vérifie.</h3>
            <p className="text-sm md:text-base text-[#5C5854] leading-relaxed">
              Notre équipe à Shenzhen contrôle visuellement chaque lot avant emballage. Photos et vidéos disponibles sur demande.
            </p>
          </motion.div>

          <motion.a
            whileHover={{ y: -3 }}
            href="https://wa.me/22606900288"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="home-whatsapp-cta"
            className="rounded-2xl bg-gradient-to-br from-[#C8102E] to-[#A60D26] p-8 md:p-10 transition-all relative overflow-hidden group glow-red"
          >
            <MessageCircle size={36} className="text-white/90 mb-5" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-white mb-3">Une question ? Un lien Alibaba ?</h3>
            <p className="text-sm md:text-base text-white/85 leading-relaxed mb-4">
              Envoie-nous le lien sur WhatsApp, on s&apos;occupe du reste : négociation, qualité, expédition.
            </p>
            <span className="inline-flex items-center gap-2 text-white font-medium text-sm group-hover:translate-x-1 transition-transform">
              +226 06 90 02 88 <ArrowRight size={16} />
            </span>
          </motion.a>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
