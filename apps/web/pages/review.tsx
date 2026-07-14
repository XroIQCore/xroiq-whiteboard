import useSWR from "swr";
import { Shell } from "../components/Shell";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

type ReviewItem = {
  id: string;
  objectType: string;
  objectId: string;
  reason: string;
  status: string;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReviewPage() {
  const { data, mutate, error } = useSWR<ReviewItem[]>("/api/review", fetcher, {
    refreshInterval: 5000,
  });

  async function act(id: string, action: "approve" | "reject") {
    await fetch(`/api/review/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    mutate();
  }

  return (
    <Shell>
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Review Queue</h1>
          <p className="mt-2 text-sm text-slate-400">Approve or reject generated work items.</p>
        </div>
      </header>

      {error ? <p className="mb-4 text-sm text-rose-300">Review queue unavailable.</p> : null}

      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reason</TableHead>
              <TableHead>Object</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.reason}</TableCell>
                <TableCell className="text-slate-300">{item.objectType}:{item.objectId}</TableCell>
                <TableCell className="text-slate-300">{new Date(item.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => act(item.id, "approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => act(item.id, "reject")}>
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data?.length === 0 ? (
              <TableRow>
                <TableCell className="py-6 text-center text-slate-400" colSpan={4}>No unreviewed items.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </Shell>
  );
}
