import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link2, Sparkles, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { kimiService } from '@/services/kimi';

const STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  IMPORTED: 'imported',
  ERROR: 'error',
};

export default function AIProductImport() {
  const [url, setUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result;
      setImagePreview(res);
      setImageBase64(res);
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

  const handleClear = () => {
    setUrl('');
    setImagePreview(null);
    setImageBase64(null);
    setStatus(STATUS.IDLE);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!url.trim() && !imageBase64) return;
    setStatus(STATUS.PROCESSING);
    setResult(null);
    setError(null);

    try {
      const data = await kimiService.analyzeAndImport(url.trim(), imageBase64);
      setResult(data.product);
      setStatus(STATUS.IMPORTED);
    } catch (err) {
      setError(err.message || "Erreur inconnue");
      setStatus(STATUS.ERROR);
    }
  };

  return (
    <div className="space-y-5">
      {/* Input card */}
      <div className="bg-white rounded-xl border border-[#B8941E]/20 p-5 md:p-6">
        <h3 className="font-display text-xl text-[#1A1515] mb-1 flex items-center gap-2">
          <Sparkles size={20} className="text-[#B8941E]" />
          Import AI de produit
        </h3>
        <p className="text-sm text-[#5C5854] mb-5">
          Colle un lien Pinduoduo, Taobao, Alibaba, AliExpress, 1688 ou upload une photo. L'IA analysera et importera automatiquement en brouillon.
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

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!url.trim() && !imageBase64 || status === STATUS.PROCESSING}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B8941E] to-[#8C6E15] text-white rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === STATUS.PROCESSING ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyse et import en cours...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyser et importer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status card */}
      <AnimatePresence>
        {status === STATUS.IMPORTED && result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#1F6B23]/30 p-5 md:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-[#1F6B23]" />
              <h4 className="font-display text-lg text-[#1F6B23]">Produit importé en brouillon</h4>
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-medium text-[#1A1515]">{result.name}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#F7F5F2] rounded px-3 py-2">
                  <span className="text-[#5C5854] text-xs">Prix détail</span>
                  <p className="font-semibold">{result.retail_price?.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-[#F7F5F2] rounded px-3 py-2">
                  <span className="text-[#5C5854] text-xs">Prix gros</span>
                  <p className="font-semibold">{result.wholesale_price?.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-[#F7F5F2] rounded px-3 py-2">
                  <span className="text-[#5C5854] text-xs">Catégorie</span>
                  <p className="font-semibold capitalize">{result.category}</p>
                </div>
                <div className="bg-[#F7F5F2] rounded px-3 py-2">
                  <span className="text-[#5C5854] text-xs">Badge</span>
                  <p className="font-semibold">{result.badge || '—'}</p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="mt-2 text-xs text-[#B8941E] hover:text-[#8C6E15] transition-colors"
              >
                Importer un autre produit
              </button>
            </div>
          </motion.div>
        )}

        {status === STATUS.ERROR && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#C8102E]/30 p-5 md:p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} className="text-[#C8102E]" />
              <h4 className="font-display text-lg text-[#C8102E]">Erreur</h4>
            </div>
            <p className="text-sm text-[#5C5854]">{error}</p>
            <button
              onClick={handleClear}
              className="mt-3 text-xs text-[#B8941E] hover:text-[#8C6E15] transition-colors"
            >
              Réessayer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
