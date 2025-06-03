import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon = <Package className="h-16 w-16 text-muted-foreground" />,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "text-center py-12 px-4",
      className
    )}>
      <div className="mb-6 flex justify-center">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      
      <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant === 'secondary' ? 'outline' : 'default'}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
