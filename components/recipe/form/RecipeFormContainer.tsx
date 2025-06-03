"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/page-header";
import { ErrorMessage } from "@/components/common";

interface RecipeFormContainerProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * Container component for the recipe form with header, error handling, and submission
 */
export default function RecipeFormContainer({
  children,
  onSubmit,
  onBack,
  loading = false,
  error = null,
}: RecipeFormContainerProps) {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader>
        <Button variant="ghost" className="mb-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Options
        </Button>
      </PageHeader>

      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Add New Recipe</h1>
        <p className="text-muted-foreground">
          Create a new recipe for your collection
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage
            variant="banner"
            message={error}
          />
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </form>
    </div>
  );
}
