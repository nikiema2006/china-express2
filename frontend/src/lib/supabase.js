import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmbeahjvdiglnxfpbzyu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYmVhaGp2ZGlnbG54ZnBienl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODEyNzYsImV4cCI6MjA5MzE1NzI3Nn0.cNl1c65JcUcaFj3E9n99K8Oz9w641IO6j5Iy6dUS2NQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
