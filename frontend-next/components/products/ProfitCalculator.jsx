import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";
import { Ship, Plane, Zap, TrendingUp, AlertCircle, Sparkles, MessageCircle } from "lucide-react";
import { getShippingOptions } from "../../services/products";
import { formatXOF, formatPct } from "../../lib/format";

const ICONS = { Ship, Plane, Zap };

const FIXED_RATES = {
  aerien_std: { pricePerKg: 12000, mode: "weight" },
  aerien_exp: { pricePerKg: 14000, mode: "weight" },
  maritime:   { pricePerCbm: 235000, mode: "volume" },
};

function parseVolumeFromDimensions(dimStr, qty) {
  const cleaned = dimStr.replace(/cm|mm|m| /gi, "").trim();
  const parts = cleaned.split(/[x×X]/).map(Number);
  if (parts.length !== 3 || parts.some((v) => isNaN(v) || v <= 0)) return null;
  const [L, l, H] = parts;
  const volumeUnitCbm = (L * l * H) / 1_000_000;
  return volumeUnitCbm * qty;
}

export default function ProfitCalculator({ product }) {
  const [transportId, setTransportId] = useState("aerien_std");
  const [quantity, setQuantity] = useState(product.minWholesale || 10);
  const [sellPrice, setSellPrice] = useState(product.suggestedSellPrice);
  const [shippingOptions, setShippingOptions] = useState([]);

  useEffect(() => {
    async function fetchShippingOptions() {
      try {
        const data = await getShippingOptions();
        setShippingOptions(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchShippingOptions();
  }, []);

  useEffect(() => {
    setSellPrice(product.suggestedSellPrice);
  }, [product.id, product.suggestedSellPrice]);

  const transport = shippingOptions.find((s) => s.id === transportId);
  const rate = FIXED_RATES[transportId];

  const isMaritime = rate?.mode === "volume";
  const hasLotInfo = product.volumePerLot && product.lotSize;
  const isLotMode = isMaritime && hasLotInfo;

  useEffect(() => {
    if (isLotMode) {
      setQuantity(1);
    } else {
      setQuantity(product.minWholesale || 10);
    }
  }, [transportId, isLotMode, product.id, product.minWholesale, product.volumePerLot, product.lotSize]);

  const calc = useMemo(() => {
    if (!transport || !rate) return null;

    const totalUnits = isLotMode
      ? Math.max(1, Number(quantity) || 1) * (product.lotSize || 1)
      : Math.max(1, Number(quantity) || 0);
    const qty = totalUnits;
    const isWholesale = qty >= product.minWholesale;
    const unitCost = isWholesale ? product.wholesalePrice : product.retailPrice;
    const productCost = unitCost * qty;
    const totalWeightKg = product.weightKg * qty;

    let shippingCost = 0;
    let volumeCbm = null;
    let volumeMethod = null;
    let canCalculate = true;

    if (rate.mode === "weight") {
      shippingCost = rate.pricePerKg * totalWeightKg;
    } else {
      if (hasLotInfo) {
        const lots = Math.max(1, Number(quantity) || 1);
        volumeCbm = lots * product.volumePerLot;
        volumeMethod = "lot";
        shippingCost = volumeCbm * rate.pricePerCbm;
      } else if (product.dimensions) {
        const cbm = parseVolumeFromDimensions(product.dimensions, qty);
        if (cbm !== null) {
          volumeCbm = cbm;
          volumeMethod = "dimensions";
          shippingCost = cbm * rate.pricePerCbm;
        } else {
          canCalculate = false;
        }
      } else {
        canCalculate = false;
      }
    }

    if (!canCalculate) {
      return {
        canCalculate: false,
        shippingNote: product.shippingNote || "Le volume est difficile à déterminer pour ce produit. Contactez-nous pour un devis personnalisé.",
        totalWeightKg,
        qty,
        isWholesale,
        unitCost,
        productCost,
      };
    }

    const totalCost = productCost + shippingCost;
    const revenue = (Number(sellPrice) || 0) * qty;
    const profit = revenue - totalCost;
    const roi = totalCost > 0 ? profit / totalCost : 0;
    const unitLandedCost = qty > 0 ? totalCost / qty : 0;

    return {
      canCalculate: true,
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
      volumeCbm,
      volumeMethod,
    };
  }, [quantity, sellPrice, transport, rate, product, isLotMode, hasLotInfo]);

  if (!calc || !transport || !rate) return null;

  if (!calc.canCalculate) {
    return (
      <div
        data-testid="profit-calculator"
        className="rounded-2xl border border-[#B8941E]/20 bg-gradient-to-b from-[#FFFFFF] to-[#F9F4EA] p-5 md:p-7 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8102E]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#B8941E]" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E]">Outil business</p>
          </div>
          <h3 className="font-display text-2xl text-[#1A1515] mb-2">Calculateur de profit</h3>
          <p className="text-sm text-[#5C5854] mb-6">
            Mode sélectionné : <span className="font-medium text-[#1A1515]">{transport.label}</span>
          </p>

          <div className="rounded-xl bg-[#C8102E]/8 border border-[#C8102E]/25 p-5 text-center">
            <AlertCircle size={28} className="text-[#A8141B] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1A1515] mb-2">
              Volume de transport difficile à déterminer
            </p>
            <p className="text-sm text-[#5C5854] leading-relaxed mb-4">
              {calc.shippingNote}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setTransportId("aerien_std")}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#B8941E]/40 text-[#B8941E] rounded-md font-semibold text-sm hover:bg-[#B8941E]/10 transition-all"
              >
                <Plane size={14} /> Aérien Standard
              </button>
              <button
                onClick={() => setTransportId("aerien_exp")}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#1A1515]/15 text-[#5C5854] rounded-md font-semibold text-sm hover:border-[#B8941E]/40 hover:text-[#B8941E] transition-all"
              >
                <Zap size={14} /> Aérien Express
              </button>
              <a
                href="https://wa.me/22606900288"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#25D366] to-[#1FAA53] text-white rounded-md font-semibold text-sm"
              >
                <MessageCircle size={14} /> Devis sur WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-4 text-xs text-[#8A857F]">
            <p>Poids total estimé : <span className="font-mono text-[#1A1515]">{calc.totalWeightKg.toFixed(2)} kg</span></p>
            {calc.qty && (
              <p>Quantité : <span className="font-mono text-[#1A1515]">{calc.qty} unités</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Produit", value: calc.productCost, color: "#C8102E" },
    { name: "Transport", value: calc.shippingCost, color: "#A60D26" },
    { name: "Revenu", value: calc.revenue, color: "#B8941E" },
    { name: "Profit", value: Math.max(calc.profit, 0), color: calc.profit >= 0 ? "#1F6B23" : "#8A857F" },
  ];

  const isProfitable = calc.profit > 0;

  const quantityLabel = isLotMode ? `Quantité (lots de ${product.lotSize})` : "Quantité";
  const quantityHint = isLotMode ? `${calc.qty} unités au total` : null;

  const volumeMethodLabel = {
    lot: `Volume par lot (${product.volumePerLot} CBM / lot de ${product.lotSize})`,
    dimensions: `Volume calculé depuis les dimensions (${product.dimensions})`,
  };

  return (
    <div
      data-testid="profit-calculator"
      className="rounded-2xl border border-[#B8941E]/20 bg-gradient-to-b from-[#FFFFFF] to-[#F9F4EA] p-5 md:p-7 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C8102E]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#B8941E]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-1.5 flex items-center gap-1.5">
              <Sparkles size={12} />
              Outil business
            </p>
            <h3 className="font-display text-2xl text-[#1A1515]">Calculateur de profit</h3>
            <p className="text-sm text-[#5C5854] mt-1">
              Ajuste les variables, vois ta marge en temps réel.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] block mb-2.5">
            Mode de transport
          </label>
          <div className="grid grid-cols-3 gap-2">
            {shippingOptions.map((opt) => {
              const Icon = ICONS[opt.icon];
              const active = opt.id === transportId;
              return (
                <button
                  key={opt.id}
                  data-testid={`transport-${opt.id}`}
                  onClick={() => setTransportId(opt.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    active
                      ? "border-[#B8941E] bg-[#B8941E]/8 text-[#B8941E] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      : "border-[#1A1515]/8 bg-[#F5F0E6] text-[#5C5854] hover:border-[#B8941E]/30 hover:text-[#1A1515]"
                  }`}
                >
                  {Icon && <Icon size={18} strokeWidth={1.6} />}
                  <span className="text-xs font-medium leading-tight text-center">
                    {opt.label}
                  </span>
                  <span className="text-[9px] tracking-wider opacity-70">{opt.estimatedDays}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] block mb-2">
              {quantityLabel}
              {calc.isWholesale && (
                <span className="ml-2 text-[#B8941E] normal-case tracking-normal">
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
              className="w-full bg-[#F5F0E6] border border-[#B8941E]/25 rounded-lg px-4 py-3 font-mono text-lg text-[#1A1515] focus:border-[#B8941E] focus:outline-none transition-colors"
            />
            {quantityHint && (
              <p className="text-[11px] text-[#8A857F] mt-1.5">{quantityHint}</p>
            )}
            {!isLotMode && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {Array.from(
                  new Set([product.minRetail, product.minWholesale, product.minWholesale * 2, product.minWholesale * 5])
                ).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    data-testid={`calc-qty-preset-${q}`}
                    className="text-[11px] px-2.5 py-1 rounded-md border border-[#1A1515]/10 text-[#5C5854] hover:border-[#B8941E]/40 hover:text-[#B8941E] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] block mb-2">
              Prix de revente unitaire (FCFA)
            </label>
            <input
              type="number"
              min={0}
              data-testid="calc-sell-price-input"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="w-full bg-[#F5F0E6] border border-[#B8941E]/25 rounded-lg px-4 py-3 font-mono text-lg text-[#1A1515] focus:border-[#B8941E] focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-[#8A857F] mt-2">
              Suggéré : <span className="text-[#B8941E]">{formatXOF(product.suggestedSellPrice)}</span>
            </p>
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
          <div className="flex justify-between p-3 rounded-lg bg-[#F5F0E6] border border-[#1A1515]/8">
            <span className="text-[#5C5854]">Coût unitaire débarqué</span>
            <span className="font-mono text-[#1A1515]">{formatXOF(calc.unitLandedCost)}</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-[#F5F0E6] border border-[#1A1515]/8">
            <span className="text-[#5C5854]">Poids total</span>
            <span className="font-mono text-[#1A1515]">{calc.totalWeightKg.toFixed(2)} kg</span>
          </div>
        </div>

        {isMaritime && calc.volumeCbm !== null && (
          <div className="mb-6 rounded-lg bg-[#F5F0E6] border border-[#B8941E]/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] mb-1">
                  Volume maritime
                </p>
                <p className="font-mono text-lg font-semibold text-[#1A1515]">
                  {calc.volumeCbm.toFixed(4)} CBM
                </p>
                {volumeMethodLabel[calc.volumeMethod] && (
                  <p className="text-[11px] text-[#8A857F] mt-1">
                    {volumeMethodLabel[calc.volumeMethod]}
                  </p>
                )}
              </div>
              <Ship size={24} className="text-[#B8941E]/40" />
            </div>
          </div>
        )}

        <div className="rounded-xl bg-[#F9F4EA] border border-[#1A1515]/8 p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] mb-3">
            Décomposition financière
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#5C5854", fontSize: 11 }}
                  axisLine={{ stroke: "#E5DCC9" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#8A857F", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                />
                <Tooltip
                  cursor={{ fill: "rgba(212,175,55,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#B8941E" }}
                  formatter={(v) => formatXOF(v)}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isProfitable ? "ok" : "no"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 p-4 rounded-lg flex items-start gap-3 border ${
              isProfitable
                ? "bg-[#1F6B23]/10 border-[#1F6B23]/30 text-[#1F6B23]"
                : "bg-[#C8102E]/10 border-[#C8102E]/30 text-[#A8141B]"
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
    neutral: "text-[#1A1515]",
    gold: "text-[#B8941E]",
    success: "text-[#1F6B23]",
    danger: "text-[#A8141B]",
  };
  return (
    <div
      data-testid={testid}
      className={`rounded-lg border p-3 ${
        highlight
          ? "bg-gradient-to-br from-[#B8941E]/8 to-transparent border-[#B8941E]/30"
          : "bg-[#F5F0E6] border-[#1A1515]/8"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] mb-1">{label}</p>
      <p className={`font-mono text-base md:text-lg font-semibold ${colors[accent]}`}>{value}</p>
    </div>
  );
}
