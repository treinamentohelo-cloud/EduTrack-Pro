
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oeoncevgssprmnpwzqgp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BLLq1d5qLcGSIUm3capNJA_wmEHU5-m';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
