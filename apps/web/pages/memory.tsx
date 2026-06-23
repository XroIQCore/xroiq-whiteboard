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

export default function MemoryPage() {
  const { data } = useSWR<{ entries: MemoryEntry[] }>("/api/memory", fetcher);

  return (
    <Shell>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Memory</h1>
      </header>

      <SearchPanel label="Search library" />

      <section className="mt-6 space-y-3">
        {(data?.entries || []).map((entry) => (
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
