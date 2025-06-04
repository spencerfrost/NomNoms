import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecipeInstructionsListProps {
  instructions: string[];
  showStepNumbers?: boolean;
  interactive?: boolean;
}

export function RecipeInstructionsList({
  instructions,
  showStepNumbers = true,
  interactive = false,
}: RecipeInstructionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
        <CardDescription>Follow these steps to make your recipe</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {instructions.map((instruction, index) => (
            <li
              key={`step-${index}-${instruction.slice(0, 20)}`}
              className={`flex gap-4 ${
                interactive ? 'cursor-pointer hover:bg-muted/50 p-2 rounded' : ''
              }`}
            >
              {showStepNumbers && (
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
              )}
              <p className={showStepNumbers ? 'pt-1' : ''}>{instruction}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
