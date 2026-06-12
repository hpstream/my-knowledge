import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { categoryUpdateSchema } from "@/lib/category-schema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  const row = await prisma.pathCategory.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.pathCategory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.format() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (
    (data.slug && data.slug !== existing.slug) ||
    (data.name && data.name !== existing.name)
  ) {
    const dup = await prisma.pathCategory.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              data.slug ? { slug: data.slug } : { slug: existing.slug },
              data.name ? { name: data.name } : { name: existing.name },
            ],
          },
        ],
      },
    });
    if (dup) {
      return NextResponse.json({ error: "DUPLICATE" }, { status: 409 });
    }
  }

  const updated = await prisma.pathCategory.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.pathCategory.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const usage = await prisma.learningPath.count({
    where: { categoryId: id },
  });
  if (usage > 0) {
    return NextResponse.json(
      {
        error: "HAS_PATHS",
        message: `该分类下还有 ${usage} 条路径，请先把它们换成其他分类`,
      },
      { status: 409 },
    );
  }

  await prisma.pathCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
