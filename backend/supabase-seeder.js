const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL and SUPABASE_ANON_KEY environment variables. Create a .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
