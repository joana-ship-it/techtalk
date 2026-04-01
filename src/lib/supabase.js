import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bgnyiyxwmqzzyupqmtpb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yiceB0RgdoUlgUbPR3o0Mw_isfvn_yI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
