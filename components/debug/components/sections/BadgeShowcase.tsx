'use client';

import { Badge } from '@/components/ui/badge';
import { ComponentSection } from '../ComponentSection';
import { Clock, Users, Star, Flame, Leaf } from 'lucide-react';

export function BadgeShowcase() {
  const codeExample = `import { Badge } from "@/components/ui/badge";

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

// With icons
<Badge className="gap-1">
  <Clock className="h-3 w-3" />
  30 min
</Badge>`;

  return (
    <ComponentSection
      title="Badge"
      description="Display a badge or a component that looks like a badge."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Variants */}
        <div>
          <h4 className="font-medium mb-4">Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        {/* With Icons */}
        <div>
          <h4 className="font-medium mb-4">With Icons</h4>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              30 min
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />4 servings
            </Badge>
            <Badge variant="default" className="gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
            <Badge variant="destructive" className="gap-1">
              <Flame className="h-3 w-3" />
              Spicy
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Leaf className="h-3 w-3" />
              Vegetarian
            </Badge>
          </div>
        </div>

        {/* Different Content Types */}
        <div>
          <h4 className="font-medium mb-4">Content Types</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Numbers & Counts</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">12</Badge>
                <Badge variant="outline">4.8★</Badge>
                <Badge variant="default">New</Badge>
                <Badge variant="secondary">127 reviews</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Status & Categories</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Published</Badge>
                <Badge variant="secondary">Draft</Badge>
                <Badge variant="destructive">Archived</Badge>
                <Badge variant="outline">Private</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Recipe Tags</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Italian</Badge>
                <Badge variant="secondary">Pasta</Badge>
                <Badge variant="outline">Quick</Badge>
                <Badge variant="outline">Easy</Badge>
                <Badge variant="default">Favorite</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h4 className="font-medium mb-4">Different Sizes</h4>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="text-xs px-2 py-0.5">Small</Badge>
            <Badge>Default</Badge>
            <Badge className="text-sm px-3 py-1">Large</Badge>
          </div>
        </div>

        {/* Recipe Card Example */}
        <div>
          <h4 className="font-medium mb-4">Recipe Card Example</h4>
          <div className="border  p-4 max-w-sm">
            <h5 className="font-semibold mb-2">Spaghetti Carbonara</h5>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                25 min
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />4 servings
              </Badge>
              <Badge variant="default" className="gap-1">
                <Star className="h-3 w-3" />
                4.9
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary">Italian</Badge>
              <Badge variant="secondary">Pasta</Badge>
              <Badge variant="outline">Quick</Badge>
            </div>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
