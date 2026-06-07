import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { articleUpdateSchema } from "@/lib/article-schema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  const row = await prisma.article.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = articleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.format() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  if (data.slug && data.slug !== existing.slug) {
    const dup = await prisma.article.findUnique({ where: { slug: data.slug } });
    if (dup) {
      return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
    }
  }

  const wasPublished = existing.status === "published";
  const willPublish = data.status === "published";

  // If switching to topic kind, blank out pathSlug
  const finalKind = data.kind ?? existing.kind;
  const finalPathSlug =
    finalKind === "topic"
      ? null
      : data.pathSlug !== undefined
        ? (data.pathSlug ?? null)
        : existing.pathSlug;

  const updated = await prisma.article.update({
    where: { id },
    data: {
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.kind !== undefined && { kind: data.kind }),
      pathSlug: finalPathSlug,
      ...(data.title !== undefined && { title: data.title }),
      ...(data.summary !== undefined && { summary: data.summary ?? null }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.readMinutes !== undefined && { readMinutes: data.readMinutes }),
      ...(data.difficulty !== undefined && {
        difficulty: data.difficulty ?? null,
      }),
      ...(data.estimatedMinutes !== undefined && {
        estimatedMinutes: data.estimatedMinutes ?? null,
      }),
      ...(data.cost !== undefined && { cost: data.cost ?? null }),
      ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl ?? null }),
      ...(data.tags !== undefined && { tagsJson: JSON.stringify(data.tags) }),
      ...(data.ribbon !== undefined && { ribbon: data.ribbon ?? null }),
      ...(data.quiz !== undefined && { quizJson: JSON.stringify(data.quiz) }),
      ...(data.status !== undefined && { status: data.status }),
      ...(willPublish && !wasPublished
        ? { publishedAt: new Date(), lastVerifiedAt: new Date() }
        : data.status === "draft"
          ? { publishedAt: null }
          : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
