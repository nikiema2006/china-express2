import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Truck , AlertCircleIcon, Loader2 } from "lucide-react";
import { getTrackingByCode, getAllTrackingCodes } from "../services/tracking";
import TrackingTimeline from "../components/tracking/TrackingTimeline";

export default function Tracking() {
  const [code, setCode] = useState("");
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sampleCodes, setSampleCodes] = useState([]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const key = code.trim().toUpperCase();
    if (!key) {
      setError("Saisis un code de suivi.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const found = await getTrackingByCode(key);
      setTracking(found);
    } catch (err) {
      setError(`Aucun colis trouvé pour le code "${key}".`);
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="tracking-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">
      <div className="text-center mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-3">Suivi de colis</p>
        <h1 className="font-display text-3xl md:text-5xl text-[#1A1515] mb-3">
          De la Chine à <span className="text-gold-gradient">chez toi.</span>
        </h1>
        <p className="text-sm md:text-base text-[#5C5854] max-w-md mx-auto">
          Saisis le code reçu sur WhatsApp pour suivre l'état de ton expédition.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5854]" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex : CE2026A1"
              data-testid="tracking-input"
              className="w-full bg-[#FFFFFF] border border-[#B8941E]/25 rounded-lg pl-11 pr-4 py-4 text-base text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E] focus:outline-none uppercase tracking-wider font-mono"
            />
          </div>
          <button
            type="submit"
            data-testid="tracking-submit"
            disabled={loading}
            className="px-7 py-4 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-white rounded-md font-semibold hover:brightness-110 transition-all text-sm uppercase tracking-wider glow-red disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Suivre"}
          </button>
        </div>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-[#C8102E]/10 border border-[#C8102E]/30 text-[#A8141B] text-sm"
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
            className="rounded-2xl bg-[#FFFFFF] border border-[#B8941E]/20 p-5 md:p-8 space-y-7"
            data-testid="tracking-result"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-[#B8941E]/10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8941E] mb-1">Code de suivi</p>
                <p className="font-mono text-xl text-[#1A1515] tracking-wider">{tracking.code}</p>
                <p className="text-sm text-[#5C5854] mt-2">{tracking.product}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] mb-1">Livraison estimée</p>
                <p className="font-display text-xl text-[#B8941E]">{tracking.estimated_delivery}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <MetaCard icon={MapPin} label="Origine" value={tracking.origin} />
              <MetaCard icon={MapPin} label="Destination" value={tracking.destination} />
              <MetaCard icon={Truck} label="Transport" value={tracking.transport} highlight />
            </div>

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
          ? "bg-[#B8941E]/8 border-[#B8941E]/30 text-[#B8941E]"
          : "bg-[#F5F0E6] border-[#1A1515]/8 text-[#1A1515]"
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
