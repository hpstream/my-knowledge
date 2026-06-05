-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedHours" REAL NOT NULL DEFAULT 2,
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "category" TEXT NOT NULL DEFAULT 'AI Engineering',
    "badge" TEXT,
    "pricing" TEXT NOT NULL DEFAULT 'free',
    "priceLabel" TEXT,
    "statusLabel" TEXT,
    "highlightsJson" TEXT NOT NULL DEFAULT '[]',
    "accent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_slug_key" ON "LearningPath"("slug");

-- CreateIndex
CREATE INDEX "LearningPath_slug_idx" ON "LearningPath"("slug");

-- CreateIndex
CREATE INDEX "LearningPath_status_idx" ON "LearningPath"("status");

-- CreateIndex
CREATE INDEX "LearningPath_pricing_idx" ON "LearningPath"("pricing");
