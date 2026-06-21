import { FormEvent, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useSupabase } from "../lib/SupabaseProvider";

export default function LoginPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setMessage(error ? "Could not sign in. Check your email and password." : "Signed in.");
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
            <Input onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" value={password} />
            <Button className="w-full" type="submit">Sign in</Button>
          </form>
          {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
          <a className="mt-4 block text-sm text-slate-300" href="/signup">Need access?</a>
        </CardContent>
      </Card>
    </main>
  );
}
