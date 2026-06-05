import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

const schema = z.object({
  articleSlug: z.string().min(1).max(120),
  category: z.enum(["issue", "improve", "praise"]).default("issue"),
  body: z.string().min(2).max(2000),
  email: z.string().email().max(254).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 400 });
  }
  const data = parsed.data;

  const user = await getCurrentUser();

  await prisma.articleFeedback.create({
    data: {
      articleSlug: data.articleSlug,
      category: data.category,
      body: data.body.trim(),
      userId: user?.id ?? null,
      email: data.email?.trim().toLowerCase() ?? user?.email ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
