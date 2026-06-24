import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = ["/", "/upload", "/review", "/moments", "/priority", "/arcs"];
const publicPrefixes = ["/login", "/signup", "/api", "/_next", "/favicon.ico"];

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const pathname = req.nextUrl.pathname;
  const isPublic = publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isPublic || !isProtected) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => res.headers.set(key, value));
        },
      },
    },
  );
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/", "/upload", "/review/:path*", "/moments/:path*", "/priority/:path*", "/arcs/:path*"],
};
