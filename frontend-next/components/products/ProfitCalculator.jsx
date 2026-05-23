import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";
import { Ship, Plane, Zap, TrendingUp, AlertCircle, Sparkles, MessageCircle } from "lucide-react";
import { getShippingOptions } from "../../services/products";
import { formatXOF, formatPct } from "../../lib/format";

const ICONS = { Ship, Plane, Zap };

const SHIPPING_CATEGORIES = {
  MCO: { label: 'MCO — Marchandises ordinaires', pricePerKg: 10000, examples: 'Coton, plastique, vêtements' },
  MCF: { label: 'MCF — Marchandises dangereuses', pricePerKg: 12000, examples: 'Batteries, liquides, parfums' },
  MCI: { label: 'MCI — Marchandises alimentaires', pricePerKg: 12000, examples: 'Nourriture, produits secs' },
};

const PRICE_PER_KG_STANDARD = 10000;
const PRICE_PER_KG_DANGEROUS = 12000;
const PRICE_PER_KG_FOOD = 12000;
const PRICE_PER_CBM_MARITIME = 235000;

function parseUnitVolumeFromDimensions(dimStr) {
  if (!dimStr) return null;
  const cleaned = dimStr.replace(/cm|mm|m| /gi, "").trim();
  const parts = cleaned.split(/[x×X]/).map(Number);
  if (parts.length !== 3 || parts.some((v) => isNaN(v) || v <= 0)) return null;
  const [L, l, H] = parts;
  return (L * l * H) / 1_000_000;
}

function getPricePerKg(shippingCategory) {
  switch (shippingCategory) {
    case 'MCF': return PRICE_PER_KG_DANGEROUS;
    case 'MCI': return PRICE_PER_KG_FOOD;
    case 'MCO':
    default: return PRICE_PER_KG_STANDARD;
  }
}

