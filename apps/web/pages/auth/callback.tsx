import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "../../lib/SupabaseProvider";

function safeNext(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    if (!router.isReady) return;

    const code = typeof router.query.code === "string" ? router.query.code : "";
    if (!code) {
      setMessage("Sign in could not finish. Please try again.");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setMessage("Sign in could not finish. Please try again.");
        return;
      }

      router.replace(safeNext(router.query.next));
    });
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <p className="text-sm text-slate-300">{message}</p>
    </main>
  );
}
