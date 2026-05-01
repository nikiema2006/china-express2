import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

function parseInitialValues(fields, data) {
  const values = {};
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

export default function CrudForm({ fields, data, onSubmit, onCancel, loading }) {
  const [values, setValues] = useState(() => parseInitialValues(fields, data));
  const [errors, setErrors] = useState({});

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
    fields.forEach((field) => {
      if (field.required) {
        const val = values[field.key];
        if (val === '' || val === null || val === undefined) {
          newErrors[field.key] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const processed = processSubmitValues(fields, values);
    onSubmit(processed);
  };

  const isEditing = !!data;

  return (
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1515]/10">
          <h3 className="font-display text-xl text-[#1A1515]">
            {isEditing ? 'Edit Record' : 'Add New Record'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-[#1A1515]/5 transition-colors text-[#5C5854]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.type === 'textarea' || field.type === 'json' || field.type === 'array' ? 'sm:col-span-2' : ''}
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
                    type={field.type === 'number' ? 'number' : field.type === 'json' ? 'text' : 'text'}
                    value={values[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.type === 'array' ? 'Enter one URL per line' : field.type === 'json' ? 'Enter valid JSON' : undefined}
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
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1A1515]/10 bg-[#F7F5F2]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-[#1A1515]/15 text-sm font-medium text-[#5C5854] hover:bg-[#1A1515]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B8941E] text-white text-sm font-semibold hover:bg-[#B8941E]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
