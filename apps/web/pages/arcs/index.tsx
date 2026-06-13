import useSWR from "swr";
import { Shell } from "../../components/Shell";
import { Button } from "../../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

type Arc = {
  id: string;
  title: string;
  owner: string;
  summary: string;
  status: string;
  updatedAt: string;
  threadCount: number;
  momentCount: number;
  threads: Array<{ threadId: string }>;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ArcsPage() {
  const { data } = useSWR<Arc[]>("/api/arcs", fetcher);

  async function exportArcs(format: "json" | "csv") {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "arcs", format }),
    });
    const json = await res.json();
    if (json.signedUrl) window.open(json.signedUrl, "_blank");
  }

  return (
    <Shell>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Arc Explorer</h1>
          <p className="mt-2 text-sm text-slate-400">Narrative arcs stitched from related threads.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportArcs("csv")}>Export CSV</Button>
          <Button variant="outline" onClick={() => exportArcs("json")}>Export JSON</Button>
        </div>
      </header>

      <Accordion>
        {(data || []).map((arc) => (
          <AccordionItem key={arc.id}>
            <AccordionTrigger>
              <div className="flex flex-col gap-1">
                <span>{arc.title}</span>
                <span className="text-xs font-normal text-slate-400">
                  {arc.owner} • {arc.threadCount} threads • {arc.momentCount} moments • {new Date(arc.updatedAt).toLocaleString()}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">{arc.summary}</p>
              <div className="space-y-2">
                {arc.threads.map((thread) => (
                  <a className="block rounded-md border border-slate-800 p-3 text-white" href={`/moments?threadId=${encodeURIComponent(thread.threadId)}`} key={thread.threadId}>
                    Thread {thread.threadId}
                  </a>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {data?.length === 0 ? <p className="mt-4 text-sm text-slate-400">No arcs yet. Run the arc worker after approved threaded moments exist.</p> : null}
    </Shell>
  );
}
