import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { formatXOF } from "../../lib/format";

export default function ProductCard({ product, index = 0 }) {
  const badge = product.badge;
  const badgeIsGold = product.badgeColor === "gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/produit/${product.slug}`}
        data-testid={`product-card-${product.id}`}
        className="group block relative overflow-hidden rounded-xl bg-[#141010] border border-white/5 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(212,175,55,0.1)]"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#1A1515]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent opacity-60" />

          {badge && (
            <span
              data-testid={`product-badge-${product.id}`}
              className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] rounded-sm ${
                badgeIsGold
                  ? "bg-[#D4AF37] text-[#0A0A0A]"
                  : "bg-[#C8102E] text-[#FDFBF7]"
              }`}
            >
              {badge}
            </span>
          )}

          {product.minWholesale && (
            <span className="absolute bottom-3 right-3 px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm bg-[#0A0A0A]/80 text-[#D4AF37] border border-[#D4AF37]/20">
              Gros dès {product.minWholesale}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-display text-base leading-snug text-[#FDFBF7] line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[#A19D98]">
            <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
            <span className="font-medium text-[#FDFBF7]">{product.rating}</span>
            <span>· {product.reviews} avis</span>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#75716C]">Prix détail</p>
              <p className="font-mono text-base font-semibold text-[#FDFBF7]">
                {formatXOF(product.retailPrice)}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">Gros</p>
              <p className="font-mono text-sm font-semibold text-[#D4AF37]">
                {formatXOF(product.wholesalePrice)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
