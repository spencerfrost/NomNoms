'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface ScaleControlsProps {
  multiplier: number
  onMultiplierChange: (multiplier: number) => void
}

const commonMultipliers = [0.5, 1, 1.5, 2, 2.5, 3]

export function ScaleControls({ multiplier, onMultiplierChange }: ScaleControlsProps) {
  const decreaseScale = () => {
    const newMultiplier = Math.max(0.25, multiplier - 0.25)
    onMultiplierChange(Math.round(newMultiplier * 100) / 100)
  }

  const increaseScale = () => {
    const newMultiplier = multiplier + 0.25
    onMultiplierChange(Math.round(newMultiplier * 100) / 100)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={decreaseScale}
          disabled={multiplier <= 0.25}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-12 text-center font-medium">
          {multiplier}×
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={increaseScale}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {commonMultipliers.map((mult) => (
          <Button
            key={mult}
            variant={multiplier === mult ? "default" : "outline"}
            size="sm"
            onClick={() => onMultiplierChange(mult)}
            className="text-xs"
          >
            {mult}×
          </Button>
        ))}
      </div>
    </div>
  )
}
