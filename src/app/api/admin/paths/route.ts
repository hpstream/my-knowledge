import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { pathCreateSchema } from "@/lib/path-schema";
import { generateUniquePathSlug } from "@/lib/slug";

export async function GET() {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const rows = await prisma.learningPath.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = pathCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.format() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  let slug = data.slug;
  if (slug) {
    const exists = await prisma.learningPath.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
    }
  } else {
    slug = await generateUniquePathSlug(data.title);
  }

  const path = await prisma.learningPath.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      estimatedHours: data.estimatedHours,
      level: data.level,
      category: data.category,
      categoryId: data.categoryId ?? null,
      badge: data.badge ?? null,
      pricing: data.pricing,
      priceLabel: data.priceLabel ?? null,
      statusLabel: data.statusLabel ?? null,
      highlightsJson: JSON.stringify(data.highlights),
      accent: data.accent ?? null,
      coverUrl: data.coverUrl ?? null,
      tagsJson: JSON.stringify(data.tags ?? []),
      ribbon: data.ribbon ?? null,
      status: data.status,
      sortOrder: data.sortOrder,
      publishedAt: data.status === "published" ? new Date() : null,
    },
  });

  return NextResponse.json(path, { status: 201 });
}
