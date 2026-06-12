-- CreateTable
CREATE TABLE "PathCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PathCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PathCategory_slug_key" ON "PathCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PathCategory_name_key" ON "PathCategory"("name");

-- CreateIndex
CREATE INDEX "PathCategory_sortOrder_idx" ON "PathCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "PathCategory_status_idx" ON "PathCategory"("status");

-- AlterTable
ALTER TABLE "LearningPath" ADD COLUMN "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "LearningPath_categoryId_idx" ON "LearningPath"("categoryId");

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PathCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
