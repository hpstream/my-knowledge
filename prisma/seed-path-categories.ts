import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "基础认知", slug: "foundation", sortOrder: 10 },
  { name: "产品", slug: "product", sortOrder: 20 },
  { name: "设计", slug: "design", sortOrder: 30 },
  { name: "开发", slug: "development", sortOrder: 40 },
  { name: "发布", slug: "launch", sortOrder: 50 },
  { name: "增长", slug: "growth", sortOrder: 60 },
  { name: "AI", slug: "ai", sortOrder: 70 },
  { name: "经营", slug: "operations", sortOrder: 80 },
];

async function main() {
  // 1. 建好默认分类
  for (const c of DEFAULT_CATEGORIES) {
    await prisma.pathCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder, status: "active" },
      create: {
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
        status: "active",
      },
    });
  }

  // 2. 把已有路径的 category 字符串映射回 categoryId
  const categories = await prisma.pathCategory.findMany();
  const byName = new Map(categories.map((c) => [c.name, c.id]));

  const paths = await prisma.learningPath.findMany();
  for (const p of paths) {
    if (p.categoryId) continue;
    const matchedId = byName.get(p.category);
    if (matchedId) {
      await prisma.learningPath.update({
        where: { id: p.id },
        data: { categoryId: matchedId },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ path categories seeded");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
