"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Lock, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.session) throw new Error("No session returned");

      // Force full page reload so cookies are available for subsequent requests
      window.location.replace(redirect);
    } catch (err) {
      console.error("Login error:", err);
      if (err.message?.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError("Erreur de connexion. Veuillez réessayer.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#B8941E]/20 bg-white p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#B8941E]/10 flex items-center justify-center">
          <Lock size={20} className="text-[#B8941E]" />
        </div>
        <h1 className="font-display text-2xl text-[#1A1515]">Admin</h1>
        <p className="text-sm text-[#5C5854] mt-1">
          Connectez-vous pour accéder au dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 rounded-lg bg-[#C8102E]/10 border border-[#C8102E]/25 text-[#A8141B] text-sm"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] block mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@chinaexpress.com"
            required
            autoComplete="email"
            className="w-full bg-[#F5F0E6] border border-[#B8941E]/25 rounded-lg px-4 py-3 text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854] block mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full bg-[#F5F0E6] border border-[#B8941E]/25 rounded-lg px-4 py-3 text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E] focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#B8941E] to-[#9E7F14] text-white font-semibold text-sm hover:from-[#C8A52E] hover:to-[#B8941E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      <p className="text-xs text-[#8A857F] text-center mt-6">
        Accès réservé aux administrateurs
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFFFF] to-[#F9F4EA] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={
          <div className="rounded-2xl border border-[#B8941E]/20 bg-white p-8 shadow-sm text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-[#B8941E]" />
            <p className="text-sm text-[#5C5854] mt-3">Chargement...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
