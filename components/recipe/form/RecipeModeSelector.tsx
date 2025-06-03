"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Globe } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/page-header";

type CreateMode = "select" | "manual" | "url";

interface RecipeModeSelectorProps {
  onModeChange: (mode: CreateMode) => void;
}

/**
 * Component for selecting how to create a recipe (manual vs URL import)
 */
export default function RecipeModeSelector({
  onModeChange,
}: RecipeModeSelectorProps) {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <PageHeader>
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </Link>
      </PageHeader>
      
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Add New Recipe</h1>
        <p className="text-muted-foreground">
          Choose how you&apos;d like to create your recipe
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onModeChange("manual")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <CardTitle>Create from Scratch</CardTitle>
                <CardDescription>
                  Manually enter all recipe details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onModeChange("url")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6" />
              <div>
                <CardTitle>Import from URL</CardTitle>
                <CardDescription>
                  Import recipe from AllRecipes, Food Network, and other popular
                  sites
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
