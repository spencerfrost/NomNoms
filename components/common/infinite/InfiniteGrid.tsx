'use client';

import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
import { GridSkeleton } from './GridSkeleton';
import { LoadMoreButton } from './LoadMoreButton';
import { EndOfResults } from './EndOfResults';
import { ErrorMessage } from '@/components/common';
import { useEffect, useState } from 'react';

interface InfiniteGridProps<T = unknown> {
  items: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: Error | null;
  isEmpty: boolean;
  renderItem: (item: T) => React.ReactNode;
  emptyState?: {
    title: string;
    message: string;
  };
  errorState?: {
    title: string;
    message: string;
  };
}

export function InfiniteGrid<T = unknown>({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  error,
  isEmpty,
  renderItem,
  emptyState = {
    title: 'No items found',
    message: 'No items available',
  },
  errorState = {
    title: 'Failed to load items',
    message: 'There was an error loading the items. Please refresh the page and try again.',
  },
}: InfiniteGridProps<T>) {
  const [useIntersectionObserver, setUseIntersectionObserver] = useState(true);

  // Check if Intersection Observer is supported
  useEffect(() => {
    setUseIntersectionObserver(typeof window !== 'undefined' && 'IntersectionObserver' in window);
  }, []);

  // Show loading skeleton on initial load
  if (isLoading) {
    return <GridSkeleton count={24} />;
  }

  // Show error state
  if (error) {
    return <ErrorMessage title={errorState.title} message={errorState.message} />;
  }

  // Show empty state
  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">{emptyState.title}</h3>
        <p className="text-muted-foreground">{emptyState.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => renderItem(item))}
      </div>

      {/* Loading more skeletons */}
      {isLoadingMore && <GridSkeleton count={8} />}

      {/* Infinite scroll trigger or load more button */}
      {hasMore ? (
        useIntersectionObserver ? (
          <InfiniteScrollTrigger onIntersect={loadMore} disabled={isLoadingMore} />
        ) : (
          <LoadMoreButton onClick={loadMore} isLoading={isLoadingMore} />
        )
      ) : (
        <EndOfResults count={items.length} />
      )}
    </div>
  );
}
