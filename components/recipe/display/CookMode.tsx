'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Ingredient } from '@/types';
import { Button } from '@/components/ui/button';
import { RecipeIngredientsList } from './RecipeIngredientsList';

interface CookModeProps {
  title: string;
  steps: string[];
  ingredients: Ingredient[];
  multiplier: number;
  onClose: () => void;
}

/**
 * Keeps the screen awake while mounted, where the browser supports it. The lock is
 * dropped by the browser whenever the tab is hidden, so it is re-requested on return.
 * Failure (unsupported browser, battery saver) is silent: cooking still works.
 */
function useScreenWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const next = await navigator.wakeLock.request('screen');
        if (cancelled) {
          void next.release();
        } else {
          lock = next;
        }
      } catch {
        // Not granted; nothing to do.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void lock?.release();
    };
  }, []);
}

/**
 * Full-screen, one-step-at-a-time view of a recipe for use at the stove: large type,
 * large Back/Next buttons, and the scaled ingredient list one tap away.
 */
export function CookMode({ title, steps, ingredients, multiplier, onClose }: CookModeProps) {
  const [index, setIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useScreenWakeLock();

  useEffect(() => {
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = steps.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const nextStep = isLast ? null : steps[index + 1];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Cooking ${title}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-background outline-none"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-4 pt-10 pb-4 md:pt-8">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Stop cooking"
            className="shrink-0 bg-card hover:bg-card/70"
          >
            <X className="size-5" strokeWidth={2.8} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowIngredients(show => !show)}
            aria-expanded={showIngredients}
            className="bg-card hover:bg-card/70"
          >
            {showIngredients ? 'Back to the step' : 'Check ingredients'}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <div
            role="progressbar"
            aria-label="Recipe progress"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={index + 1}
            className="h-2.5 overflow-hidden rounded-full bg-card"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {showIngredients ? (
          <RecipeIngredientsList
            ingredients={ingredients}
            multiplier={multiplier}
            showScaleControls={false}
          />
        ) : (
          <>
            <div
              aria-live="polite"
              className="flex min-h-72 flex-col gap-4 rounded-[2rem] bg-tile-mint p-6 text-tile-foreground"
            >
              <p className="font-display text-2xl">
                Step <span className="text-6xl">{index + 1}</span> of {total}
              </p>
              <p className="text-2xl font-semibold leading-snug">{steps[index]}</p>
            </div>

            {nextStep && (
              <div className="flex flex-col gap-1.5 rounded-3xl bg-card px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Up next
                </p>
                <p className="font-medium leading-relaxed">{nextStep}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-2xl gap-2.5 px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          disabled={isFirst}
          className="h-16 flex-1 bg-card hover:bg-card/70"
        >
          Back
        </Button>
        {isLast ? (
          <Button size="lg" onClick={onClose} className="h-16 flex-[2]">
            Done
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => {
              setShowIngredients(false);
              setIndex(i => Math.min(total - 1, i + 1));
            }}
            className="h-16 flex-[2]"
          >
            Next step
          </Button>
        )}
      </div>
    </div>
  );
}
