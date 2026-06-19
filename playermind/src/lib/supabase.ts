import { createClient } from "@supabase/supabase-js";

// PLAYERMIND – חיבור ל-Supabase
// ערכים נטענים ממשתני סביבה (ראה .env.example)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // אזהרה ידידותית למפתח – האפליקציה עדיין תיטען ותציג מסך הגדרה.
  console.warn(
    "[PLAYERMIND] חסרים VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ראה README והקובץ .env.example",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
