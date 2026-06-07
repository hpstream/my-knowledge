import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { ensureAdmin } from "@/lib/auth/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function safeBaseName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 60)
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  const admin = await ensureAdmin();
  if (!admin) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "UNSUPPORTED_TYPE", allowed: Array.from(ALLOWED_TYPES) },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "FILE_TOO_LARGE", maxBytes: MAX_BYTES },
      { status: 413 },
    );
  }

  const folder = (form?.get("folder") as string | null) ?? "uploads";
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").slice(0, 40) || "uploads";
  const ext = EXT_BY_TYPE[file.type];
  const base = safeBaseName(file.name) || "image";
  const key = `${safeFolder}/${Date.now()}-${base}.${ext}`;

  try {
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error("[upload] vercel blob put failed", err);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
