import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"

interface ErrorMessageProps {
  title?: string
  message: string
  variant?: 'inline' | 'card' | 'banner'
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorMessage({
  title = "Error",
  message,
  variant = 'inline',
  dismissible = false,
  onDismiss,
  action,
  className
}: ErrorMessageProps) {
  const renderActionButton = () => action && (
    <Button
      variant="outline"
      size="sm"
      onClick={action.onClick}
      className="text-destructive border-destructive hover:bg-destructive/10"
    >
      {action.label}
    </Button>
  )

  const renderDismissButton = () => dismissible && onDismiss && (
    <Button
      variant="ghost"
      size="sm"
      onClick={onDismiss}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Dismiss</span>
    </Button>
  )

  switch (variant) {
    case 'card':
      return (
        <Card className={cn("border-destructive/20 bg-destructive/5", className)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {title}
              {renderDismissButton()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground mb-3">{message}</p>
            {renderActionButton()}
          </CardContent>
        </Card>
      )

    case 'banner':
      return (
        <Alert variant="destructive" className={cn("", className)}>
          <AlertCircle className="h-4 w-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
              {action && (
                <div className="mt-2">
                  {renderActionButton()}
                </div>
              )}
            </div>
            {renderDismissButton()}
          </div>
        </Alert>
      )

    case 'inline':
    default:
      return (
        <Alert variant="destructive" className={cn("", className)}>
          <AlertCircle className="h-4 w-4" />
          <div className="flex items-center justify-between w-full">
            <AlertDescription className="flex items-center gap-2">
              {message}
              {action && renderActionButton()}
            </AlertDescription>
            {renderDismissButton()}
          </div>
        </Alert>
      )
  }
}
