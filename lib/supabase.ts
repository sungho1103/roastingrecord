import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (typeof window !== "undefined") {
  console.log("Supabase URL:", supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "NOT SET")
  console.log("Supabase Key:", supabaseAnonKey ? "SET" : "NOT SET")
}

export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("placeholder") &&
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : (null as any)
