"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Ship, MapPin, HelpCircle, ListOrdered, Loader2,
  Search, ArrowLeft, Sparkles, Check, EyeOff, LogOut,
} from 'lucide-react';
import { adminService } from '@/services/admin';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import CrudTable from '@/components/admin/CrudTable';
import ProductForm from '@/components/admin/ProductForm';
import AIProductImport from '@/components/admin/AIProductImport';

const LOGO = "https://customer-assets.emergentagent.com/job_china-africa-trade-1/artifacts/gm0lbsx0_logochinaexpress-removebg-preview.png";

const SECTIONS = {
  products: {
    label: 'Products',
    icon: Package,
    service: adminService.products,
    orderBy: 'created_at',
    searchFields: ['name', 'slug', 'category', 'description'],
    tableColumns: [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'retail_price', label: 'Retail Price' },
      { key: 'wholesale_price', label: 'Wholesale Price' },
      { key: 'rating', label: 'Rating' },
      { key: 'trending', label: 'Trending' },
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'badge_color', label: 'Badge Color', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'retail_price', label: 'Retail Price', type: 'number' },
      { key: 'wholesale_price', label: 'Wholesale Price', type: 'number' },
      { key: 'min_retail', label: 'Min Retail', type: 'number' },
      { key: 'min_wholesale', label: 'Min Wholesale', type: 'number' },
      { key: 'suggested_sell_price', label: 'Suggested Sell Price', type: 'number' },
      { key: 'weight_kg', label: 'Weight (kg)', type: 'number' },
      { key: 'dimensions', label: 'Dimensions', type: 'text' },
      { key: 'volume_per_lot', label: 'Volume per Lot (CBM)', type: 'number' },
      { key: 'lot_size', label: 'Lot Size (units)', type: 'number' },
      { key: 'shipping_note', label: 'Shipping Note', type: 'textarea' },
      { key: 'shipping_category', label: 'Shipping Category', type: 'select', options: [{ value: 'MCO', label: 'MCO — Ordinaire (10 000 FCFA/kg)' }, { value: 'MCF', label: 'MCF — Dangereux (12 000 FCFA/kg)' }, { value: 'MCI', label: 'MCI — Alimentaire (12 000 FCFA/kg)' }] },
      { key: 'video_links', label: 'Video Links (comma-separated)', type: 'textarea' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'reviews', label: 'Reviews', type: 'number' },
      { key: 'trending', label: 'Trending', type: 'boolean' },
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }] },
      { key: 'product_url', label: 'Product Source URL', type: 'text' },
    ],
  },
  shipping: {
    label: 'Shipping',
    icon: Ship,
    service: adminService.shipping,
    orderBy: 'id',
    searchFields: ['id', 'label', 'description', 'estimated_days'],
    tableColumns: [
      { key: 'label', label: 'Label' },
      { key: 'price_per_kg', label: 'Price/kg' },
      { key: 'price_per_cbm', label: 'Price/CBM' },
      { key: 'estimated_days', label: 'Est. Days' },
      { key: 'color', label: 'Color' },
      { key: 'description', label: 'Description' },
    ],
    formFields: [
      { key: 'id', label: 'ID', type: 'text', required: true },
      { key: 'label', label: 'Label', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'price_per_kg', label: 'Price per KG', type: 'number', required: true },
      { key: 'price_per_cbm', label: 'Price per CBM', type: 'number' },
      { key: 'estimated_days', label: 'Estimated Days', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'color', label: 'Color', type: 'text' },
    ],
  },
  trackings: {
    label: 'Trackings',
    icon: MapPin,
    service: adminService.trackings,
    orderBy: 'created_at',
    searchFields: ['code', 'product', 'origin', 'destination', 'transport'],
    tableColumns: [
      { key: 'code', label: 'Code' },
      { key: 'product', label: 'Product' },
      { key: 'origin', label: 'Origin' },
      { key: 'destination', label: 'Destination' },
      { key: 'current_step', label: 'Step' },
      { key: 'transport', label: 'Transport' },
    ],
    formFields: [
      { key: 'code', label: 'Code', type: 'text', required: true },
      { key: 'product', label: 'Product', type: 'text', required: true },
      { key: 'weight', label: 'Weight', type: 'text' },
      { key: 'transport', label: 'Transport', type: 'text' },
      { key: 'origin', label: 'Origin', type: 'text' },
      { key: 'destination', label: 'Destination', type: 'text' },
      { key: 'estimated_delivery', label: 'Estimated Delivery', type: 'text' },
      { key: 'current_step', label: 'Current Step', type: 'number' },
      { key: 'history', label: 'History (JSON)', type: 'json' },
    ],
  },
  faqs: {
    label: 'FAQs',
    icon: HelpCircle,
    service: adminService.faqs,
    orderBy: 'order_index',
    searchFields: ['question', 'answer'],
    tableColumns: [
      { key: 'question', label: 'Question' },
      { key: 'answer', label: 'Answer' },
      { key: 'order_index', label: 'Order' },
    ],
    formFields: [
      { key: 'question', label: 'Question', type: 'text', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      { key: 'order_index', label: 'Order Index', type: 'number' },
    ],
  },
  howItWorks: {
    label: 'How It Works',
    icon: ListOrdered,
    service: adminService.howItWorks,
    orderBy: 'step',
    searchFields: ['title', 'description'],
    tableColumns: [
      { key: 'step', label: 'Step' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'icon', label: 'Icon' },
    ],
    formFields: [
      { key: 'step', label: 'Step', type: 'number', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon', type: 'text' },
    ],
  },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export default function AdminDashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/admin/login';
      } else {
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = '/admin/login';
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2]">
        <Loader2 size={32} className="animate-spin text-[#B8941E]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('products');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const section = SECTIONS[activeSection];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSearchQuery('');
    setStatusFilter('all');
    try {
      const result = await section.service.getAll(section.orderBy);
      setData(result || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    let result = data;

    if (activeSection === 'products' && statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fields = section.searchFields;
      result = result.filter((record) =>
        fields.some((key) => {
          const val = record[key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        })
      );
    }

    return result;
  }, [data, searchQuery, statusFilter, activeSection, section.searchFields]);

  const handleAdd = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await section.service.delete(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async (id) => {
    try {
      await adminService.products.publish(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await adminService.products.unpublish(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      if (editingRecord) {
        await section.service.update(editingRecord.id, formData);
      } else {
        const payload = { ...formData, status: formData.status || 'draft' };
        await section.service.create(payload);
      }
      setFormOpen(false);
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatCellValue = (value, key) => {
    if (key === 'status') return value;
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return `${value.length} item(s)`;
    if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
    return String(value);
  };

  const renderStatusBadge = (status) => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1F6B23]/10 text-[#1F6B23]">
          <Check size={10} /> Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#B8941E]/10 text-[#B8941E]">
        <EyeOff size={10} /> Draft
      </span>
    );
  };

  const handleCopyProduct = (record) => {
    const text = [
      `📦 Nom: ${record.name || 'N/A'}`,
      `🔗 Slug: ${record.slug || 'N/A'}`,
      `📁 Catégorie: ${record.category || 'N/A'}`,
      `📝 Description: ${record.description || 'N/A'}`,
      `💰 Prix détail: ${record.retail_price || 'N/A'} FCFA`,
      `💰 Prix gros: ${record.wholesale_price || 'N/A'} FCFA`,
      `💡 Prix de revente conseillé: ${record.suggested_sell_price || 'N/A'} FCFA`,
      `⭐ Rating: ${record.rating || 'N/A'}/5 (${record.reviews || 0} avis)`,
      `📸 Images: ${Array.isArray(record.images) ? record.images.length : 0} image(s)`,
      `📊 Statut: ${record.status || 'N/A'}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
  };

  const handleAnalyzeWithAI = async (imageBase64s) => {
    const resp = await fetch('/api/ai-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64s }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error);

    return new Promise((resolve, reject) => {
      const unsubscribe = supabase
        .channel(`ai-job-${data.jobId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'ai_jobs', filter: `id=eq.${data.jobId}` },
          (payload) => {
            const updated = payload.new;
            if (updated.status === 'completed') {
              unsubscribe.unsubscribe();
              resolve(updated.result?.product || updated.result);
            } else if (updated.status === 'error') {
              unsubscribe.unsubscribe();
              reject(new Error(updated.error || 'Erreur inconnue'));
            }
          }
        )
        .subscribe();

      fetch('/api/ai-jobs/process', { method: 'POST' });
    });
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#B8941E]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg text-[#5C5854] hover:text-[#B8941E] hover:bg-[#B8941E]/10 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <img src={LOGO} alt="Admin" className="h-10 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg md:text-xl text-[#1A1515] tracking-tight">
                Admin <span className="text-[#B8941E] font-semibold">Dashboard</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#5C5854]">
                China Express
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#1A1515]/10 text-[#5C5854] hover:border-[#B8941E]/40 hover:text-[#B8941E] transition-all text-sm"
          >
            View Site
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#C8102E]/20 text-[#5C5854] hover:border-[#C8102E]/40 hover:text-[#C8102E] transition-all text-sm"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <aside className="hidden md:flex w-64 bg-white border-r border-[#B8941E]/20 flex-col fixed h-full top-16 md:top-20">
        <nav className="flex-1 p-4 space-y-1">
          {Object.entries(SECTIONS).map(([key, { label, icon: Icon }]) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#B8941E]/10 text-[#B8941E] border border-[#B8941E]/30'
                    : 'text-[#5C5854] hover:bg-[#1A1515]/5 hover:text-[#1A1515]'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="md:hidden sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-[#1A1515]/8">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1.5">
          {Object.entries(SECTIONS).map(([key, { label, icon: Icon }]) => {
            const active = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-br from-[#C8102E] to-[#A60D26] text-white'
                    : 'text-[#5C5854] hover:text-[#1A1515] bg-[#1A1515]/3'
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2.2 : 1.7} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="md:ml-64 p-4 md:p-8">
        {activeSection === 'products' && (
          <div className="mb-8">
            <AIProductImport />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-[#1A1515]">{section.label}</h2>
            <p className="text-sm text-[#5C5854] mt-1">
              {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>

        {activeSection === 'products' && (
          <div className="flex gap-2 mb-4">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? 'bg-[#B8941E] text-white'
                    : 'bg-white border border-[#1A1515]/8 text-[#5C5854] hover:border-[#B8941E]/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5854]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${section.label.toLowerCase()}...`}
              className="w-full bg-white border border-[#B8941E]/20 rounded-lg pl-11 pr-4 py-3 text-sm text-[#1A1515] placeholder:text-[#8A857F] focus:border-[#B8941E] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A857F] hover:text-[#1A1515] transition-colors"
              >
                <Search size={14} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#B8941E]" />
          </div>
        ) : (
          <CrudTable
            columns={section.tableColumns}
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
            formatCellValue={formatCellValue}
            renderCell={(value, key, record) => {
              if (key === 'status') return renderStatusBadge(value);
              if (key === 'trending') return value ? '⭐' : '—';
              return null;
            }}
            onCopy={activeSection === 'products' ? handleCopyProduct : undefined}
            extraActions={activeSection === 'products' ? (record) => (
              <button
                onClick={() => (record.status === 'published' ? handleUnpublish(record.id) : handlePublish(record.id))}
                className={`p-2 rounded-md transition-colors ${
                  record.status === 'published'
                    ? 'text-[#B8941E] hover:bg-[#B8941E]/10'
                    : 'text-[#1F6B23] hover:bg-[#1F6B23]/10'
                }`}
                title={record.status === 'published' ? 'Unpublish' : 'Publish'}
              >
                {record.status === 'published' ? <EyeOff size={16} /> : <Check size={16} />}
              </button>
            ) : undefined}
          />
        )}
      </main>

      <AnimatePresence>
        {formOpen && (
          <ProductForm
            fields={section.formFields}
            data={editingRecord}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditingRecord(null);
            }}
            loading={submitLoading}
            onAnalyzeWithAI={activeSection === 'products' ? handleAnalyzeWithAI : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
