import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { markComplete } from "@/lib/server-progress";

const schema = z.object({
  pathSlug: z.string().min(1).max(100),
  lessonSlug: z.string().min(1).max(100),
  score: z.object({
    correct: z.number().int().nonnegative(),
    total: z.number().int().positive(),
  }),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

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

  const updated = await markComplete(
    user.id,
    parsed.data.pathSlug,
    parsed.data.lessonSlug,
    parsed.data.score,
  );
  return NextResponse.json(updated);
}
