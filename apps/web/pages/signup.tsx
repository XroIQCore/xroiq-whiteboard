import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign-ups disabled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            XROIQ Whiteboard is invite-only. Ask Jess or Karne to invite your email in Supabase.
          </p>
          <a className="mt-4 block text-sm text-slate-300" href="/login">Back to sign in</a>
        </CardContent>
      </Card>
    </main>
  );
}
