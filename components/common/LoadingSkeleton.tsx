import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  variant: 'card' | 'recipe' | 'list' | 'text'
  count?: number
  className?: string
}

export function LoadingSkeleton({
  variant,
  count = 1,
  className
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className="h-full overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-video w-full bg-muted animate-pulse" />
            <CardHeader>
              {/* Title skeleton */}
              <div className="h-6 bg-muted animate-pulse mb-2" />
              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse w-full" />
                <div className="h-4 bg-muted animate-pulse w-2/3" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Tags skeleton */}
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-16 bg-muted animate-pulse" />
                <div className="h-5 w-20 bg-muted animate-pulse" />
                <div className="h-5 w-14 bg-muted animate-pulse" />
              </div>
              {/* Meta info skeleton */}
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-muted animate-pulse" />
                <div className="h-4 w-16 bg-muted animate-pulse" />
              </div>
            </CardContent>
          </Card>
        )

      case 'recipe':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse w-full" />
                <div className="h-4 bg-muted animate-pulse w-5/6" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-muted animate-pulse" />
                <div className="h-4 w-16 bg-muted animate-pulse" />
                <div className="h-4 w-18 bg-muted animate-pulse" />
              </div>
            </div>
            
            {/* Image skeleton */}
            <div className="aspect-video w-full bg-muted animate-pulse" />
            
            {/* Ingredients skeleton */}
            <div className="space-y-3">
              <div className="h-6 bg-muted animate-pulse w-32" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse w-full" />
                ))}
              </div>
            </div>
            
            {/* Instructions skeleton */}
            <div className="space-y-3">
              <div className="h-6 bg-muted animate-pulse w-32" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse w-full" />
                    <div className="h-4 bg-muted animate-pulse w-4/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'list':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border">
                <div className="w-12 h-12 bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse w-3/4" />
                  <div className="h-3 bg-muted animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )

      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className={cn(
                "h-4 bg-muted animate-pulse",
                i === count - 1 ? 'w-2/3' : 'w-full'
              )} />
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={className}>
      {variant === 'card' || variant === 'recipe' 
        ? Array.from({ length: count }).map((_, i) => (
            <div key={i} className={count > 1 ? 'mb-6' : ''}>
              {renderSkeleton()}
            </div>
          ))
        : renderSkeleton()
      }
    </div>
  )
}
