import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useSupabase } from "../lib/SupabaseProvider";

export function Shell({ children }: { children: ReactNode }) {
  const supabase = useSupabase();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a className="text-base font-semibold text-white hover:no-underline" href="/">XROIQ Whiteboard</a>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <a className="text-slate-300" href="/upload">Upload</a>
            <a className="text-slate-300" href="/review">Review</a>
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
    </main>
  );
}
