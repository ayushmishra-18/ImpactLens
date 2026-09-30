import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));

// Client for browser / public actions
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey)
  : null;

// Admin client for backend jobs / bypass RLS
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;
