import { FormEvent, useState } from "react";
import { Shell } from "../components/Shell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

async function responseJson(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as { error?: string; files?: unknown[] };
  }

  const text = await res.text();
  return { error: text || res.statusText };
}

export default function UploadPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadFiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const input = event.currentTarget.elements.namedItem("files") as HTMLInputElement;
    if (!input.files?.length) {
      setMessage("Choose one or more files first.");
      return;
    }

    const form = new FormData();
    Array.from(input.files).forEach((file) => form.append("files", file));
    setBusy(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await responseJson(res);
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setMessage(`Uploaded ${json.files?.length || 0} file(s). Workers will pick them up next.`);
      input.value = "";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Upload</h1>
          <p className="mt-2 text-sm text-slate-400">Add source files to Supabase Storage and the extraction queue.</p>
        </div>
      </header>

      <form onSubmit={uploadFiles} className="rounded-lg border border-dashed border-slate-700 bg-slate-900 p-8">
        <Input
          name="files"
          type="file"
          multiple
        />
        <Button
          className="mt-5"
          disabled={busy}
          type="submit"
        >
          {busy ? "Uploading..." : "Upload files"}
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
    </Shell>
  );
}
