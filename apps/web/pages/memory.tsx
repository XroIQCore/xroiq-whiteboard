import { useEffect, useMemo, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import useSWR from "swr";
import { Shell } from "../components/Shell";
import { SearchPanel } from "../components/SearchPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

type MemoryEntry = {
  id: string;
  summary?: string;
  keywords: string[];
  confidence: number;
  sourceFile: {
    name: string;
    category?: string | null;
    subBucket?: string | null;
    needsAttention: boolean;
  };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type PrefsResponse = {
  prefs?: {
    librarySubBucketOrder?: string[];
  };
};

type SubBucketItem = {
  id: string;
  name: string;
  count: number;
};

function orderedSubBuckets(entries: MemoryEntry[], savedOrder: string[]) {
  const counts = new Map<string, number>();
  entries.forEach((entry) => {
    const name = entry.sourceFile.subBucket || "general";
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  const known = new Set(counts.keys());
  const saved = savedOrder.filter((name) => known.has(name));
  const missing = [...known].filter((name) => !saved.includes(name)).sort((a, b) => a.localeCompare(b));
  return [...saved, ...missing].map((name) => ({ id: name, name, count: counts.get(name) || 0 }));
}

export default function MemoryPage() {
  const { data } = useSWR<{ entries: MemoryEntry[] }>("/api/memory", fetcher);
  const { data: prefsData, mutate: mutatePrefs } = useSWR<PrefsResponse>("/api/user-prefs", fetcher);
  const entries = data?.entries || [];
  const savedOrder = prefsData?.prefs?.librarySubBucketOrder || [];
  const subBuckets = useMemo(() => orderedSubBuckets(entries, savedOrder), [entries, savedOrder]);
  const [ordered, setOrdered] = useState<SubBucketItem[]>([]);

  useEffect(() => {
    setOrdered(subBuckets);
  }, [subBuckets]);

  async function saveOrder(items: SubBucketItem[]) {
    setOrdered(items);
    const librarySubBucketOrder = items.map((item) => item.name);
    await fetch("/api/user-prefs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefs: { librarySubBucketOrder } }),
    });
    mutatePrefs({ prefs: { ...(prefsData?.prefs || {}), librarySubBucketOrder } }, false);
  }

  return (
    <Shell>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Memory</h1>
      </header>

      <SearchPanel label="Search library" />

      {ordered.length ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-slate-300">Library</h2>
          <ReactSortable
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
            list={ordered}
            setList={saveOrder}
            animation={150}
            handle=".subbucket-handle"
          >
            {ordered.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              >
                <span className="subbucket-handle cursor-grab text-slate-300 active:cursor-grabbing">{item.name}</span>
                <span className="text-xs text-slate-500">{item.count}</span>
              </div>
            ))}
          </ReactSortable>
        </section>
      ) : null}

      <section className="mt-6 space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <CardTitle>{entry.sourceFile.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">{entry.summary || "No summary yet."}</p>
              <p className="mt-3 text-xs text-slate-400">
                {[entry.sourceFile.category, entry.sourceFile.subBucket, ...entry.keywords].filter(Boolean).join(" / ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </Shell>
  );
}