export default function ProfitCalculator({ product }) {
  const [transportId, setTransportId] = useState("aerien_std");
  const [quantity, setQuantity] = useState(product.minWholesale || 10);
  const [sellPrice, setSellPrice] = useState(product.suggestedSellPrice);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    async function fetchShippingOptions() {
      try {
        const data = await getShippingOptions();
        setShippingOptions(data);
        if (data.length > 0 && !data.find((s) => s.id === transportId)) {
          setTransportId(data[0].id);
        }
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
  const isMaritime = transport?.icon === "Ship";
  const hasLotInfo = product.volumePerLot && product.lotSize;
  const unitVolumeCbm = parseUnitVolumeFromDimensions(product.dimensions);
  const isLotMode = isMaritime && hasLotInfo;
  const isMaritimeUnitMode = isMaritime && !hasLotInfo && unitVolumeCbm !== null;
  const isMaritimeImpossible = isMaritime && !hasLotInfo && unitVolumeCbm === null;

  const minQuantity = isLotMode ? 1 : (product.minWholesale || 10);

  useEffect(() => {
    if (!transport) return;
    if (isLotMode) {
      setQuantity(1);
    } else if (isMaritimeUnitMode) {
      setQuantity(product.minWholesale || 10);
    } else {
      setQuantity(product.minWholesale || 10);
    }
  }, [transportId, isLotMode, isMaritimeUnitMode, product.id, product.minWholesale, product.volumePerLot, product.lotSize]);

  const calc = useMemo(() => {
    if (!transport) return null;

    const qty = isLotMode
      ? Math.max(1, Number(quantity) || 1) * (product.lotSize || 1)
      : Math.max(1, Number(quantity) || 0);

    // Maritime is always wholesale pricing
    const isWholesale = isMaritime || qty >= product.minWholesale;
    const unitCost = isWholesale ? product.wholesalePrice : product.retailPrice;
    const productCost = unitCost * qty;
    const totalWeightKg = product.weightKg * qty;

    let shippingCost = 0;
    let volumeCbm = null;
    let volumeMethod = null;
    let canCalculate = true;
    let shippingNote = null;

    if (!isMaritime) {
      const pricePerKg = getPricePerKg(product.shippingCategory);
      shippingCost = pricePerKg * totalWeightKg;
    } else if (isLotMode) {
      // Priority 1: volume per lot
      const lots = Math.max(1, Number(quantity) || 1);
      volumeCbm = lots * product.volumePerLot;
      volumeMethod = "lot";
      shippingCost = volumeCbm * PRICE_PER_CBM_MARITIME;
    } else if (isMaritimeUnitMode) {
      // Priority 2: volume from dimensions
      volumeCbm = unitVolumeCbm * qty;
      volumeMethod = "dimensions";
      shippingCost = volumeCbm * PRICE_PER_CBM_MARITIME;
    } else {
      // Priority 3: impossible - show contact card
      canCalculate = false;
      shippingNote = product.shippingNote || "Le volume est difficile à déterminer pour ce produit. Contactez-nous pour un devis personnalisé.";
    }

    if (!canCalculate) {
      return {
        canCalculate: false,
        shippingNote,
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
  }, [quantity, sellPrice, transport, product, isLotMode, isMaritimeUnitMode, isMaritime, product.shippingCategory, unitVolumeCbm, hasLotInfo]);

  if (!transport) return null;

  if (!calc || !calc.canCalculate) {
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
              {calc?.shippingNote}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {shippingOptions
                .filter((opt) => opt.icon !== "Ship" && opt.icon !== "Zap")
                .map((opt) => {
                  const Icon = ICONS[opt.icon];
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTransportId(opt.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#B8941E]/40 text-[#B8941E] rounded-md font-semibold text-sm hover:bg-[#B8941E]/10 transition-all"
                    >
                      {Icon && <Icon size={14} />} {opt.label}
                    </button>
                  );
                })}
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
            <p>Poids total estimé : <span className="font-mono text-[#1A1515]">{calc?.totalWeightKg.toFixed(2)} kg</span></p>
            {calc?.qty && (
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

  const quantityLabel = isLotMode
    ? `Nombre de lots (${product.lotSize} unités/lot)`
    : "Quantité";
  const quantityHint = isLotMode ? `${calc.qty} unités au total` : null;
  const quantityPlaceholder = isLotMode ? "Ex: 1, 1.5, 2, 3..." : null;

  const volumeMethodLabel = {
    lot: `Volume par lot (${product.volumePerLot} CBM / lot de ${product.lotSize})`,
    dimensions: unitVolumeCbm !== null ? `Volume unitaire × ${calc.qty} unités (${unitVolumeCbm.toFixed(4)} CBM / unité)` : "Volume calculé depuis les dimensions",
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
              {isMaritime && (
                <span className="block text-[#B8941E] mt-0.5">
                  Transport maritime — achat en gros uniquement
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854]">
              Mode de transport
            </label>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-[15px] text-[#B8941E] hover:underline flex items-center gap-1"
            >
              <AlertCircle color="red" size={14} /> Comment sont calculés les tarifs ?
            </button>
          </div>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-lg bg-[#F5F0E6] border border-[#B8941E]/20 p-4 text-xs text-[#5C5854] space-y-3 overflow-hidden"
              >
                <div>
                  <p className="font-semibold text-[#1A1515] mb-1">Transport aérien</p>
                  <p>Le tarif dépend du <span className="font-medium text-[#1A1515]">type de marchandise</span> :</p>
                  <ul className="mt-1.5 space-y-1 ml-4 list-disc">
                    <li><span className="font-medium text-[#1A1515]">MCO</span> (Marchandises ordinaires) — Coton, plastique, vêtements : <span className="font-mono text-[#B8941E]">10 000 FCFA/kg</span></li>
                    <li><span className="font-medium text-[#1A1515]">MCF</span> (Marchandises dangereuses) — Batteries, liquides, parfums : <span className="font-mono text-[#B8941E]">12 000 FCFA/kg</span></li>
                    <li><span className="font-medium text-[#1A1515]">MCI</span> (Marchandises alimentaires) — Nourriture, produits secs : <span className="font-mono text-[#B8941E]">12 000 FCFA/kg</span></li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1515] mb-1">Transport maritime</p>
                  <p>Calculé au <span className="font-medium text-[#1A1515]">volume (CBM)</span> : <span className="font-mono text-[#B8941E]">235 000 FCFA/m³</span></p>
                  <p className="text-[#8A857F] mt-1">Priorité : volume par lot → volume depuis les dimensions → devis personnalisé.</p>
                  {isMaritime && (
                    <p className="text-[#B8941E] mt-1 font-medium">Achat en gros uniquement ({product.minWholesale} unités minimum).</p>
                  )}
                </div>
                <div className="pt-2 border-t border-[#1A1515]/8">
                  <p className="text-[#8A857F] italic">Ce produit est classé : <span className="font-medium text-[#1A1515]">{product.shippingCategory}</span> ({SHIPPING_CATEGORIES[product.shippingCategory]?.label || 'N/A'})</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-2">
            {shippingOptions
              .filter((opt) => opt.icon !== "Zap")
              .map((opt) => {
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
              {isMaritime && (
                <span className="ml-2 text-[#B8941E] normal-case tracking-normal">
                  · gros uniquement
                </span>
              )}
              {!isMaritime && calc.isWholesale && (
                <span className="ml-2 text-[#B8941E] normal-case tracking-normal">
                  · prix gros activé
                </span>
              )}
            </label>
            <input
              type="number"
              min={minQuantity}
              step={isLotMode ? 0.5 : 1}
              placeholder={quantityPlaceholder}
              data-testid="calc-quantity-input"
              value={quantity}
              onChange={(e) => {
                const val = Math.max(minQuantity, Number(e.target.value) || minQuantity);
                setQuantity(val);
              }}
              className="w-full bg-[#F5F0E6] border border-[#B8941E]/25 rounded-lg px-4 py-3 font-mono text-lg text-[#1A1515] focus:border-[#B8941E] focus:outline-none transition-colors"
            />
            {quantityHint && (
              <p className="text-[11px] text-[#8A857F] mt-1.5">{quantityHint}</p>
            )}
            {!isLotMode && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {Array.from(
                  new Set([product.minWholesale, product.minWholesale * 2, product.minWholesale * 5, product.minWholesale * 10])
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
            {isLotMode && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {[1, 1.5, 2, 3, 5, 10].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    data-testid={`calc-lot-preset-${q}`}
                    className="text-[11px] px-2.5 py-1 rounded-md border border-[#1A1515]/10 text-[#5C5854] hover:border-[#B8941E]/40 hover:text-[#B8941E] transition-colors"
                  >
                    {q} {q === 1 ? 'lot' : 'lots'}
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
