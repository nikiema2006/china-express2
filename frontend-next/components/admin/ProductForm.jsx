"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, Loader2, Upload, Sparkles, Copy, Check, Eye, EyeOff,
  Image as ImageIcon, Link2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STORAGE_BUCKET = 'product-images';

function parseInitialValues(fields, data) {
  const values = {};
  if (!fields || !Array.isArray(fields)) return values;
  fields.forEach((field) => {
    const raw = data ? data[field.key] : undefined;
    if (field.type === 'array') {
      values[field.key] = Array.isArray(raw) ? raw.join('\n') : '';
    } else if (field.type === 'json') {
      values[field.key] = raw ? (typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)) : '';
    } else if (field.type === 'boolean') {
      values[field.key] = raw ?? false;
    } else {
      values[field.key] = raw ?? '';
    }
  });
  return values;
}

function processSubmitValues(fields, values) {
  const processed = {};
  if (!fields || !Array.isArray(fields)) return processed;
  fields.forEach((field) => {
    const val = values[field.key];
    if (field.type === 'array') {
      processed[field.key] = val
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);
    } else if (field.type === 'json') {
      try {
        processed[field.key] = val ? JSON.parse(val) : null;
      } catch {
        processed[field.key] = val;
      }
    } else if (field.type === 'number') {
      processed[field.key] = val !== '' ? Number(val) : null;
    } else {
      processed[field.key] = val;
    }
  });
  return processed;
}

