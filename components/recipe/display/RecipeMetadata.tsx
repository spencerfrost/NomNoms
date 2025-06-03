import { Clock, ChefHat, Timer } from "lucide-react";

interface RecipeMetadataProps {
  yield?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  difficulty?: string;
  multiplier?: number;
  className?: string;
}

export function RecipeMetadata({
  yield: recipeYield,
  prepTime,
  cookTime,
  totalTime,
  difficulty,
  multiplier = 1,
  className,
}: RecipeMetadataProps) {
  const scaledYield = recipeYield?.replace(/\d+/g, (match) =>
    String(Math.round(parseInt(match) * multiplier))
  ) || "";

  const metadata = [
    {
      icon: ChefHat,
      label: "Yields",
      value: scaledYield,
      show: !!scaledYield,
    },
    {
      icon: Clock,
      label: "Prep",
      value: prepTime,
      show: !!prepTime,
    },
    {
      icon: Clock,
      label: "Cook",
      value: cookTime,
      show: !!cookTime,
    },
    {
      icon: Timer,
      label: "Total",
      value: totalTime,
      show: !!totalTime,
    },
    {
      icon: ChefHat,
      label: "Difficulty",
      value: difficulty,
      show: !!difficulty,
    },
  ].filter((item) => item.show);

  if (metadata.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-4 text-sm text-muted-foreground ${className || ""}`}>
      {metadata.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-1">
          <Icon className="h-4 w-4" />
          <span>
            {label}: {value}
          </span>
        </div>
      ))}
    </div>
  );
}
