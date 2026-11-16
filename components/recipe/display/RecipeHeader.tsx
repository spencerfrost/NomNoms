import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat } from 'lucide-react';

interface RecipeHeaderProps {
  title: string;
  description?: string;
  tags: string[];
  yield?: string;
  prepTime?: string;
  cookTime?: string;
  multiplier?: number;
}

const factClass =
  'inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground';

export function RecipeHeader({
  title,
  description,
  tags,
  yield: recipeYield,
  prepTime,
  cookTime,
  multiplier = 1,
}: RecipeHeaderProps) {
  const scaledYield =
    recipeYield?.replace(/\d+/g, match => String(Math.round(parseInt(match) * multiplier))) || '';

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-4xl md:text-6xl">{title}</h1>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}

      <div className="flex flex-wrap gap-2">
        {scaledYield && (
          <div className={factClass}>
            <ChefHat className="size-4" aria-hidden="true" />
            <span>Yields: {scaledYield}</span>
          </div>
        )}
        {prepTime && (
          <div className={factClass}>
            <Clock className="size-4" aria-hidden="true" />
            <span>Prep: {prepTime}</span>
          </div>
        )}
        {cookTime && (
          <div className={factClass}>
            <Clock className="size-4" aria-hidden="true" />
            <span>Cook: {cookTime}</span>
          </div>
        )}
        {tags.map(tag => (
          <Badge key={tag} variant="secondary" className="bg-card px-3 py-1.5 text-sm">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
