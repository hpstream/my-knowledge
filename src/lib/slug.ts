import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

function shortId(length = 6): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

function asciiSlugFrom(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function candidateSlugFromTitle(title: string): string {
  const ascii = asciiSlugFrom(title);
  if (ascii.length >= 4) {
    return `${ascii}-${shortId(4)}`;
  }
  return `article-${shortId(8)}`;
}

export async function generateUniqueSlug(title: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = candidateSlugFromTitle(title);
    const exists = await prisma.article.findUnique({
      where: { slug: candidate },
    });
    if (!exists) return candidate;
  }
  return `article-${shortId(12)}`;
}

export async function generateUniquePathSlug(title: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = candidateSlugFromTitle(title).replace(
      /^article-/,
      "path-",
    );
    const exists = await prisma.learningPath.findUnique({
      where: { slug: candidate },
    });
    if (!exists) return candidate;
  }
  return `path-${shortId(12)}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
