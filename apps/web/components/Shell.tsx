import { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
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
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </main>
  );
}
