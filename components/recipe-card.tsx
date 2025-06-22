import Link from 'next/link';
import Image from 'next/image';
import { Recipe } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { Edit } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface RecipeCardProps {
  readonly recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { data: session } = useSession();
  const canEdit = session?.user?.id && recipe.author?.id === session.user.id;
  return (
    <div className="relative group">
      <Link href={`/recipes/${recipe.slug}`}>
        <Card className="h-full transition-colors bg-transparent cursor-pointer overflow-hidden pt-0">
          {recipe.image ? (
            <div className="relative aspect-video w-full">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
            <CardDescription className="line-clamp-3">{recipe.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.yield}</span>
              </div>
              {recipe.prepTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.prepTime}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
      {canEdit && (
        <Link href={`/recipes/${recipe.slug}/edit`} className="absolute top-2 right-2 z-10">
          <button
            type="button"
            aria-label="Edit Recipe"
            className="bg-white rounded-full shadow p-1 hover:bg-gray-100 focus:outline-none"
          >
            <Edit className="h-5 w-5 text-primary" />
          </button>
        </Link>
      )}
    </div>
  );
}
