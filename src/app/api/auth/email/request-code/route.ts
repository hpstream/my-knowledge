import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  CODE_RESEND_COOLDOWN_MS,
  codeExpiresAt,
  generateCode,
  hashCode,
} from "@/lib/auth/code";
import { buildLoginCodeEmail, sendEmail } from "@/lib/auth/email";

const schema = z.object({
  email: z.string().email().max(254),
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
    return NextResponse.json(
      { error: "INVALID_EMAIL" },
      { status: 400 },
    );
  }
  const email = parsed.data.email.trim().toLowerCase();

  const recent = await prisma.emailVerification.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const ageMs = Date.now() - recent.createdAt.getTime();
    if (ageMs < CODE_RESEND_COOLDOWN_MS) {
      const retryAfter = Math.ceil(
        (CODE_RESEND_COOLDOWN_MS - ageMs) / 1000,
      );
      return NextResponse.json(
        { error: "TOO_FREQUENT", retryAfter },
        { status: 429 },
      );
    }
  }

  const code = generateCode();
  await prisma.emailVerification.create({
    data: {
      email,
      codeHash: hashCode(code),
      expiresAt: codeExpiresAt(),
    },
  });

  await sendEmail(buildLoginCodeEmail(email, code));

  return NextResponse.json({ ok: true });
}
