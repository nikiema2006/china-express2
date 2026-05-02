import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link2, Sparkles, Loader2, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import { kimiService } from '@/services/kimi';

const STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  IMPORTED: 'imported',
  ERROR: 'error',
};

function createTask(url, imageBase64) {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    taskId: null,
    url,
    imageBase64,
    status: STATUS.QUEUED,
    result: null,
    error: null,
  };
}

export default function AIProductImport() {
  const [url, setUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [queue, setQueue] = useState([]);
  const fileInputRef = useRef(null);
  const processingRef = useRef(false);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result);
      setImageBase64(ev.target?.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result);
      setImageBase64(ev.target?.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const addToQueue = () => {
    if (!url.trim() && !imageBase64) return;
    setQueue((prev) => [...prev, createTask(url.trim(), imageBase64)]);
    setUrl('');
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeTask = (taskId) => {
    setQueue((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Auto-process queue with async task polling
  const queueRef = useRef(queue);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    if (processingRef.current) return;
    const currentQueue = queueRef.current;
    const nextTask = currentQueue.find((t) => t.status === STATUS.QUEUED);
    if (!nextTask) return;

    processingRef.current = true;

    // Submit task to worker
    kimiService
      .submitTask(nextTask.url, nextTask.imageBase64)
      .then((taskId) => {
        // Update local task with remote task_id and set to processing
        setQueue((prev) =>
          prev.map((t) =>
            t.id === nextTask.id ? { ...t, taskId, status: STATUS.PROCESSING } : t
          )
        );
        
        // Start polling
        const pollInterval = setInterval(async () => {
          try {
            const taskData = await kimiService.pollTask(taskId);
            
            if (taskData.status === 'completed') {
              clearInterval(pollInterval);
              setQueue((prev) =>
                prev.map((t) =>
                  t.id === nextTask.id
                    ? { ...t, status: STATUS.IMPORTED, result: taskData.result?.product || taskData.result }
                    : t
                )
              );
              processingRef.current = false;
            } else if (taskData.status === 'error' || taskData.status === 'failed') {
              clearInterval(pollInterval);
              setQueue((prev) =>
                prev.map((t) =>
                  t.id === nextTask.id
                    ? { ...t, status: STATUS.ERROR, error: taskData.error || 'Erreur inconnue' }
                    : t
                )
              );
              processingRef.current = false;
            }
          } catch (err) {
            clearInterval(pollInterval);
            setQueue((prev) =>
              prev.map((t) =>
                t.id === nextTask.id
                  ? { ...t, status: STATUS.ERROR, error: err.message || 'Erreur de polling' }
                  : t
              )
            );
            processingRef.current = false;
          }
        }, 3000);
      })
      .catch((err) => {
        setQueue((prev) =>
          prev.map((t) =>
            t.id === nextTask.id
              ? { ...t, status: STATUS.ERROR, error: err.message || 'Erreur lors de la soumission' }
              : t
          )
        );
        processingRef.current = false;
      });
  }, [queue]);

  const queuedCount = queue.filter((t) => t.status === STATUS.QUEUED).length;
  const processingCount = queue.filter((t) => t.status === STATUS.PROCESSING).length;
  const importedCount = queue.filter((t) => t.status === STATUS.IMPORTED).length;
  const errorCount = queue.filter((t) => t.status === STATUS.ERROR).length;
  const canSubmit = url.trim() || imageBase64;

  return (
    <div className="space-y-5">
      {/* Input card */}
      <div className="bg-white rounded-xl border border-[#B8941E]/20 p-5 md:p-6">
        <h3 className="font-display text-xl text-[#1A1515] mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-[#B8941E]" />
          Import AI de produit
        </h3>
        <p className="text-sm text-[#5C5854] mb-5">
          Colle un lien ou upload une photo. L'IA analysera et importera automatiquement en brouillon. Tu peux en ajouter plusieurs à la suite.
        </p>

        <div className="space-y-4">
          {/* URL input */}
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

          {/* Drop zone */}
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
              onChange={handleImageUpload}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-40 rounded-lg object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-[#C8102E] text-white rounded-full hover:bg-[#A60D26] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={24} className="mx-auto text-[#B8941E] mb-2" />
                <p className="text-sm text-[#5C5854]">Glisse une image ici ou <span className="text-[#B8941E] font-medium">clique pour parcourir</span></p>
                <p className="text-xs text-[#8A857F] mt-1">PNG, JPG, WebP — peut être combiné avec un lien</p>
              </div>
            )}
          </div>

          {/* Queue button */}
          <button
            onClick={addToQueue}
            disabled={!canSubmit}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B8941E] to-[#8C6E15] text-white rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload size={18} />
            Ajouter à la file ({queuedCount + processingCount} en attente)
          </button>
        </div>
      </div>

      {/* Queue status */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#B8941E]/20 p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-lg text-[#1A1515]">
                File d'attente ({queue.length})
              </h4>
              <div className="flex gap-2 text-xs">
                {processingCount > 0 && (
                  <span className="flex items-center gap-1 text-[#B8941E]">
                    <Loader2 size={12} className="animate-spin" /> {processingCount} en cours
                  </span>
                )}
                {queuedCount > 0 && (
                  <span className="text-[#5C5854]">{queuedCount} en attente</span>
                )}
                {importedCount > 0 && (
                  <span className="text-[#1F6B23]">{importedCount} importés</span>
                )}
                {errorCount > 0 && (
                  <span className="text-[#C8102E]">{errorCount} erreurs</span>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {queue.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-lg border p-3 ${
                      task.status === STATUS.IMPORTED
                        ? 'border-[#1F6B23]/30 bg-[#1F6B23]/5'
                        : task.status === STATUS.ERROR
                        ? 'border-[#C8102E]/30 bg-[#C8102E]/5'
                        : task.status === STATUS.PROCESSING
                        ? 'border-[#B8941E]/30 bg-[#B8941E]/5'
                        : 'border-[#1A1515]/10 bg-[#F7F5F2]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {task.status === STATUS.QUEUED && (
                          <span className="text-[#5C5854] text-xs">⏳</span>
                        )}
                        {task.status === STATUS.PROCESSING && (
                          <Loader2 size={16} className="text-[#B8941E] animate-spin" />
                        )}
                        {task.status === STATUS.IMPORTED && (
                          <CheckCircle size={16} className="text-[#1F6B23]" />
                        )}
                        {task.status === STATUS.ERROR && (
                          <AlertCircle size={16} className="text-[#C8102E]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">
                          {task.status === STATUS.QUEUED && 'En file d\'attente'}
                          {task.status === STATUS.PROCESSING && 'Analyse en cours...'}
                          {task.status === STATUS.IMPORTED && (
                            <span className="text-[#1F6B23]">Importé — {task.result?.name || 'Produit'}</span>
                          )}
                          {task.status === STATUS.ERROR && (
                            <span className="text-[#C8102E]">{task.error}</span>
                          )}
                        </p>
                        {task.url && (
                          <p className="text-[10px] text-[#5C5854] truncate mt-0.5">
                            <Link2 size={8} className="inline mr-0.5" />{task.url}
                          </p>
                        )}
                        {task.imageBase64 && (
                          <p className="text-[10px] text-[#5C5854] mt-0.5">
                            <Upload size={8} className="inline mr-0.5" />Image uploadée
                          </p>
                        )}
                      </div>

                      {(task.status === STATUS.QUEUED || task.status === STATUS.ERROR || task.status === STATUS.IMPORTED) && (
                        <button
                          onClick={() => removeTask(task.id)}
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

            {/* Clear buttons */}
            <div className="flex gap-4 mt-3">
              {importedCount > 0 || errorCount > 0 ? (
                <button
                  onClick={() => setQueue((prev) => prev.filter((t) => t.status === STATUS.QUEUED || t.status === STATUS.PROCESSING))}
                  className="text-xs text-[#5C5854] hover:text-[#B8941E] transition-colors"
                >
                  Effacer les terminés
                </button>
              ) : null}
              {queue.length > 0 && (
                <button
                  onClick={() => setQueue([])}
                  className="text-xs text-[#C8102E] hover:text-[#A60D26] transition-colors"
                >
                  Tout effacer
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
