'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface ScaleControlsProps {
  multiplier: number;
  onMultiplierChange: (multiplier: number) => void;
}

const commonMultipliers = [0.5, 1, 1.5, 2, 2.5, 3];

export function ScaleControls({ multiplier, onMultiplierChange }: ScaleControlsProps) {
  const decreaseScale = () => {
    const newMultiplier = Math.max(0.25, multiplier - 0.25);
    onMultiplierChange(Math.round(newMultiplier * 100) / 100);
  };

  const increaseScale = () => {
    const newMultiplier = multiplier + 0.25;
    onMultiplierChange(Math.round(newMultiplier * 100) / 100);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={decreaseScale}
          disabled={multiplier <= 0.25}
          aria-label="Scale down"
          className="bg-background hover:bg-muted text-foreground"
        >
          <Minus className="size-5" strokeWidth={3} />
        </Button>
        <span className="min-w-16 text-center font-display text-2xl">{multiplier}×</span>
        <Button
          variant="secondary"
          size="icon"
          onClick={increaseScale}
          aria-label="Scale up"
          className="bg-background hover:bg-muted text-foreground"
        >
          <Plus className="size-5" strokeWidth={3} />
        </Button>
      </div>

      <div role="group" aria-label="Scale this recipe" className="grid grid-cols-6 gap-1.5">
        {commonMultipliers.map(mult => (
          <Button
            key={mult}
            variant={multiplier === mult ? 'default' : 'secondary'}
            aria-pressed={multiplier === mult}
            onClick={() => onMultiplierChange(mult)}
            className={
              multiplier === mult
                ? 'px-0 text-sm'
                : 'bg-background px-0 text-sm text-foreground hover:bg-muted'
            }
          >
            {mult}×
          </Button>
        ))}
      </div>
    </div>
  );
}
