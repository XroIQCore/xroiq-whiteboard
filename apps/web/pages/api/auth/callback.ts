import type { NextApiRequest, NextApiResponse } from "next";
import { createApiSupabaseClient } from "../../../lib/supabaseApi";

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function safeNext(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function redirectWithError(res: NextApiResponse, message: string) {
  res.redirect(302, `/auth/callback?error_description=${encodeURIComponent(message)}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const oauthError = firstString(req.query.error_description) || firstString(req.query.error);
  if (oauthError) {
    redirectWithError(res, oauthError);
    return;
  }

  const code = firstString(req.query.code);
  if (!code) {
    redirectWithError(res, "Missing OAuth code.");
    return;
  }

  const supabase = createApiSupabaseClient(req, res);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    redirectWithError(res, error.message);
    return;
  }

  res.redirect(302, safeNext(req.query.next));
}
