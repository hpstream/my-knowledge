import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  // 1. Migrate vibecoding-getting-started lessons → vibecoding-mastery
  const migrated = await p.article.updateMany({
    where: { pathSlug: "vibecoding-getting-started", kind: "lesson" },
    data: { pathSlug: "vibecoding-mastery" },
  });
  console.log(`migrated ${migrated.count} lessons → vibecoding-mastery`);

  // 2. Delete the old path
  const oldVibe = await p.learningPath.deleteMany({
    where: { slug: "vibecoding-getting-started" },
  });
  console.log(`deleted ${oldVibe.count} old vibecoding-getting-started path`);

  // 3. Delete the 2 "超级智能体基础课" placeholder paths
  const trash = await p.learningPath.deleteMany({
    where: { slug: { startsWith: "path-" } },
  });
  console.log(`deleted ${trash.count} placeholder "超级智能体基础课" paths`);

  // 4. Delete the topic "AI 绘图功能集成指南（给设计师）"
  const topic = await p.article.deleteMany({
    where: { slug: "article-535168f9", kind: "topic" },
  });
  console.log(`deleted ${topic.count} placeholder topic article-535168f9`);

  console.log("done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
