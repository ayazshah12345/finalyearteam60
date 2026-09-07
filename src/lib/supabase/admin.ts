import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jvwzftzqapcmbwuhxrdc.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3pmdHpxYXBjbWJ3dWh4cmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTcwNjgsImV4cCI6MjEwNDMzMzA2OH0.2Bzjl-NnKhgZUHB9mIgUVMafF2aUyr3RL4z-Blxzxbc';

  return createClient(supabaseUrl, supabaseAnonKey);
}
