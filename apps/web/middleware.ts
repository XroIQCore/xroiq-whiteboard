import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const protectedPrefixes = ["/", "/upload", "/review", "/moments", "/priority", "/arcs"];
const publicPrefixes = ["/login", "/signup", "/api", "/_next", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const isPublic = publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isPublic || !isProtected) return res;

  const supabase = createMiddlewareClient({ req, res });
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
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
