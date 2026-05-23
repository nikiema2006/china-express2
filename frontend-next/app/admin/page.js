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

export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('products');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth on mount
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

  // Listen for auth state changes (e.g. sign out from another tab)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = '/admin/login';
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Show loading while checking auth
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
