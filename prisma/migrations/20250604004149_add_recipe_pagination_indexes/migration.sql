-- CreateIndex
CREATE INDEX "recipes_createdAt_id_idx" ON "recipes"("createdAt", "id");

-- CreateIndex
CREATE INDEX "recipes_title_createdAt_idx" ON "recipes"("title", "createdAt");

-- CreateIndex
CREATE INDEX "recipes_visibility_createdAt_idx" ON "recipes"("visibility", "createdAt");
