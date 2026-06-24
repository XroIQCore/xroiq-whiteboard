import { useEffect, useState } from "react";
import useSWR from "swr";
import { Shell } from "../components/Shell";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const buckets = ["immediate", "soon", "backlog", "archived"] as const;
type Bucket = (typeof buckets)[number];

type PriorityItem = {
  id: string;
  momentId: string;
  rank: number;
  bucket: Bucket;
  reason: string;
  updatedAt: string;
  moment: {
    title?: string;
    need?: string;
    confidence: number;
    updatedAt: string;
  };
};

type PriorityResponse = {
  buckets: Record<Bucket, PriorityItem[]>;
};

type UndoMove = {
  momentId: string;
  bucket: Bucket;
  rank: number;
  title: string;
  expiresAt: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PriorityPage() {
  const { data, mutate } = useSWR<PriorityResponse>("/api/priority", fetcher);
  const [active, setActive] = useState<Bucket>("immediate");
  const [dragged, setDragged] = useState<string | null>(null);
  const [undoMove, setUndoMove] = useState<UndoMove | null>(null);

  async function move(momentId: string, bucket: Bucket, rank?: number) {
    const previous = buckets.flatMap((name) => data?.buckets?.[name] || []).find((item) => item.momentId === momentId);
    await fetch(`/api/priority/${momentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket, rank }),
    });
    mutate();
    if (bucket === "archived" && previous?.bucket !== "archived") {
      setUndoMove({
        momentId,
        bucket: previous?.bucket || active,
        rank: previous?.rank || 1,
        title: previous?.moment.title || "Untitled moment",
        expiresAt: Date.now() + 10000,
      });
    }
  }

  async function undoTrash() {
    if (!undoMove || undoMove.expiresAt <= Date.now()) return;
    const moveToRestore = undoMove;
    setUndoMove(null);
    await move(moveToRestore.momentId, moveToRestore.bucket, moveToRestore.rank);
  }

  useEffect(() => {
    if (!undoMove) return;
    const timer = window.setTimeout(() => setUndoMove(null), Math.max(0, undoMove.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [undoMove]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTextInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (isTextInput || event.key.toLowerCase() !== "z") return;
      if (!undoMove || undoMove.expiresAt <= Date.now()) return;
      event.preventDefault();
      undoTrash();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoMove]);

  async function exportBucket(format: "json" | "csv") {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "moments", format, bucket: active }),
    });
    const json = await res.json();
    if (json.signedUrl) window.open(json.signedUrl, "_blank");
  }

  const items = data?.buckets?.[active] || [];

  return (
    <Shell>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Priority Board</h1>
          <p className="mt-2 text-sm text-slate-400">Approved moments ranked by urgency and impact.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportBucket("csv")}>Export CSV</Button>
          <Button variant="outline" onClick={() => exportBucket("json")}>Export JSON</Button>
        </div>
      </header>

      <Tabs>
        <TabsList>
          {buckets.map((bucket) => (
            <TabsTrigger key={bucket} active={bucket === active} onClick={() => setActive(bucket)}>
              {(bucket === "archived" ? "Trash" : bucket[0].toUpperCase() + bucket.slice(1))} ({data?.buckets?.[bucket]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent>
          {items.map((item, index) => (
            <Card
              draggable
              key={item.id}
              onDragStart={() => setDragged(item.momentId)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dragged && move(dragged, active, index + 1)}
            >
              <CardHeader>
                <CardTitle>{item.rank}. {item.moment.title || "Untitled moment"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.moment.need || item.reason}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Confidence {Math.round(item.moment.confidence * 100)}%</span>
                  <span>Updated {new Date(item.updatedAt).toLocaleString()}</span>
                  {buckets.filter((bucket) => bucket !== active).map((bucket) => (
                    <button key={bucket} className="text-white underline-offset-4 hover:underline" onClick={() => move(item.momentId, bucket)}>
                      Move to {bucket === "archived" ? "Trash" : bucket}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {!items.length ? <p className="rounded-lg border border-slate-800 p-6 text-sm text-slate-400">No moments in this bucket yet.</p> : null}
        </TabsContent>
      </Tabs>
      {undoMove ? (
        <div className="fixed bottom-5 right-5 flex items-center gap-3 rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-lg">
          <span>Moved {undoMove.title} to Trash.</span>
          <button className="font-medium text-white underline-offset-4 hover:underline" onClick={undoTrash} type="button">
            Undo
          </button>
        </div>
      ) : null}
    </Shell>
  );
}