function ImageDropZone({ images, onImagesChange }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const addFiles = useCallback((files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      base64: null,
      url: null,
      uploading: false,
      uploadedUrl: null,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      selectedForAI: true,
      selectedForUpload: true,
    }));

    const toProcess = [...images, ...newImages];
    onImagesChange(toProcess);

    newImages.forEach((img) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImagesChange((prev) => {
          const updated = [...prev];
          const fullIdx = updated.findIndex((item) => item.id === img.id);
          if (fullIdx !== -1) {
            updated[fullIdx].base64 = e.target?.result;
          }
          return updated;
        });
      };
      reader.readAsDataURL(img.file);
    });
  }, [images, onImagesChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) addFiles(files);
  }, [addFiles]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files?.length > 0) addFiles(files);
    e.target.value = '';
  }, [addFiles]);

  const removeImage = useCallback((id) => {
    onImagesChange((prev) => {
      const img = prev.find((item) => item.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((item) => item.id !== id);
    });
  }, [onImagesChange]);

  const toggleAI = useCallback((id) => {
    onImagesChange((prev) => prev.map((item) =>
      item.id === id ? { ...item, selectedForAI: !item.selectedForAI } : item
    ));
  }, [onImagesChange]);

  const toggleUpload = useCallback((id) => {
    onImagesChange((prev) => prev.map((item) =>
      item.id === id ? { ...item, selectedForUpload: !item.selectedForUpload } : item
    ));
  }, [onImagesChange]);

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-[#B8941E] bg-[#B8941E]/5'
            : 'border-[#B8941E]/30 hover:border-[#B8941E]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload size={24} className="mx-auto text-[#B8941E] mb-2" />
        <p className="text-sm text-[#5C5854]">
          Glisse des images ici ou <span className="text-[#B8941E] font-medium">clique pour parcourir</span>
        </p>
        <p className="text-xs text-[#8A857F] mt-1">PNG, JPG, WebP — plusieurs fichiers acceptés</p>
      </div>

      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#1A1515]">{images.length} image(s)</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[#5C5854] flex items-center gap-1">
                <Sparkles size={10} className="text-[#B8941E]" /> Pour IA: {images.filter((i) => i.selectedForAI).length}
              </span>
              <span className="text-[10px] text-[#5C5854] flex items-center gap-1">
                <Upload size={10} className="text-[#1F6B23]" /> Pour upload: {images.filter((i) => i.selectedForUpload).length}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[#1A1515]/10 bg-[#F7F5F2]">
                <img src={img.preview || img.uploadedUrl} alt="" className="w-full h-20 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-1 right-1 p-0.5 bg-[#C8102E] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={10} />
                </button>
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-white" />
                  </div>
                )}
                {img.uploadedUrl && !img.file && (
                  <div className="absolute bottom-1 right-1">
                    <Check size={10} className="text-[#1F6B23]" />
                  </div>
                )}
                <div className="absolute top-1 left-1 text-[8px] bg-white/80 rounded px-1 font-medium text-[#1A1515]">
                  {idx + 1}
                </div>
                <div className="absolute bottom-1 left-1 flex gap-1 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAI(img.id); }}
                    className={`p-1 rounded-full transition-colors ${
                      img.selectedForAI ? 'bg-[#B8941E] text-white' : 'bg-black/40 text-white/60'
                    }`}
                    title={img.selectedForAI ? 'Envoyer à l\'IA' : 'Ne pas envoyer à l\'IA'}
                  >
                    {img.selectedForAI ? <Sparkles size={10} /> : <EyeOff size={10} />}
                  </button>
                  {img.file && !img.uploadedUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleUpload(img.id); }}
                      className={`p-1 rounded-full transition-colors ${
                        img.selectedForUpload ? 'bg-[#1F6B23] text-white' : 'bg-black/40 text-white/60'
                      }`}
                      title={img.selectedForUpload ? 'Uploader vers Supabase' : 'Ne pas uploader'}
                    >
                      {img.selectedForUpload ? <Upload size={10} /> : <EyeOff size={10} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyToast({ show }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 bg-[#1F6B23] text-white rounded-lg shadow-lg text-sm font-medium"
    >
      <Check size={14} /> Informations copiées !
    </motion.div>
  );
}

export default function ProductForm({ fields, data, onSubmit, onCancel, loading, onAnalyzeWithAI }) {
  const [values, setValues] = useState(() => parseInitialValues(fields, data));
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [imageUrlText, setImageUrlText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const isEditing = !!data;

  useEffect(() => {
    if (data && data.images && Array.isArray(data.images)) {
      setImages(data.images.map((url) => ({
        id: `existing-${url.substring(0, 12)}`,
        preview: url,
        base64: null,
        url: null,
        uploading: false,
        uploadedUrl: url,
        selectedForAI: true,
        selectedForUpload: true,
      })));
    }
  }, [data]);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!fields) return true;
    fields.forEach((field) => {
      if (field.required) {
        const val = values[field.key];
        if (val === '' || val === null || val === undefined) {
          newErrors[field.key] = `${field.label} est requis`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let finalImages = images
      .filter((img) => img.uploadedUrl && img.selectedForUpload)
      .map((img) => img.uploadedUrl);

    if (imageUrlText.trim()) {
      const urlList = imageUrlText
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);
      finalImages = [...finalImages, ...urlList];
    }

    if (finalImages.length === 0) {
      setErrors({ images: 'Au moins une image est requise' });
      return;
    }

    const processed = processSubmitValues(fields, values);
    processed.images = finalImages;

    onSubmit(processed);
  };

  const uploadAllImages = async () => {
    const pending = images.filter((img) => img.file && !img.uploadedUrl && img.selectedForUpload);
    if (pending.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const img of pending) {
      const ext = img.file.name.split('.').pop() || 'jpg';
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      setImages((prev) => prev.map((item) => item.id === img.id ? { ...item, uploading: true } : item));

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, img.file, { contentType: img.file.type });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        setImages((prev) => prev.map((item) => item.id === img.id ? { ...item, uploading: false } : item));
        continue;
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

      uploadedUrls.push({ id: img.id, url: urlData.publicUrl });
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) =>
        prev.map((item) => {
          const found = uploadedUrls.find((u) => u.id === item.id);
          if (found) {
            return { ...item, uploading: false, uploadedUrl: found.url };
          }
          return item;
        })
      );
    }

    setUploading(false);
  };

  const analyzeWithAI = async () => {
    const selectedImages = images.filter((img) => img.selectedForAI && img.base64);
    const imageBase64s = selectedImages.map((img) => img.base64);

    if (imageBase64s.length === 0) {
      alert('Aucune image sélectionnée pour l\'analyse');
      return;
    }

    setAnalyzing(true);
    try {
      if (onAnalyzeWithAI) {
        const productData = await onAnalyzeWithAI(imageBase64s);

        const newValues = { ...values };
        if (productData.name) newValues.name = productData.name;
        if (productData.slug) newValues.slug = productData.slug;
        if (productData.category) newValues.category = productData.category;
        if (productData.description) newValues.description = productData.description;
        if (productData.badge) newValues.badge = productData.badge;
        if (productData.badge_color) newValues.badge_color = productData.badge_color;
        if (productData.retail_price) newValues.retail_price = productData.retail_price;
        if (productData.wholesale_price) newValues.wholesale_price = productData.wholesale_price;
        if (productData.min_retail) newValues.min_retail = productData.min_retail;
        if (productData.min_wholesale) newValues.min_wholesale = productData.min_wholesale;
        if (productData.suggested_sell_price) newValues.suggested_sell_price = productData.suggested_sell_price;
        if (productData.weight_kg) newValues.weight_kg = productData.weight_kg;
        if (productData.dimensions) newValues.dimensions = productData.dimensions;
        if (productData.rating) newValues.rating = productData.rating;
        if (productData.reviews !== undefined) newValues.reviews = productData.reviews;
        if (productData.url) newValues.product_url = productData.url;

        setValues(newValues);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
      alert(`Erreur lors de l'analyse IA: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const copyProductInfo = () => {
    const text = [
      `📦 Nom: ${values.name || 'N/A'}`,
      `🔗 Slug: ${values.slug || 'N/A'}`,
      ` Catégorie: ${values.category || 'N/A'}`,
      `📝 Description: ${values.description || 'N/A'}`,
      `💰 Prix détail: ${values.retail_price || 'N/A'} FCFA`,
      `💰 Prix gros: ${values.wholesale_price || 'N/A'} FCFA`,
      `💡 Prix de revente conseillé: ${values.suggested_sell_price || 'N/A'} FCFA`,
      `⭐ Rating: ${values.rating || 'N/A'}/5 (${values.reviews || 0} avis)`,
      `📸 Images: ${images.length} image(s)`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasPendingUploads = images.some((img) => img.file && !img.uploadedUrl && img.selectedForUpload);
  const hasSelectedForAI = images.some((img) => img.selectedForAI && img.base64);
  const imageFields = ['images'];
  const otherFields = (fields || []).filter((f) => !imageFields.includes(f.key));

  if (!fields || !Array.isArray(fields)) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1515]/10">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl text-[#1A1515]">
                {isEditing ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
              </h3>
              {!isEditing && onAnalyzeWithAI && (
                <button
                  type="button"
                  onClick={analyzeWithAI}
                  disabled={analyzing || !hasSelectedForAI}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B8941E]/10 text-[#B8941E] text-xs font-semibold hover:bg-[#B8941E]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Analyser avec l'IA"
                >
                  {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  IA
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-[#1A1515]/5 transition-colors text-[#5C5854]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-[#1A1515] mb-3 flex items-center gap-2">
                  <ImageIcon size={14} className="text-[#B8941E]" />
                  Images du produit
                </h4>
                <ImageDropZone images={images} onImagesChange={setImages} />

                {hasPendingUploads && (
                  <button
                    type="button"
                    onClick={uploadAllImages}
                    disabled={uploading}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1515] text-white text-xs font-semibold hover:bg-[#1A1515]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading && <Loader2 size={12} className="animate-spin" />}
                    {uploading ? 'Upload en cours...' : 'Uploader les images vers Supabase'}
                  </button>
                )}

                <div className="mt-4">
                  <label className="block text-xs font-medium text-[#1A1515] mb-1.5 flex items-center gap-1">
                    <Link2 size={10} />
                    Ou coller des URLs d'images (une par ligne)
                  </label>
                  <textarea
                    value={imageUrlText}
                    onChange={(e) => setImageUrlText(e.target.value)}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border text-xs bg-[#F7F5F2] focus:outline-none focus:ring-2 focus:ring-[#B8941E]/40 transition-all resize-none border-[#1A1515]/10"
                  />
                </div>

                {errors.images && (
                  <p className="text-xs text-[#C8102E] mt-1">{errors.images}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherFields.map((field) => (
                  <div
                    key={field.key}
                    className={field.type === 'textarea' || field.type === 'json' ? 'sm:col-span-2' : ''}
                  >
                    <label className="block text-sm font-medium text-[#1A1515] mb-1.5">
                      {field.label}
                      {field.required && <span className="text-[#C8102E] ml-1">*</span>}
                    </label>

                    {field.type === 'textarea' && (
                      <textarea
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        rows={4}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-[#F7F5F2] focus:outline-none focus:ring-2 focus:ring-[#B8941E]/40 transition-all resize-none ${
                          errors[field.key] ? 'border-[#C8102E]' : 'border-[#1A1515]/10'
                        }`}
                      />
                    )}

                    {field.type === 'boolean' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleChange(field.key, !values[field.key])}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            values[field.key] ? 'bg-[#B8941E]' : 'bg-[#1A1515]/20'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              values[field.key] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-[#5C5854]">{values[field.key] ? 'Yes' : 'No'}</span>
                      </div>
                    )}

                    {(field.type === 'text' || field.type === 'number' || field.type === 'array' || field.type === 'json') && (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-[#F7F5F2] focus:outline-none focus:ring-2 focus:ring-[#B8941E]/40 transition-all ${
                          errors[field.key] ? 'border-[#C8102E]' : 'border-[#1A1515]/10'
                        }`}
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        value={values[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-[#F7F5F2] focus:outline-none focus:ring-2 focus:ring-[#B8941E]/40 transition-all ${
                          errors[field.key] ? 'border-[#C8102E]' : 'border-[#1A1515]/10'
                        }`}
                      >
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}

                    {errors[field.key] && (
                      <p className="text-xs text-[#C8102E] mt-1">{errors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1A1515]/10 bg-[#F7F5F2]">
            <button
              type="button"
              onClick={copyProductInfo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1A1515]/15 text-sm font-medium text-[#5C5854] hover:bg-[#1A1515]/5 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier les infos'}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg border border-[#1A1515]/15 text-sm font-medium text-[#5C5854] hover:bg-[#1A1515]/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B8941E] text-white text-sm font-semibold hover:bg-[#B8941E]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <CopyToast show={copied} />
    </>
  );
}
