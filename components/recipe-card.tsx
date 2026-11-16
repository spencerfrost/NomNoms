import Link from 'next/link';
import Image from 'next/image';
import { shouldSkipOptimization } from '@/lib/image-hosts';
import { Recipe } from '@/types';
import { Edit } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface RecipeCardProps {
  readonly recipe: Recipe;
}

const TILE_COLORS = ['bg-tile-mango', 'bg-tile-pink', 'bg-tile-mint', 'bg-tile-sky'] as const;

/** Picks a tile colour from the slug, so a recipe keeps its colour between visits. */
function tileColor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return TILE_COLORS[hash % TILE_COLORS.length];
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { data: session } = useSession();
  const canEdit = session?.user?.id && recipe.author?.id === session.user.id;
  const time = recipe.cookTime || recipe.prepTime;

  return (
    <div className="relative h-full">
      <Link
        href={`/recipes/${recipe.slug}`}
        className={`flex h-full flex-col gap-2.5 rounded-3xl p-2 text-tile-foreground ${tileColor(recipe.slug)}`}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white/40">
          {recipe.image ? (
            <Image
              src={recipe.image}
              unoptimized={shouldSkipOptimization(recipe.image)}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold">
              No Image
            </div>
          )}
          {time && (
            <span className="absolute left-2 top-2 rounded-full bg-[#2b1447] px-2.5 py-1 text-xs font-bold text-white">
              {time}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 px-1.5 pb-2">
          <h3 className="line-clamp-2 text-lg sm:text-xl">{recipe.title}</h3>
          {recipe.yield && <p className="line-clamp-1 text-sm font-semibold">{recipe.yield}</p>}
        </div>
      </Link>
      {canEdit && (
        <Link
          href={`/recipes/${recipe.slug}/edit`}
          aria-label="Edit Recipe"
          className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white text-[#2b1447]"
        >
          <Edit className="size-5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
