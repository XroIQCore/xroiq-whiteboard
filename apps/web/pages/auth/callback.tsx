import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function safeNext(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    if (!router.isReady) return;

    const oauthError = firstString(router.query.error_description) || firstString(router.query.error);
    if (oauthError) {
      setMessage(`Sign in could not finish: ${oauthError}`);
      return;
    }

    const code = firstString(router.query.code);
    if (!code) {
      setMessage("Sign in could not finish. Please try again.");
      return;
    }

    router.replace({
      pathname: "/api/auth/callback",
      query: { code, next: safeNext(router.query.next) },
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <p className="text-sm text-slate-300">{message}</p>
    </main>
  );
}
