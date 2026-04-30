import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import { PRODUCTS, CATEGORIES } from "../data/products";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";

  const [activeCat, setActiveCat] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    if (activeCat === "all") {
      searchParams.delete("cat");
    } else {
      searchParams.set("cat", activeCat);
    }
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat]);

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

  return (
    <div data-testid="catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Catalogue</p>
        <h1 className="font-display text-3xl md:text-5xl text-[#FDFBF7]">
          {PRODUCTS.length} produits, <span className="text-gold-gradient">prix d'usine.</span>
        </h1>
        <p className="text-sm md:text-base text-[#A19D98] mt-3 max-w-xl">
          Sourcés à Shenzhen. Calcule ta marge sur chaque produit avec notre simulateur intégré.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19D98]" />
          <input
            data-testid="catalog-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full bg-[#141010] border border-[#D4AF37]/15 rounded-lg pl-11 pr-4 py-3 text-sm text-[#FDFBF7] placeholder:text-[#75716C] focus:border-[#D4AF37]/50 focus:outline-none"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19D98] pointer-events-none" />
          <select
            data-testid="catalog-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-[#141010] border border-[#D4AF37]/15 rounded-lg pl-11 pr-10 py-3 text-sm text-[#FDFBF7] focus:border-[#D4AF37]/50 focus:outline-none cursor-pointer"
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
                  ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] font-semibold"
                  : "bg-[#141010] border-white/5 text-[#A19D98] hover:border-[#D4AF37]/40 hover:text-[#FDFBF7]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-xs text-[#A19D98] mb-4">
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
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-[#A19D98]">
            <p className="font-display text-2xl text-[#FDFBF7] mb-2">Aucun produit trouvé.</p>
            <p className="text-sm">Essaie une autre recherche ou catégorie.</p>
          </div>
        )}
      </AnimatePresence>

      <div className="h-24" />
    </div>
  );
}
