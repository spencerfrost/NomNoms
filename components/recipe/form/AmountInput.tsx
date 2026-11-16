'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  type AmountRange,
  formatAmountInput,
  isSameAmount,
  parseAmountRange,
} from '@/lib/amount-utils';

interface AmountInputProps {
  value: AmountRange;
  onChange: (value: AmountRange) => void;
  className?: string;
}

/**
 * Text field for an ingredient amount: "2", "1 1/2", "½", or a range like "2-3".
 *
 * Keeps what was typed as a draft, so "1 " or "2-" aren't reformatted mid-typing, and
 * reports every parse to the parent. Text that isn't an amount is reported as "no amount"
 * and flagged until fixed. On blur, a valid draft is rewritten in the standard form.
 */
export function AmountInput({ value, onChange, className }: AmountInputProps) {
  const [draft, setDraft] = useState(() => ({ text: formatAmountInput(value), value }));

  // The parent changed the amount (an import, a removed row shifting up): show the new one.
  if (!isSameAmount(draft.value, value)) {
    setDraft({ text: formatAmountInput(value), value });
  }

  const invalid = parseAmountRange(draft.text) === null;

  return (
    <Input
      value={draft.text}
      onChange={e => {
        const text = e.target.value;
        const next = parseAmountRange(text) ?? { amount: 0 };
        setDraft({ text, value: next });
        onChange(next);
      }}
      onBlur={() => {
        if (!invalid) setDraft(d => ({ ...d, text: formatAmountInput(d.value) }));
      }}
      placeholder="Amount"
      autoComplete="off"
      aria-invalid={invalid || undefined}
      title={invalid ? 'Use a number like 2, 1 1/2 or ½, or a range like 2-3' : undefined}
      className={cn(className, invalid && 'border-destructive')}
    />
  );
}
