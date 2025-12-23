
import { createClient } from '@supabase/supabase-js';

// No Netlify, configure estas chaves em: Site Settings > Environment variables
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://oeoncevgssprmnpwzqgp.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BLLq1d5qLcGSIUm3capNJA_wmEHU5-m';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
