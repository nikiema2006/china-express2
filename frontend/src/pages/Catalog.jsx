import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import { PRODUCTS, CATEGORIES } from "../data/products";

const PAGE_SIZE = 8;

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";

  const [activeCat, setActiveCat] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (activeCat === "all") next.delete("cat");
        else next.set("cat", activeCat);
        return next;
      },
      { replace: true }
    );
  }, [activeCat, setSearchParams]);

  const products = useMemo(() => {
    let list = activeCat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.wholesalePrice - b.wholesalePrice);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.wholesalePrice - a.wholesalePrice);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [activeCat, search, sort]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [activeCat, search, sort]);

  // Infinite scroll observer
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visible < products.length) {
          setVisible((v) => Math.min(v + PAGE_SIZE, products.length));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, products.length]);

  const visibleProducts = products.slice(0, visible);

  return (
    <div data-testid="catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">Catalogue</p>
        <h1 className="font-display text-3xl md:text-5xl text-[#1A1515]">
          {PRODUCTS.length} produits, <span className="text-gold-gradient">prix d'usine.</span>
        </h1>
        <p className="text-sm md:text-base text-[#5C5854] mt-3 max-w-xl">
          Sourcés à Shenzhen. Calcule ta marge sur chaque produit avec notre simulateur intégré.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5854]" />
          <input
            data-testid="catalog-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full bg-[#FFFFFF] border border-[#B8941E]/15 rounded-lg pl-11 pr-4 py-3 text-sm text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E]/50 focus:outline-none"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5854] pointer-events-none" />
          <select
            data-testid="catalog-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-[#FFFFFF] border border-[#B8941E]/15 rounded-lg pl-11 pr-10 py-3 text-sm text-[#1A1515] focus:border-[#B8941E]/50 focus:outline-none cursor-pointer"
          >
            <option value="featured">À la une</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Mieux notés</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const active = cat.id === activeCat;
          return (
            <button
              key={cat.id}
              data-testid={`catalog-cat-${cat.id}`}
              onClick={() => setActiveCat(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap border ${
                active
                  ? "bg-[#B8941E] text-[#1A1515] border-[#B8941E] font-semibold"
                  : "bg-[#FFFFFF] border-[#1A1515]/8 text-[#5C5854] hover:border-[#B8941E]/40 hover:text-[#1A1515]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-xs text-[#5C5854] mb-4">
        <span data-testid="catalog-result-count">
          {products.length} produit{products.length > 1 ? "s" : ""} trouvé{products.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {products.length > 0 ? (
          <motion.div
            key={`${activeCat}-${search}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {visibleProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-[#5C5854]">
            <p className="font-display text-2xl text-[#1A1515] mb-2">Aucun produit trouvé.</p>
            <p className="text-sm">Essaie une autre recherche ou catégorie.</p>
          </div>
        )}
      </AnimatePresence>

      {/* Sentinel + Load more */}
      {products.length > 0 && visible < products.length && (
        <div ref={sentinelRef} className="flex justify-center mt-10" data-testid="catalog-sentinel">
          <button
            onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, products.length))}
            data-testid="catalog-load-more"
            className="px-6 py-3 rounded-full bg-white border border-[#B8941E]/40 text-[#B8941E] hover:bg-[#B8941E]/8 transition-all text-sm font-semibold uppercase tracking-wider shadow-soft"
          >
            Charger plus ({products.length - visible} restant{products.length - visible > 1 ? "s" : ""})
          </button>
        </div>
      )}
      {products.length > 0 && visible >= products.length && products.length > PAGE_SIZE && (
        <p className="text-center mt-8 text-sm text-[#8A857F]" data-testid="catalog-end">
          Fin du catalogue.
        </p>
      )}

      <div className="h-24" />
    </div>
  );
}
