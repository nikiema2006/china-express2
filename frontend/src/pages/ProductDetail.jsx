import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Package, Truck, ShieldCheck, MessageCircle, Phone } from "lucide-react";
import { getProductBySlug, PRODUCTS } from "../data/products";
import { formatXOF } from "../lib/format";
import ProfitCalculator from "../components/products/ProfitCalculator";
import ProductCard from "../components/products/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return <Navigate to="/catalogue" replace />;

  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div data-testid="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
      {/* Back */}
      <Link
        to="/catalogue"
        data-testid="product-back-link"
        className="inline-flex items-center gap-2 text-sm text-[#A19D98] hover:text-[#D4AF37] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour au catalogue
      </Link>

      {/* Top section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#141010] border border-white/5 mb-3 relative">
            {product.badge && (
              <span
                className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm ${
                  product.badgeColor === "gold"
                    ? "bg-[#D4AF37] text-[#0A0A0A]"
                    : "bg-[#C8102E] text-[#FDFBF7]"
                }`}
              >
                {product.badge}
              </span>
            )}
            <motion.img
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                data-testid={`product-thumb-${i}`}
                className={`flex-1 aspect-square rounded-lg overflow-hidden border transition-all ${
                  i === activeImage ? "border-[#D4AF37]" : "border-white/5 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2">{product.category}</p>
            <h1 className="font-display text-3xl md:text-5xl text-[#FDFBF7] leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#3a2e2e]"}
                />
              ))}
            </div>
            <span className="font-medium text-[#FDFBF7]">{product.rating}</span>
            <span className="text-[#A19D98]">· {product.reviews} avis vérifiés</span>
          </div>

          <p className="text-base text-[#A19D98] leading-relaxed">{product.description}</p>

          {/* Pricing block */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#141010] border border-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98] mb-1.5">Prix détail</p>
              <p className="font-mono text-2xl font-semibold text-[#FDFBF7]">{formatXOF(product.retailPrice)}</p>
              <p className="text-xs text-[#75716C] mt-1.5">Min. {product.minRetail} unité</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] mb-1.5">Prix gros</p>
              <p className="font-mono text-2xl font-semibold text-[#D4AF37]">{formatXOF(product.wholesalePrice)}</p>
              <p className="text-xs text-[#D4AF37]/80 mt-1.5">Dès {product.minWholesale} unités</p>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-[#1A1515] border border-white/5 p-3">
              <Package size={14} className="text-[#D4AF37] mb-1.5" />
              <p className="text-[#A19D98] uppercase tracking-wider text-[10px]">Poids</p>
              <p className="font-mono text-[#FDFBF7] mt-0.5">{product.weightKg} kg</p>
            </div>
            <div className="rounded-lg bg-[#1A1515] border border-white/5 p-3">
              <Truck size={14} className="text-[#D4AF37] mb-1.5" />
              <p className="text-[#A19D98] uppercase tracking-wider text-[10px]">Origine</p>
              <p className="font-mono text-[#FDFBF7] mt-0.5">Shenzhen</p>
            </div>
            <div className="rounded-lg bg-[#1A1515] border border-white/5 p-3">
              <ShieldCheck size={14} className="text-[#D4AF37] mb-1.5" />
              <p className="text-[#A19D98] uppercase tracking-wider text-[10px]">QC</p>
              <p className="font-mono text-[#FDFBF7] mt-0.5">Contrôlé</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/22606900288"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="product-order-cta"
              className="flex-1 inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-[#FDFBF7] rounded-md font-semibold hover:brightness-110 transition-all glow-red text-sm uppercase tracking-wider"
            >
              <MessageCircle size={16} /> Commander sur WhatsApp
            </a>
            <a
              href="tel:+22606900288"
              data-testid="product-call-cta"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-[#D4AF37] text-[#D4AF37] rounded-md font-semibold hover:bg-[#D4AF37]/10 transition-all text-sm uppercase tracking-wider"
            >
              <Phone size={16} /> Appeler
            </a>
          </div>
        </div>
      </div>

      {/* Profit calculator */}
      <div className="mb-16">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-1">Simulation</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#FDFBF7]">
            Combien tu gagnes <span className="text-gold-gradient">vraiment ?</span>
          </h2>
        </div>
        <ProfitCalculator product={product} />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl text-[#FDFBF7] mb-5">Dans la même catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <div className="h-12" />
    </div>
  );
}
