import { useRouter } from "next/router";
import useSWR from "swr";
import { Shell } from "../components/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

type Moment = {
  id: string;
  title?: string;
  context: string;
  need?: string;
  confidence: number;
  updatedAt: string;
  priority?: { bucket: string; rank: number } | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MomentsPage() {
  const router = useRouter();
  const threadId = typeof router.query.threadId === "string" ? router.query.threadId : "";
  const { data } = useSWR<Moment[]>(threadId ? `/api/moments?threadId=${encodeURIComponent(threadId)}` : "/api/moments", fetcher);

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Moments</h1>
        <p className="mt-2 text-sm text-slate-400">{threadId ? `Thread ${threadId}` : "Recent moments"}</p>
      </header>
      <section className="space-y-3">
        {(data || []).map((moment) => (
          <Card key={moment.id}>
            <CardHeader>
              <CardTitle>{moment.title || "Untitled moment"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">{moment.need || moment.context}</p>
              <p className="mt-3 text-xs text-slate-400">
                Confidence {Math.round(moment.confidence * 100)}%
                {moment.priority ? ` • ${moment.priority.bucket} #${moment.priority.rank}` : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </Shell>
  );
}
