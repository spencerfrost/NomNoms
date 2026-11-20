import { Skeleton } from '@/components/ui/skeleton';

interface GridSkeletonProps {
  count?: number;
}

/** Same palette as RecipeCard tiles, faded so the cards still read as placeholders. */
const SKELETON_TILE_COLORS = [
  'bg-tile-mango/35',
  'bg-tile-pink/35',
  'bg-tile-mint/35',
  'bg-tile-sky/35',
] as const;

export function GridSkeleton({ count = 8 }: GridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`flex flex-col gap-2.5 rounded-3xl p-2 ${SKELETON_TILE_COLORS[index % SKELETON_TILE_COLORS.length]}`}
        >
          <Skeleton className="aspect-square w-full bg-white/40" />
          {/* space-y-3 makes this 80px tall, the same as a real card's two-line title plus yield */}
          <div className="space-y-3 px-1.5 pb-2">
            {/* Two-line title, as most recipe titles wrap to two lines */}
            <Skeleton className="h-5 w-full rounded-full bg-white/40" />
            <Skeleton className="h-5 w-2/3 rounded-full bg-white/40" />
            <Skeleton className="h-4 w-1/2 rounded-full bg-white/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
