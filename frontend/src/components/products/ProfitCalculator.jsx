import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";
import { Ship, Plane, Zap, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { SHIPPING_OPTIONS } from "../../data/products";
import { formatXOF, formatPct } from "../../lib/format";

const ICONS = { Ship, Plane, Zap };

export default function ProfitCalculator({ product }) {
  const [transportId, setTransportId] = useState("aerien_std");
  const [quantity, setQuantity] = useState(product.minWholesale || 10);
  const [sellPrice, setSellPrice] = useState(product.suggestedSellPrice);

  // Reset whenever product changes
  useEffect(() => {
    setQuantity(product.minWholesale || 10);
    setSellPrice(product.suggestedSellPrice);
  }, [product.id]);

  const transport = SHIPPING_OPTIONS.find((s) => s.id === transportId);

  const calc = useMemo(() => {
    const qty = Math.max(1, Number(quantity) || 0);
    const isWholesale = qty >= product.minWholesale;
    const unitCost = isWholesale ? product.wholesalePrice : product.retailPrice;
    const productCost = unitCost * qty;
    const totalWeightKg = product.weightKg * qty;
    const shippingCost = transport.pricePerKg * totalWeightKg;
    const totalCost = productCost + shippingCost;
    const revenue = (Number(sellPrice) || 0) * qty;
    const profit = revenue - totalCost;
    const roi = totalCost > 0 ? profit / totalCost : 0;
    const unitLandedCost = qty > 0 ? totalCost / qty : 0;

    return {
      qty,
      isWholesale,
      unitCost,
      productCost,
      totalWeightKg,
      shippingCost,
      totalCost,
      revenue,
      profit,
      roi,
      unitLandedCost,
    };
  }, [quantity, sellPrice, transport, product]);

  const chartData = [
    { name: "Coût produit", value: calc.productCost, color: "#C8102E" },
    { name: "Transport", value: calc.shippingCost, color: "#A60D26" },
    { name: "Revenu", value: calc.revenue, color: "#D4AF37" },
    { name: "Profit", value: Math.max(calc.profit, 0), color: calc.profit >= 0 ? "#2E7D32" : "#75716C" },
  ];

  const isProfitable = calc.profit > 0;

  return (
    <div
      data-testid="profit-calculator"
      className="rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#141010] to-[#0F0C0C] p-5 md:p-7 relative overflow-hidden"
    >
      {/* Subtle phoenix glow corner */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8102E]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-1.5 flex items-center gap-1.5">
              <Sparkles size={12} />
              Outil business
            </p>
            <h3 className="font-display text-2xl text-[#FDFBF7]">Calculateur de profit</h3>
            <p className="text-sm text-[#A19D98] mt-1">
              Ajuste les variables, vois ta marge en temps réel.
            </p>
          </div>
        </div>

        {/* Transport selector */}
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98] block mb-2.5">
            Mode de transport
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHIPPING_OPTIONS.map((opt) => {
              const Icon = ICONS[opt.icon];
              const active = opt.id === transportId;
              return (
                <button
                  key={opt.id}
                  data-testid={`transport-${opt.id}`}
                  onClick={() => setTransportId(opt.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    active
                      ? "border-[#D4AF37] bg-[#D4AF37]/8 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      : "border-white/5 bg-[#1A1515] text-[#A19D98] hover:border-[#D4AF37]/30 hover:text-[#FDFBF7]"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.6} />
                  <span className="text-xs font-medium leading-tight text-center">
                    {opt.label}
                  </span>
                  <span className="text-[9px] tracking-wider opacity-70">{opt.estimatedDays}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98] block mb-2">
              Quantité
              {calc.isWholesale && (
                <span className="ml-2 text-[#D4AF37] normal-case tracking-normal">
                  · prix gros activé
                </span>
              )}
            </label>
            <input
              type="number"
              min={1}
              data-testid="calc-quantity-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#1A1515] border border-[#D4AF37]/25 rounded-lg px-4 py-3 font-mono text-lg text-[#FDFBF7] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[product.minRetail, product.minWholesale, product.minWholesale * 2, product.minWholesale * 5].map(
                (q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuantity(q)}
                    data-testid={`calc-qty-preset-${q}`}
                    className="text-[11px] px-2.5 py-1 rounded-md border border-white/10 text-[#A19D98] hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-colors"
                  >
                    {q}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98] block mb-2">
              Prix de revente unitaire (FCFA)
            </label>
            <input
              type="number"
              min={0}
              data-testid="calc-sell-price-input"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="w-full bg-[#1A1515] border border-[#D4AF37]/25 rounded-lg px-4 py-3 font-mono text-lg text-[#FDFBF7] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-[#75716C] mt-2">
              Suggéré : <span className="text-[#D4AF37]">{formatXOF(product.suggestedSellPrice)}</span>
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ResultCard label="Coût total" value={formatXOF(calc.totalCost)} testid="calc-total-cost" />
          <ResultCard label="Revenu" value={formatXOF(calc.revenue)} testid="calc-revenue" accent="gold" />
          <ResultCard
            label="Profit"
            value={formatXOF(calc.profit)}
            testid="calc-profit"
            accent={isProfitable ? "success" : "danger"}
            highlight
          />
          <ResultCard label="ROI" value={formatPct(calc.roi)} testid="calc-roi" accent={isProfitable ? "success" : "danger"} />
        </div>

        {/* Sub stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
          <div className="flex justify-between p-3 rounded-lg bg-[#1A1515] border border-white/5">
            <span className="text-[#A19D98]">Coût unitaire débarqué</span>
            <span className="font-mono text-[#FDFBF7]">{formatXOF(calc.unitLandedCost)}</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-[#1A1515] border border-white/5">
            <span className="text-[#A19D98]">Poids total</span>
            <span className="font-mono text-[#FDFBF7]">{calc.totalWeightKg.toFixed(2)} kg</span>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl bg-[#0F0C0C] border border-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98] mb-3">
            Décomposition financière
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#A19D98", fontSize: 11 }}
                  axisLine={{ stroke: "#3a2e2e" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#75716C", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                />
                <Tooltip
                  cursor={{ fill: "rgba(212,175,55,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#141010",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#D4AF37" }}
                  formatter={(v) => formatXOF(v)}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isProfitable ? "ok" : "no"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 p-4 rounded-lg flex items-start gap-3 border ${
              isProfitable
                ? "bg-[#2E7D32]/10 border-[#2E7D32]/30 text-[#9FD89F]"
                : "bg-[#C8102E]/10 border-[#C8102E]/30 text-[#FFB1B1]"
            }`}
          >
            {isProfitable ? <TrendingUp size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
            <div className="text-sm leading-relaxed">
              {isProfitable ? (
                <>
                  <span className="font-semibold">Bonne affaire.</span> Tu fais{" "}
                  <span className="font-mono">{formatXOF(calc.profit)}</span> de marge, soit{" "}
                  <span className="font-mono">{formatPct(calc.roi)}</span> de ROI sur cette commande
                  {calc.isWholesale ? " (tarif gros appliqué)" : ""}.
                </>
              ) : (
                <>
                  <span className="font-semibold">Attention.</span> Avec ces paramètres tu es en perte. Augmente le prix de revente, monte la quantité pour passer en gros, ou choisis un transport moins cher.
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultCard({ label, value, testid, accent = "neutral", highlight = false }) {
  const colors = {
    neutral: "text-[#FDFBF7]",
    gold: "text-[#D4AF37]",
    success: "text-[#5DBA67]",
    danger: "text-[#FF6B6B]",
  };
  return (
    <div
      data-testid={testid}
      className={`rounded-lg border p-3 ${
        highlight
          ? "bg-gradient-to-br from-[#D4AF37]/8 to-transparent border-[#D4AF37]/30"
          : "bg-[#1A1515] border-white/5"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98] mb-1">{label}</p>
      <p className={`font-mono text-base md:text-lg font-semibold ${colors[accent]}`}>{value}</p>
    </div>
  );
}
