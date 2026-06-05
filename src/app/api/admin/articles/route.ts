import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { articleCreateSchema } from "@/lib/article-schema";
import { generateUniqueSlug } from "@/lib/slug";

export async function GET() {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const rows = await prisma.article.findMany({
    orderBy: [{ pathSlug: "asc" }, { order: "asc" }],
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

  const parsed = articleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.format() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  let slug = data.slug;
  if (slug) {
    const exists = await prisma.article.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
    }
  } else {
    slug = await generateUniqueSlug(data.title);
  }

  const article = await prisma.article.create({
    data: {
      slug,
      kind: data.kind,
      pathSlug: data.kind === "topic" ? null : (data.pathSlug ?? null),
      title: data.title,
      summary: data.summary ?? null,
      body: data.body,
      order: data.order,
      readMinutes: data.readMinutes,
      difficulty: data.difficulty ?? null,
      estimatedMinutes: data.estimatedMinutes ?? null,
      cost: data.cost ?? null,
      quizJson: JSON.stringify(data.quiz),
      status: data.status,
      publishedAt: data.status === "published" ? new Date() : null,
      lastVerifiedAt: data.status === "published" ? new Date() : null,
      authorId: admin.id,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
