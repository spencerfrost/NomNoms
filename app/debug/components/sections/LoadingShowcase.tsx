"use client";

import { 
  LoadingSpinner, 
  LoadingDots 
} from "@/components/common";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ComponentSection } from "../ComponentSection";

export function LoadingShowcase() {
  const codeExample = `import { LoadingSpinner, LoadingDots } from "@/components/common";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Loading Spinner
<LoadingSpinner size="medium" text="Loading recipes..." />

// Loading Dots
<LoadingDots size="medium" />

// Progress Bar
<Progress value={65} className="w-full" />

// Skeleton Loading
<Skeleton className="h-4 w-full" />`;

  return (
    <ComponentSection
      title="Loading Components"
      description="Various loading indicators and skeleton screens for different states."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Loading Spinners */}
        <div>
          <h4 className="font-medium mb-4">Loading Spinners</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h5 className="text-sm font-medium mb-4">Small</h5>
              <LoadingSpinner size="small" text="Loading..." />
            </div>
            <div className="text-center">
              <h5 className="text-sm font-medium mb-4">Medium</h5>
              <LoadingSpinner size="medium" text="Loading recipes..." />
            </div>
            <div className="text-center">
              <h5 className="text-sm font-medium mb-4">Large</h5>
              <LoadingSpinner size="large" text="Importing recipes..." />
            </div>
          </div>
        </div>

        {/* Loading Dots */}
        <div>
          <h4 className="font-medium mb-4">Loading Dots</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h5 className="text-sm font-medium mb-4">Small</h5>
              <LoadingDots size="small" />
            </div>
            <div>
              <h5 className="text-sm font-medium mb-4">Medium</h5>
              <LoadingDots size="medium" />
            </div>
            <div>
              <h5 className="text-sm font-medium mb-4">Large</h5>
              <LoadingDots size="large" />
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div>
          <h4 className="font-medium mb-4">Progress Bars</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Indeterminate</span>
                <span>Loading...</span>
              </div>
              <Progress className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Recipe Import</span>
                <span>25%</span>
              </div>
              <Progress value={25} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Photo Upload</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Recipe Processing</span>
                <span>90%</span>
              </div>
              <Progress value={90} className="w-full" />
            </div>
          </div>
        </div>

        {/* Skeleton Screens */}
        <div>
          <h4 className="font-medium mb-4">Loading Skeletons</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recipe Card Skeleton */}
            <div>
              <h5 className="text-sm font-medium mb-3">Recipe Card</h5>
              <Card className="overflow-hidden pt-0">
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recipe List Skeleton */}
            <div>
              <h5 className="text-sm font-medium mb-3">Recipe List</h5>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border ">
                    <Skeleton className="w-16 h-16 " />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Text Skeletons */}
        <div>
          <h4 className="font-medium mb-4">Text Skeletons</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium mb-2">Paragraph</h5>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-2">Recipe Instructions</h5>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-2">Ingredient List</h5>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 " />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Complex Layout Skeleton */}
        <div>
          <h4 className="font-medium mb-4">Recipe Detail Page</h4>
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Image */}
            <Skeleton className="aspect-video w-full " />

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-4 h-4 " />
                        <Skeleton className="h-3 flex-1" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Skeleton className="h-6 w-28 mb-3" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
