import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { getSessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/login"];
const BYPASS_PREFIXES = [
  "/_next/",
  "/favicon.ico",
  "/manifest.json",
  "/icon",
  "/apple-icon",
  "/robots.txt",
  "/sitemap.xml",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const res = NextResponse.next();

  const session = await getIronSession<SessionData>(req, res, getSessionOptions());

  if (!session.authenticated && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (session.authenticated && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return res;
}
