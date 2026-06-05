import { NextResponse } from "next/server";
import { clearSessionCookie, destroySession } from "@/lib/auth/session";

export async function POST() {
  await destroySession();
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
