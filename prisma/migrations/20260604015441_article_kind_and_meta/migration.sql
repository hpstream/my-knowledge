-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "pathSlug" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'lesson',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "readMinutes" INTEGER NOT NULL DEFAULT 10,
    "estimatedMinutes" INTEGER,
    "difficulty" INTEGER,
    "cost" TEXT,
    "quizJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "lastVerifiedAt" DATETIME,
    "authorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("authorId", "body", "createdAt", "id", "order", "pathSlug", "publishedAt", "quizJson", "readMinutes", "slug", "status", "summary", "title", "updatedAt") SELECT "authorId", "body", "createdAt", "id", "order", "pathSlug", "publishedAt", "quizJson", "readMinutes", "slug", "status", "summary", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_pathSlug_idx" ON "Article"("pathSlug");
CREATE INDEX "Article_slug_idx" ON "Article"("slug");
CREATE INDEX "Article_status_idx" ON "Article"("status");
CREATE INDEX "Article_kind_idx" ON "Article"("kind");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
