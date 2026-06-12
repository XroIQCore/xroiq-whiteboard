import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createPagesBrowserClient({
    supabaseUrl: url,
    supabaseKey: anonKey,
  });
}
