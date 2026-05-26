"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

const PAGE_SIZE = 6;

export default function TrendingSection({ trending }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visible < trending.length) {
          setVisible((v) => Math.min(v + PAGE_SIZE, trending.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, trending.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">Tendances</p>
          <h2 className="font-display text-2xl md:text-4xl text-[#1A1515]">Best deals du moment</h2>
          <p className="text-sm text-[#5C5854] mt-2 max-w-md">Ce que les revendeurs commandent en ce moment.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {trending.slice(0, visible).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {visible < trending.length && (
        <div ref={sentinelRef} className="flex justify-center mt-8" data-testid="home-trending-sentinel">
          <button
            onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, trending.length))}
            data-testid="home-trending-load-more"
            className="px-6 py-3 rounded-full bg-white border border-[#B8941E]/40 text-[#B8941E] hover:bg-[#B8941E]/8 transition-all text-sm font-semibold uppercase tracking-wider shadow-soft"
          >
            Charger plus ({trending.length - visible} restant{trending.length - visible > 1 ? "s" : ""})
          </button>
        </div>
      )}
      {visible >= trending.length && (
        <p className="text-center mt-8 text-sm text-[#8A857F]" data-testid="home-trending-end">
          Tu as tout vu — file vers le <Link href="/catalogue" className="text-[#B8941E] hover:underline">catalogue complet</Link>.
        </p>
      )}
    </section>
  );
}
