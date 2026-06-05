import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const match = pathname.match(/^\/paths\/([^\/]+)\/([^\/]+)\/?$/);
  if (!match) return NextResponse.next();

  const sid = req.cookies.get(SESSION_COOKIE)?.value;
  if (sid) return NextResponse.next();

  const pathSlug = match[1];
  const returnTo = pathname + search;
  const url = req.nextUrl.clone();
  url.pathname = `/paths/${pathSlug}`;
  url.search = "";
  url.searchParams.set("auth", "required");
  url.searchParams.set("return_to", returnTo);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/paths/:slug/:lesson"],
};
