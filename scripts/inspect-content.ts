import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const paths = await p.learningPath.findMany({
    select: { slug: true, title: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }],
  });
  console.log("=== PATHS ===");
  paths.forEach((x) =>
    console.log(`${x.sortOrder.toString().padStart(2)}  ${x.slug}  |  ${x.title}`),
  );

  const topics = await p.article.findMany({
    where: { kind: "topic" },
    select: { slug: true, title: true },
  });
  console.log("\n=== TOPICS ===");
  topics.forEach((x) => console.log(`${x.slug}  |  ${x.title}`));

  const lessons = await p.article.findMany({
    where: { kind: "lesson" },
    select: { slug: true, title: true, pathSlug: true, order: true },
    orderBy: [{ pathSlug: "asc" }, { order: "asc" }],
  });
  console.log("\n=== LESSONS ===");
  lessons.forEach((x) =>
    console.log(`[${x.pathSlug}] ${x.order}. ${x.slug}  |  ${x.title}`),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
