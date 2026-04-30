import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Truck } from "lucide-react";
import { MOCK_TRACKINGS } from "../data/tracking";
import TrackingTimeline from "../components/tracking/TrackingTimeline";

export default function Tracking() {
  const [code, setCode] = useState("");
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e?.preventDefault();
    const key = code.trim().toUpperCase();
    if (!key) {
      setError("Saisis un code de suivi.");
      return;
    }
    const found = MOCK_TRACKINGS[key];
    if (!found) {
      setError(`Aucun colis trouvé pour le code "${key}". Essaie : CE2026A1, CE2026B7, CE2026D3.`);
      setTracking(null);
      return;
    }
    setError("");
    setTracking(found);
  };

  return (
    <div data-testid="tracking-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Suivi de colis</p>
        <h1 className="font-display text-3xl md:text-5xl text-[#FDFBF7] mb-3">
          De Shenzhen à <span className="text-gold-gradient">chez toi.</span>
        </h1>
        <p className="text-sm md:text-base text-[#A19D98] max-w-md mx-auto">
          Saisis le code reçu sur WhatsApp pour suivre l'état de ton expédition.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19D98]" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex : CE2026A1"
              data-testid="tracking-input"
              className="w-full bg-[#141010] border border-[#D4AF37]/25 rounded-lg pl-11 pr-4 py-4 text-base text-[#FDFBF7] placeholder:text-[#75716C] focus:border-[#D4AF37] focus:outline-none uppercase tracking-wider font-mono"
            />
          </div>
          <button
            type="submit"
            data-testid="tracking-submit"
            className="px-7 py-4 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-[#FDFBF7] rounded-md font-semibold hover:brightness-110 transition-all text-sm uppercase tracking-wider glow-red"
          >
            Suivre
          </button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap text-xs">
          <span className="text-[#75716C]">Codes test :</span>
          {Object.keys(MOCK_TRACKINGS).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCode(c); setError(""); setTracking(MOCK_TRACKINGS[c]); }}
              data-testid={`tracking-sample-${c}`}
              className="px-2.5 py-0.5 rounded border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-mono"
            >
              {c}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-[#C8102E]/10 border border-[#C8102E]/30 text-[#FFB1B1] text-sm"
          data-testid="tracking-error"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {tracking && (
          <motion.div
            key={tracking.code}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-[#141010] border border-[#D4AF37]/20 p-5 md:p-8 space-y-7"
            data-testid="tracking-result"
          >
            {/* Summary */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-[#D4AF37]/10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] mb-1">Code de suivi</p>
                <p className="font-mono text-xl text-[#FDFBF7] tracking-wider">{tracking.code}</p>
                <p className="text-sm text-[#A19D98] mt-2">{tracking.product}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#A19D98] mb-1">Livraison estimée</p>
                <p className="font-display text-xl text-[#D4AF37]">{tracking.estimatedDelivery}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <MetaCard icon={MapPin} label="Origine" value={tracking.origin} />
              <MetaCard icon={MapPin} label="Destination" value={tracking.destination} />
              <MetaCard icon={Truck} label="Transport" value={tracking.transport} highlight />
            </div>

            {/* Timeline */}
            <TrackingTimeline tracking={tracking} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-24" />
    </div>
  );
}

function MetaCard({ icon: Icon, label, value, highlight = false }) {
  return (
    <div
      className={`rounded-lg p-4 border ${
        highlight
          ? "bg-[#D4AF37]/8 border-[#D4AF37]/30 text-[#D4AF37]"
          : "bg-[#1A1515] border-white/5 text-[#FDFBF7]"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={12} className="opacity-70" />
        <p className="uppercase tracking-[0.2em] text-[10px] opacity-70">{label}</p>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
