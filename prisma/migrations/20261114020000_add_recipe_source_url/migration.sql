-- AlterTable
ALTER TABLE "recipes" ADD COLUMN "sourceUrl" TEXT;

-- CreateIndex
CREATE INDEX "recipes_authorId_sourceUrl_idx" ON "recipes"("authorId", "sourceUrl");
