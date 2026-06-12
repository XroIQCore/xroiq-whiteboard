import { FormEvent, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useSupabase } from "../lib/SupabaseProvider";

export default function LoginPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false,
      },
    });
    setMessage(error ? "Sign-ups disabled. Ask Jess or Karne for an invite." : "Magic link sent. Check your email.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to XROIQ Whiteboard</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <Input onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
            <Button className="w-full" type="submit">Send magic link</Button>
          </form>
          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
          <a className="mt-4 block text-sm text-slate-300" href="/signup">Need access?</a>
        </CardContent>
      </Card>
    </main>
  );
}
