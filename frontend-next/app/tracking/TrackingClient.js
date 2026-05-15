"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, MapPin, Truck, Search } from "lucide-react";
import { getTrackingByCode } from "@/services/tracking";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import { STATUS_STEPS } from "@/data/tracking";

export default function TrackingClient() {
  const [code, setCode] = useState("");
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setTracking(null);

    try {
      const data = await getTrackingByCode(code.trim());
      setTracking(data);
    } catch (err) {
      setError("Colis introuvable. Vérifiez votre code de suivi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#B8941E] mb-2">Tracking</p>
        <h1 className="font-display text-3xl md:text-5xl text-[#1A1515]">
          Où est <span className="text-gold-gradient">ton colis ?</span>
        </h1>
        <p className="text-sm md:text-base text-[#5C5854] mt-3 max-w-md">
          Entre ton code de suivi (ex : CE2026A1) pour suivre ton expédition en temps réel.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-10">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5854]" />
          <input
            data-testid="tracking-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: CE2026A1"
            className="w-full bg-[#FFFFFF] border border-[#B8941E]/15 rounded-lg pl-12 pr-32 py-4 text-sm tracking-widest uppercase text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E]/50 focus:outline-none"
          />
          <button
            data-testid="tracking-search-btn"
            type="submit"
            disabled={loading || !code.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-white rounded-md text-sm font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Recherche..." : "Suivre"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg bg-[#A8141B]/8 border border-[#A8141B]/20 p-5 text-sm text-[#A8141B]">
          {error}
        </div>
      )}

      {tracking && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
          <div className="rounded-xl bg-[#FFFFFF] border border-[#1A1515]/8 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Package size={24} className="text-[#B8941E]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854]">Code de suivi</p>
                  <p className="font-mono text-xl text-[#1A1515] tracking-widest">{tracking.code}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm ${
                  tracking.status === "delivered"
                    ? "bg-[#1F6B23]/12 text-[#1F6B23]"
                    : tracking.status === "in_transit"
                    ? "bg-[#B8941E]/12 text-[#B8941E]"
                    : "bg-[#5C5854]/12 text-[#5C5854]"
                }`}
              >
                {tracking.status === "delivered" ? "Livré" : tracking.status === "in_transit" ? "En transit" : "En préparation"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <MetaCard icon={Truck} label="Mode" value={tracking.shipping_mode || "N/A"} />
              <MetaCard icon={MapPin} label="Origine" value={tracking.origin || "Shenzhen, CN"} />
              <MetaCard icon={Clock} label="ETA" value={tracking.eta || "N/A"} />
              <MetaCard icon={CheckCircle} label="Statut" value={tracking.current_status || "N/A"} highlight />
            </div>

            {tracking.notes && (
              <div className="rounded-lg bg-[#F5F0E6] border border-[#1A1515]/8 p-4 text-sm text-[#5C5854] leading-relaxed">
                <span className="font-medium text-[#1A1515]">Note :</span> {tracking.notes}
              </div>
            )}
          </div>

          <TrackingTimeline
            steps={STATUS_STEPS}
            currentStep={tracking.status}
            updatedAt={tracking.updated_at}
          />
        </motion.div>
      )}

      {!tracking && !error && (
        <div className="text-center py-12">
          <p className="text-sm text-[#8A857F]">
            Tu n&apos;as pas encore de code ? Contacte-nous sur{" "}
            <a href="https://wa.me/22606900288" className="text-[#B8941E] hover:underline">
              WhatsApp
            </a>
            .
          </p>
        </div>
      )}

      <div className="h-16" />
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
