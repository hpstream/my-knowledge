import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  CODE_MAX_ATTEMPTS,
  hashCode,
  isExpired,
} from "@/lib/auth/code";
import { createSession, setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  email: z.string().email().max(254),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const codeHash = hashCode(parsed.data.code);

  const record = await prisma.emailVerification.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return NextResponse.json({ error: "NO_PENDING_CODE" }, { status: 400 });
  }

  if (isExpired(record.expiresAt)) {
    return NextResponse.json({ error: "CODE_EXPIRED" }, { status: 400 });
  }

  if (record.attempts >= CODE_MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "TOO_MANY_ATTEMPTS" },
      { status: 429 },
    );
  }

  if (record.codeHash !== codeHash) {
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const left = CODE_MAX_ATTEMPTS - record.attempts - 1;
    return NextResponse.json(
      { error: "WRONG_CODE", attemptsLeft: Math.max(left, 0) },
      { status: 400 },
    );
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: { lastLoginAt: new Date() },
    create: { email, lastLoginAt: new Date() },
  });

  const ua = req.headers.get("user-agent") ?? null;
  const sid = await createSession(user.id, ua);
  await setSessionCookie(sid);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
  });
}
