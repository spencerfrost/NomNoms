import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingSpinner({
  size = 'medium',
  text,
  fullScreen = false,
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      className
    )}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary",
        sizeClasses[size]
      )} />
      {text && (
        <p className={cn(
          "text-muted-foreground",
          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}
