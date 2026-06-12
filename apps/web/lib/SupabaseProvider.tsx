import { createContext, ReactNode, useContext, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabaseClient";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createClient());
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const client = useContext(SupabaseContext);
  if (!client) throw new Error("SupabaseProvider is missing");
  return client;
}
