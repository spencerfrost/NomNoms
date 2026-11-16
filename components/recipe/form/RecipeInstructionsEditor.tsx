'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface RecipeInstructionsEditorProps {
  instructions: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

/**
 * Component for managing step-by-step recipe instructions
 */
export default function RecipeInstructionsEditor({
  instructions,
  onChange,
  onAdd,
  onRemove,
}: RecipeInstructionsEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
        <CardDescription>Step-by-step cooking instructions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <Input
                value={instruction}
                onChange={e => onChange(index, e.target.value)}
                placeholder={`Step ${index + 1} instruction`}
                className="min-w-0 flex-1"
              />
              {instructions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove step ${index + 1}`}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button type="button" onClick={onAdd} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
