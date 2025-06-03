"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/page-header";
import RecipeUrlImport from "@/components/recipe-url-import";
import { ImportedRecipe } from "@/lib/recipe-import-utils";

interface RecipeUrlImportScreenProps {
  onImported: (recipe: ImportedRecipe) => void;
  onCancel: () => void;
}

/**
 * Screen component for importing recipes from URLs
 */
export default function RecipeUrlImportScreen({
  onImported,
  onCancel,
}: RecipeUrlImportScreenProps) {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <PageHeader>
        <Button variant="ghost" className="mb-4" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Options
        </Button>
      </PageHeader>

      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Import Recipe</h1>
        <p className="text-muted-foreground">Import a recipe from a URL</p>
      </div>

      <RecipeUrlImport onImported={onImported} onCancel={onCancel} />
    </div>
  );
}
