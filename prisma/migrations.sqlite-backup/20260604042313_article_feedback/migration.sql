-- CreateTable
CREATE TABLE "ArticleFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleSlug" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "category" TEXT NOT NULL DEFAULT 'issue',
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "ArticleFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ArticleFeedback_articleSlug_idx" ON "ArticleFeedback"("articleSlug");

-- CreateIndex
CREATE INDEX "ArticleFeedback_status_idx" ON "ArticleFeedback"("status");

-- CreateIndex
CREATE INDEX "ArticleFeedback_createdAt_idx" ON "ArticleFeedback"("createdAt");
