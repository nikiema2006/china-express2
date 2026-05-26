"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link2, Sparkles, Loader2, CheckCircle, AlertCircle, X, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
};

export default function AIProductImport() {
  const [url, setUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageBase64s, setImageBase64s] = useState([]);
  const [jobs, setJobs] = useState([]);
  const fileInputRef = useRef(null);
  const subscriptionsRef = useRef({});

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      setImagePreview(result);
      setImageBase64(result);
      setImageBase64s((prev) => [...prev, result]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newBase64s = [];
    let loaded = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        newBase64s.push(result);
        loaded++;
        if (loaded === files.length) {
          setImagePreview(newBase64s[0]);
          setImageBase64(newBase64s[0]);
          setImageBase64s((prev) => [...prev, ...newBase64s]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const submitJob = async () => {
    if (!url.trim() && imageBase64s.length === 0) return;

    try {
      const resp = await fetch('/api/ai-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), imageBase64s: imageBase64s.length > 0 ? imageBase64s : undefined, imageBase64 }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erreur lors de la création du job');

      const newJob = {
        id: data.jobId,
        url: url.trim(),
        status: STATUS.PENDING,
        result: null,
        error: null,
        created_at: new Date().toISOString(),
      };

      setJobs((prev) => [newJob, ...prev]);
      setUrl('');
      setImagePreview(null);
      setImageBase64(null);
      setImageBase64s([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      subscribeToJob(newJob);
    } catch (err) {
      console.error('Job submission error:', err);
      alert(`Erreur: ${err.message}`);
    }
  };

  const subscribeToJob = (job) => {
    // Prevent double subscription
    if (subscriptionsRef.current[job.id]) return;

    const channel = supabase
      .channel(`ai-job-${job.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ai_jobs', filter: `id=eq.${job.id}` },
        (payload) => {
          const updated = payload.new;
          setJobs((prev) =>
            prev.map((j) =>
              j.id === updated.id
                ? { ...j, status: updated.status, result: updated.result, error: updated.error }
                : j
            )
          );
        }
      )
      .subscribe();

    subscriptionsRef.current[job.id] = channel;
  };

  useEffect(() => {
    return () => {
      Object.values(subscriptionsRef.current).forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  useEffect(() => {
    async function fetchRecentJobs() {
      const { data, error } = await supabase
        .from('ai_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        setJobs(data);
        data.forEach((job) => {
          if (job.status === STATUS.PENDING || job.status === STATUS.PROCESSING) {
            subscribeToJob(job);
          }
        });
      }
    }
    fetchRecentJobs();
  }, []);

  const removeJob = async (id) => {
    await supabase.from('ai_jobs').delete().eq('id', id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (subscriptionsRef.current[id]) {
      supabase.removeChannel(subscriptionsRef.current[id]);
      delete subscriptionsRef.current[id];
    }
  };

  const clearCompleted = async () => {
    const completedIds = jobs.filter((j) => j.status === STATUS.COMPLETED || j.status === STATUS.ERROR).map((j) => j.id);
    if (completedIds.length > 0) {
      await supabase.from('ai_jobs').delete().in('id', completedIds);
      setJobs((prev) => prev.filter((j) => j.status === STATUS.PENDING || j.status === STATUS.PROCESSING));
    }
  };

  const pendingCount = jobs.filter((j) => j.status === STATUS.PENDING).length;
  const processingCount = jobs.filter((j) => j.status === STATUS.PROCESSING).length;
  const completedCount = jobs.filter((j) => j.status === STATUS.COMPLETED).length;
  const errorCount = jobs.filter((j) => j.status === STATUS.ERROR).length;
  const canSubmit = url.trim() || imageBase64s.length > 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#B8941E]/20 p-5 md:p-6">
        <h3 className="font-display text-xl text-[#1A1515] mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-[#B8941E]" />
          Import AI de produit
        </h3>
        <p className="text-sm text-[#5C5854] mb-5">
          Colle un lien ou upload des photos. L'IA analysera et importera automatiquement en brouillon.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5854]" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.alibaba.com/product/..."
              className="w-full bg-[#F7F5F2] border border-[#B8941E]/20 rounded-lg pl-11 pr-4 py-3 text-sm text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E] focus:outline-none"
            />
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative border-2 border-dashed border-[#B8941E]/30 rounded-xl p-6 text-center hover:border-[#B8941E]/60 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-40 rounded-lg object-cover" />
                {imageBase64s.length > 1 && (
                  <span className="absolute -top-2 -right-2 bg-[#B8941E] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {imageBase64s.length}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setImageBase64(null);
                    setImageBase64s([]);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-[#C8102E] text-white rounded-full hover:bg-[#A60D26] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={24} className="mx-auto text-[#B8941E] mb-2" />
                <p className="text-sm text-[#5C5854]">Glisse des images ici ou <span className="text-[#B8941E] font-medium">clique pour parcourir</span></p>
                <p className="text-xs text-[#8A857F] mt-1">PNG, JPG, WebP — plusieurs fichiers acceptés</p>
              </div>
            )}
          </div>

          <button
            onClick={submitJob}
            disabled={!canSubmit}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B8941E] to-[#8C6E15] text-white rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} />
            Analyser et importer ({pendingCount + processingCount} en cours)
          </button>
        </div>
      </div>

      <AnimatePresence>
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#B8941E]/20 p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-lg text-[#1A1515]">
                File d'attente ({jobs.length})
              </h4>
              <div className="flex gap-2 text-xs">
                {processingCount > 0 && (
                  <span className="flex items-center gap-1 text-[#B8941E]">
                    <Loader2 size={12} className="animate-spin" /> {processingCount} en cours
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="flex items-center gap-1 text-[#5C5854]">
                    <Clock size={12} /> {pendingCount} en attente
                  </span>
                )}
                {completedCount > 0 && (
                  <span className="text-[#1F6B23]">{completedCount} importés</span>
                )}
                {errorCount > 0 && (
                  <span className="text-[#C8102E]">{errorCount} erreurs</span>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-lg border p-3 ${
                      job.status === STATUS.COMPLETED
                        ? 'border-[#1F6B23]/30 bg-[#1F6B23]/5'
                        : job.status === STATUS.ERROR
                        ? 'border-[#C8102E]/30 bg-[#C8102E]/5'
                        : job.status === STATUS.PROCESSING
                        ? 'border-[#B8941E]/30 bg-[#B8941E]/5'
                        : 'border-[#1A1515]/10 bg-[#F7F5F2]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {job.status === STATUS.PENDING && (
                          <Clock size={16} className="text-[#5C5854]" />
                        )}
                        {job.status === STATUS.PROCESSING && (
                          <Loader2 size={16} className="text-[#B8941E] animate-spin" />
                        )}
                        {job.status === STATUS.COMPLETED && (
                          <CheckCircle size={16} className="text-[#1F6B23]" />
                        )}
                        {job.status === STATUS.ERROR && (
                          <AlertCircle size={16} className="text-[#C8102E]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">
                          {job.status === STATUS.PENDING && 'En file d\'attente'}
                          {job.status === STATUS.PROCESSING && 'Analyse en cours...'}
                          {job.status === STATUS.COMPLETED && (
                            <span className="text-[#1F6B23]">
                              Importé — {job.result?.product?.name || 'Produit'}
                            </span>
                          )}
                          {job.status === STATUS.ERROR && (
                            <span className="text-[#C8102E]">{job.error}</span>
                          )}
                        </p>
                        {job.url && (
                          <p className="text-[10px] text-[#5C5854] truncate mt-0.5">
                            <Link2 size={8} className="inline mr-0.5" />{job.url}
                          </p>
                        )}
                        {job.image_base64 && (
                          <p className="text-[10px] text-[#5C5854] mt-0.5">
                            <Upload size={8} className="inline mr-0.5" />Image uploadée
                          </p>
                        )}
                        <p className="text-[10px] text-[#8A857F] mt-0.5">
                          {new Date(job.created_at).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>

                      {(job.status === STATUS.PENDING || job.status === STATUS.ERROR || job.status === STATUS.COMPLETED) && (
                        <button
                          onClick={() => removeJob(job.id)}
                          className="p-1 rounded text-[#5C5854] hover:text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {(completedCount > 0 || errorCount > 0) && (
              <div className="flex gap-4 mt-3">
                <button
                  onClick={clearCompleted}
                  className="text-xs text-[#5C5854] hover:text-[#B8941E] transition-colors"
                >
                  Effacer les terminés
                </button>
                {jobs.length > 0 && (
                  <button
                    onClick={() => {
                      supabase.from('ai_jobs').delete().in('id', jobs.map((j) => j.id));
                      Object.values(subscriptionsRef.current).forEach((ch) => supabase.removeChannel(ch));
                      subscriptionsRef.current = {};
                      setJobs([]);
                    }}
                    className="text-xs text-[#C8102E] hover:text-[#A60D26] transition-colors"
                  >
                    Tout effacer
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
