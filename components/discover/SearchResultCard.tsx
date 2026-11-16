'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { shouldSkipOptimization } from '@/lib/image-hosts';
import type { AnnotatedSearchResult } from '@/lib/recipe-search-types';

interface SearchResultCardProps {
  result: AnnotatedSearchResult;
  selected?: boolean;
  onSelect: (result: AnnotatedSearchResult) => void;
}

export default function SearchResultCard({ result, selected, onSelect }: SearchResultCardProps) {
  return (
    <li
      className={`flex gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(result)}
        className="flex flex-1 min-w-0 gap-3 text-left"
        aria-label={`Preview ${result.title}`}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
          {result.thumbnail ? (
            <Image
              src={result.thumbnail}
              unoptimized={shouldSkipOptimization(result.thumbnail)}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <ChefHat className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{result.site}</p>
          <p className="font-medium leading-snug line-clamp-2">{result.title}</p>
          {result.snippet && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{result.snippet}</p>
          )}
        </div>
      </button>
      {result.savedSlug && (
        <Link
          href={`/recipes/${encodeURIComponent(result.savedSlug)}`}
          className="self-start shrink-0"
          aria-label={`${result.title} is saved. View recipe`}
        >
          <Badge variant="secondary" className="gap-1">
            <Check className="h-3 w-3" />
            Saved
          </Badge>
        </Link>
      )}
    </li>
  );
}
