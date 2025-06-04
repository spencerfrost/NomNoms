import { CheckCircle } from 'lucide-react';

interface EndOfResultsProps {
  count: number;
}

export function EndOfResults({ count }: EndOfResultsProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-500" />
      <p className="text-lg font-medium mb-1">You&apos;ve seen all recipes!</p>
      <p className="text-sm">
        {count > 0 ? `Showing all ${count} recipe${count === 1 ? '' : 's'}` : 'No recipes found'}
      </p>
    </div>
  );
}
