import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      </CardHeader>
      <CardContent>
        <ol className="space-y-5">
          {instructions.map((instruction, index) => (
            <li
              key={`step-${index}-${instruction.slice(0, 20)}`}
              className={`flex gap-4 ${
                interactive ? 'cursor-pointer rounded-2xl p-2 hover:bg-muted/50' : ''
              }`}
            >
              {showStepNumbers && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tile-mint font-display text-xl text-tile-foreground">
                  {index + 1}
                </span>
              )}
              <p className={`text-lg leading-relaxed ${showStepNumbers ? 'pt-1' : ''}`}>
                {instruction}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
