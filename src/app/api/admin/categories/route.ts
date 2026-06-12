import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { categoryCreateSchema } from "@/lib/category-schema";

export async function GET() {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const items = await prisma.pathCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(items);
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

  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.format() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const dup = await prisma.pathCategory.findFirst({
    where: { OR: [{ slug: data.slug }, { name: data.name }] },
  });
  if (dup) {
    return NextResponse.json({ error: "DUPLICATE" }, { status: 409 });
  }

  const created = await prisma.pathCategory.create({
    data,
  });
  return NextResponse.json(created);
}
