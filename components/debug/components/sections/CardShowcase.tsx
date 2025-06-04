'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComponentSection } from '../ComponentSection';
import { Heart, Share2, Clock, Users, Star } from 'lucide-react';

export function CardShowcase() {
  const codeExample = `import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Basic Card
<Card>
  <CardHeader>
    <CardTitle>Recipe Title</CardTitle>
    <CardDescription>A delicious recipe</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`;

  return (
    <ComponentSection
      title="Card"
      description="Display content in a card layout with optional header, content, and footer sections."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Basic Cards */}
        <div>
          <h4 className="font-medium mb-4">Basic Cards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a basic card with minimal content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card with Description</CardTitle>
                <CardDescription>This card includes a description below the title.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Main content goes here.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
                <CardDescription>This card has actions in the footer.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Content with footer actions below.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Recipe Cards */}
        <div>
          <h4 className="font-medium mb-4">Recipe Card Examples</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden pt-0">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-orange-600 text-sm">Recipe Image</span>
              </div>
              <CardHeader>
                <CardTitle>Spaghetti Carbonara</CardTitle>
                <CardDescription>
                  Classic Italian pasta dish with eggs, cheese, and pancetta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
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
                <div className="flex gap-1">
                  <Badge variant="secondary">Italian</Badge>
                  <Badge variant="secondary">Pasta</Badge>
                  <Badge variant="outline">Quick</Badge>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button size="sm" className="ml-auto">
                  View Recipe
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Tomato Soup</CardTitle>
                <CardDescription>Comforting soup ready in just 15 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Prep Time</span>
                    <span className="text-sm font-medium">5 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cook Time</span>
                    <span className="text-sm font-medium">10 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Servings</span>
                    <span className="text-sm font-medium">2-3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Difficulty</span>
                    <Badge variant="secondary">Easy</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Start Cooking</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Different Layouts */}
        <div>
          <h4 className="font-medium mb-4">Different Layouts</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Horizontal Card */}
            <Card className="h-fit py-0">
              <div className="flex">
                <div className="h-full aspect-square bg-primary-200 flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">Image</span>
                </div>
                <div className="flex-1 p-4">
                  <h5 className="font-semibold mb-1">Horizontal Layout</h5>
                  <p className="text-sm text-muted-foreground mb-2">Card with side image layout</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Tag
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recipe Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">127</div>
                    <div className="text-xs text-muted-foreground">Total Recipes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">45</div>
                    <div className="text-xs text-muted-foreground">Favorites</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">892</div>
                    <div className="text-xs text-muted-foreground">Total Cooks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">4.8</div>
                    <div className="text-xs text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactive Cards */}
        <div>
          <h4 className="font-medium mb-4">Interactive Elements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Clickable Card</CardTitle>
                <CardDescription>This entire card is clickable with hover effects</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Card with Actions</CardTitle>
                <CardDescription>Multiple interactive elements within the card</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
