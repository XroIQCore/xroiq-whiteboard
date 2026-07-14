import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Shell } from "../components/Shell";
import { SearchPanel } from "../components/SearchPanel";
import type { WhiteboardCounts } from "../lib/whiteboardCounts";

const cards: Array<{ key: keyof WhiteboardCounts; label: string }> = [
  { key: "filesNew", label: "Files New" },
  { key: "topPriorityMoments", label: "Top Priority Moments" },
  { key: "reviewQueue", label: "Review Queue" },
  { key: "duplicateGroups", label: "Duplicates" },
  { key: "memoryEntries", label: "Memory Entries" },
  { key: "needsAttention", label: "Needs Attention" },
];

export default function Home() {
  const [data, setData] = useState<WhiteboardCounts | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const res = await fetch("/api/summary");
        if (!res.ok) throw new Error("Summary unavailable");
        const nextData = (await res.json()) as WhiteboardCounts;
        if (active) {
          setData(nextData);
          setError(false);
        }
      } catch {
        if (active) setError(true);
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Shell>
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">XROIQ Whiteboard</h1>
          <p className="mt-2 text-sm text-slate-400">Local-first file intelligence pipeline.</p>
        </div>
      </header>

      {error ? <p className="mb-4 text-sm text-rose-300">Summary unavailable.</p> : null}

      <SearchPanel label="Search board" />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardTitle>{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">{data ? data[card.key] : "..."}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </Shell>
  );
}
