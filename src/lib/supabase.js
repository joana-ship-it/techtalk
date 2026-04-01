import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bgnyiyxwmqzzyupqmtpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbnlpeXh3bXF6enl1cHFtdHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzQzMTgsImV4cCI6MjA5MDY1MDMxOH0.DMGqOiwOrtZlhrOtn-r5AAj5Kd0OxYU_qdmAR0HHN4w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
