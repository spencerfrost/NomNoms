import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function LoadingDots({
  size = 'medium',
  className
}: LoadingDotsProps) {
  const dotSizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2', 
    large: 'w-3 h-3'
  }

  return (
    <div className={cn("flex space-x-1", className)}>
      <div 
        className={cn(
          "rounded-full bg-primary animate-pulse",
          dotSizeClasses[size]
        )} 
        style={{ animationDelay: '0ms' }} 
      />
      <div 
        className={cn(
          "rounded-full bg-primary animate-pulse",
          dotSizeClasses[size]
        )} 
        style={{ animationDelay: '150ms' }} 
      />
      <div 
        className={cn(
          "rounded-full bg-primary animate-pulse",
          dotSizeClasses[size]
        )} 
        style={{ animationDelay: '300ms' }} 
      />
    </div>
  )
}
