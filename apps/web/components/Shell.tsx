import { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useSupabase } from "../lib/SupabaseProvider";
import { subscribeToSurfacer } from "../lib/realtime";

export function Shell({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [staleCount, setStaleCount] = useState(0);

  useEffect(() => {
    return subscribeToSurfacer(supabase, () => {
      setStaleCount((count) => count + 1);
    });
  }, [supabase]);

  useEffect(() => {
    if (!staleCount) return;
    const timer = window.setTimeout(() => setStaleCount(0), 5000);
    return () => window.clearTimeout(timer);
  }, [staleCount]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a className="text-base font-semibold text-white hover:no-underline" href="/">XROIQ Whiteboard</a>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <a className="text-slate-300" href="/upload">Upload</a>
            <a className="text-slate-300" href="/review">Review</a>
            <a className="text-slate-300" href="/memory">Memory</a>
            <a className="text-slate-300" href="/priority">Priority</a>
            <a className="text-slate-300" href="/arcs">Arcs</a>
            <button
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
              onClick={() => supabase.auth.signOut()}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
      {staleCount ? (
        <div className="fixed bottom-5 right-5 rounded-md border border-amber-400/40 bg-slate-900 px-4 py-3 text-sm text-amber-100 shadow-lg">
          <span aria-hidden="true">{"\u23F0"}</span> {staleCount} items resurfaced
        </div>
      ) : null}
    </main>
  );
}
