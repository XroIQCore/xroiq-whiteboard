import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useSupabase } from "../lib/SupabaseProvider";

const oauthProvider = (process.env.NEXT_PUBLIC_SUPABASE_OAUTH_PROVIDER || "google") as Provider;
const oauthProviderLabel = process.env.NEXT_PUBLIC_SUPABASE_OAUTH_LABEL || "Google";

export default function LoginPage() {
  const supabase = useSupabase();
  const [message, setMessage] = useState("");

  async function signIn() {
    setMessage("Redirecting...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: oauthProvider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setMessage("Could not start sign in. Check the OAuth provider settings.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to XROIQ Whiteboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={signIn} type="button">Continue with {oauthProviderLabel}</Button>
          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
          <a className="mt-4 block text-sm text-slate-300" href="/signup">Need access?</a>
        </CardContent>
      </Card>
    </main>
  );
}
