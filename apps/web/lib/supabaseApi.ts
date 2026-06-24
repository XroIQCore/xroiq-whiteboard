import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextApiRequest, NextApiResponse } from "next";

function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  const path = options.path || "/";

  parts.push(`Path=${path}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) {
    const sameSite = options.sameSite === true ? "Strict" : String(options.sameSite);
    parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1).toLowerCase()}`);
  }

  return parts.join("; ");
}

function existingSetCookies(res: NextApiResponse) {
  const header = res.getHeader("Set-Cookie");
  if (!header) return [];
  return Array.isArray(header) ? header.map(String) : [String(header)];
}

export function createApiSupabaseClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies).flatMap(([name, value]) =>
            typeof value === "string" ? [{ name, value }] : [],
          );
        },
        setAll(cookiesToSet, headers) {
          res.setHeader("Set-Cookie", [
            ...existingSetCookies(res),
            ...cookiesToSet.map(({ name, value, options }) => serializeCookie(name, value, options)),
          ]);
          Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
        },
      },
    },
  );
}
