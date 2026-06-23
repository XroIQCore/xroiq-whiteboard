import { useDeferredValue, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type SearchFile = {
  id: string;
  name: string;
  rawText?: string | null;
  summary?: string | null;
  category?: string | null;
  subBucket?: string | null;
  needsAttention: boolean;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function snippet(file: SearchFile) {
  return (file.summary || file.rawText || "").replace(/\s+/g, " ").slice(0, 220);
}

export function SearchPanel({ label = "Search" }: { label?: string }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(0);
  const [open, setOpen] = useState<SearchFile | null>(null);
  const deferredQuery = useDeferredValue(query.trim());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data } = useSWR<{ files: SearchFile[] }>(
    deferredQuery ? `/api/search?q=${encodeURIComponent(deferredQuery)}` : null,
    fetcher,
  );
  const files = data?.files || [];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTextInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (isTextInput || !files.length) return;
      if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        setFocused((index) => Math.min(index + 1, files.length - 1));
      }
      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        setFocused((index) => Math.max(index - 1, 0));
      }
      if (event.code === "Space") {
        event.preventDefault();
        setOpen((current) => (current?.id === files[focused]?.id ? null : files[focused]));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [files, focused]);

  useEffect(() => {
    setFocused(0);
  }, [deferredQuery]);

  return (
    <section className="mb-8">
      <Input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`${label}...`}
      />

      {files.length ? (
        <div className="mt-4 space-y-3">
          {files.map((file, index) => (
            <Card
              key={file.id}
              className={index === focused ? "border-white/60" : undefined}
              tabIndex={0}
              onFocus={() => setFocused(index)}
              onClick={() => setOpen((current) => (current?.id === file.id ? null : file))}
            >
              <CardHeader>
                <CardTitle>{file.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{snippet(file) || "No searchable text yet."}</p>
                <p className="mt-3 text-xs text-slate-400">
                  {[file.category, file.subBucket, file.needsAttention ? "needs attention" : ""].filter(Boolean).join(" / ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {open ? (
        <aside className="fixed inset-y-0 right-0 z-20 w-full max-w-md border-l border-slate-800 bg-slate-950 p-6 shadow-xl">
          <button className="mb-5 text-sm text-slate-300" type="button" onClick={() => setOpen(null)}>
            Close
          </button>
          <h2 className="text-xl font-semibold">{open.name}</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">{snippet(open) || "No details yet."}</p>
        </aside>
      ) : null}
    </section>
  );
}
