import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat } from "lucide-react";

interface RecipeHeaderProps {
  title: string;
  description?: string;
  tags: string[];
  yield?: string;
  prepTime?: string;
  cookTime?: string;
  multiplier?: number;
}

export function RecipeHeader({
  title,
  description,
  tags,
  yield: recipeYield,
  prepTime,
  cookTime,
  multiplier = 1,
}: RecipeHeaderProps) {
  const scaledYield = recipeYield?.replace(/\d+/g, (match) =>
    String(Math.round(parseInt(match) * multiplier))
  ) || "";

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-lg mb-4">{description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {scaledYield && (
          <div className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" />
            <span>Yields: {scaledYield}</span>
          </div>
        )}
        {prepTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Prep: {prepTime}</span>
          </div>
        )}
        {cookTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Cook: {cookTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
