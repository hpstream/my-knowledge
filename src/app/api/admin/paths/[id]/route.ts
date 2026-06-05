import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { pathUpdateSchema } from "@/lib/path-schema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  const row = await prisma.learningPath.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.learningPath.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = pathUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.format() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  if (data.slug && data.slug !== existing.slug) {
    const dup = await prisma.learningPath.findUnique({
      where: { slug: data.slug },
    });
    if (dup) {
      return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
    }
  }

  const wasPublished = existing.status === "published";
  const willPublish = data.status === "published";

  const updated = await prisma.learningPath.update({
    where: { id },
    data: {
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.estimatedHours !== undefined && {
        estimatedHours: data.estimatedHours,
      }),
      ...(data.level !== undefined && { level: data.level }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.badge !== undefined && { badge: data.badge ?? null }),
      ...(data.pricing !== undefined && { pricing: data.pricing }),
      ...(data.priceLabel !== undefined && {
        priceLabel: data.priceLabel ?? null,
      }),
      ...(data.statusLabel !== undefined && {
        statusLabel: data.statusLabel ?? null,
      }),
      ...(data.highlights !== undefined && {
        highlightsJson: JSON.stringify(data.highlights),
      }),
      ...(data.accent !== undefined && { accent: data.accent ?? null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(willPublish && !wasPublished
        ? { publishedAt: new Date() }
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
  const existing = await prisma.learningPath.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const articleCount = await prisma.article.count({
    where: { pathSlug: existing.slug },
  });
  if (articleCount > 0) {
    return NextResponse.json(
      {
        error: "HAS_ARTICLES",
        message: `该路径下还有 ${articleCount} 篇文章，请先删除或迁移这些文章`,
      },
      { status: 409 },
    );
  }

  await prisma.learningPath.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
