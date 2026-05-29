"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Package, ShieldCheck, MessageCircle, Phone, LucideRulerDimensionLine, Share2 } from "lucide-react";
import { formatXOF } from "@/lib/format";
import ProfitCalculator from "@/components/products/ProfitCalculator";
import ProductCard from "@/components/products/ProductCard";
import ProductDetailSkeleton from "@/components/products/ProductDetailSkeleton";
import VideoCarousel from "@/components/products/VideoCarousel";

export default function ProductDetailClient({ product, related }) {
  const [activeImage, setActiveImage] = useState(0);
  const [loading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const productUrl = `${siteUrl}/produit/${product.slug}`;
  
  const whatsappMessage = encodeURIComponent(
    `Bonjour, je suis interesse par ce produit :\n\n` +
    `Produit : ${product.name}\n` +
    `Lien : ${productUrl}\n\n` +
    `Prix detail : ${formatXOF(product.retailPrice)}\n` +
    `Prix gros : ${formatXOF(product.wholesalePrice)} (des ${product.minWholesale} unites)\n\n` +
    `Merci de me donner plus d'informations sur la commande.`
  );
  
  const whatsappUrl = `https://wa.me/22606900288?text=${whatsappMessage}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Échec de la copie:", err);
    }
  };

  return (
    <div data-testid="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
      <Link
        href="/catalogue"
        data-testid="product-back-link"
        className="inline-flex items-center gap-2 text-sm text-[#5C5854] hover:text-[#B8941E] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#1A1515]/8 mb-3 relative">
            {product.badge && (
              <span
                className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm ${
                  product.badgeColor === "gold"
                    ? "bg-[#B8941E] text-[#1A1515]"
                    : "bg-[#C8102E] text-white"
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
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                data-testid={`product-thumb-${i}`}
                className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                  i === activeImage ? "border-[#B8941E] ring-2 ring-[#B8941E]/20" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">{product.category}</p>
            <h1 className="font-display text-3xl md:text-5xl text-[#1A1515] leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating) ? "fill-[#B8941E] text-[#B8941E]" : "text-[#E5DCC9]"}
                />
              ))}
            </div>
            <span className="font-medium text-[#1A1515]">{product.rating}</span>
            <span className="text-[#5C5854]">· {product.reviews} avis vérifiés</span>
          </div>

          <p className="text-base text-[#5C5854] leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#FFFFFF] border border-[#1A1515]/8 p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] mb-1.5">Prix détail</p>
              <p className="font-mono text-2xl font-semibold text-[#1A1515]">{formatXOF(product.retailPrice)}</p>
              <p className="text-xs text-[#8A857F] mt-1.5">Min. {product.minRetail} unité</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#B8941E]/10 to-transparent border border-[#B8941E]/30 p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8941E] mb-1.5">Prix gros</p>
              <p className="font-mono text-2xl font-semibold text-[#B8941E]">{formatXOF(product.wholesalePrice)}</p>
              <p className="text-xs text-[#B8941E]/80 mt-1.5">Dès {product.minWholesale} unités</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-[#F5F0E6] border border-[#1A1515]/8 p-3">
              <Package size={14} className="text-[#B8941E] mb-1.5" />
              <p className="text-[#5C5854] uppercase tracking-wider text-[10px]">Poids</p>
              <p className="font-mono text-[#1A1515] mt-0.5">{product.weightKg} kg</p>
            </div>
            <div className="rounded-lg bg-[#F5F0E6] border border-[#1A1515]/8 p-3">
              <LucideRulerDimensionLine size={14} className="text-[#B8941E] mb-1.5" />
              <p className="text-[#5C5854] uppercase tracking-wider text-[10px]">Dimensions</p>
              <p className="font-mono text-[#1A1515] mt-0.5">{product.dimensions}</p>
            </div>
            <div className="rounded-lg bg-[#F5F0E6] border border-[#1A1515]/8 p-3">
              <ShieldCheck size={14} className="text-[#B8941E] mb-1.5" />
              <p className="text-[#5C5854] uppercase tracking-wider text-[10px]">QC</p>
              <p className="font-mono text-[#1A1515] mt-0.5">Contrôlé</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="product-order-cta"
              className="flex-1 inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-white rounded-md font-semibold hover:brightness-110 transition-all glow-red text-sm uppercase tracking-wider"
            >
              <MessageCircle size={16} /> Commander sur WhatsApp
            </a>
            <button
              onClick={handleCopyLink}
              data-testid="product-copy-link"
              className="inline-flex items-center justify-center gap-2 px-5 py-4 border border-[#1A1515]/15 text-[#5C5854] rounded-md font-semibold hover:border-[#B8941E]/40 hover:text-[#B8941E] transition-all text-sm"
            >
              <Share2 size={16} />
              {copied ? "Copié !" : "Copier le lien"}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <VideoCarousel videoLinks={product.videoLinks} />
      </div>

      <div className="mb-16">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-1">Simulation</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1A1515]">
            Combien tu gagnes <span className="text-gold-gradient">vraiment ?</span>
          </h2>
        </div>
        <ProfitCalculator product={product} />
      </div>

      {related.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl text-[#1A1515] mb-5">Dans la même catégorie</h2>
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
