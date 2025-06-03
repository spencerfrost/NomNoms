import * as React from "react"
import { LoadingSpinner } from "./LoadingSpinner"
import { ErrorMessage } from "./ErrorMessage"
import { EmptyState } from "./EmptyState"

interface StateWrapperProps {
  loading: boolean
  error?: string | null
  empty?: boolean
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  loadingText?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
  errorAction?: {
    label: string
    onClick: () => void
  }
}

export function StateWrapper({
  loading,
  error,
  empty = false,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  loadingText = "Loading...",
  emptyTitle = "No items found",
  emptyDescription = "There are no items to display.",
  emptyAction,
  errorAction
}: StateWrapperProps) {
  if (loading) {
    return (
      <>
        {loadingComponent || (
          <LoadingSpinner
            text={loadingText}
            size="medium"
            fullScreen
          />
        )}
      </>
    )
  }

  if (error) {
    return (
      <>
        {errorComponent || (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <ErrorMessage
                variant="card"
                title="Something went wrong"
                message={error}
                action={errorAction}
              />
            </div>
          </div>
        )}
      </>
    )
  }

  if (empty) {
    return (
      <>
        {emptyComponent || (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        )}
      </>
    )
  }

  return <>{children}</>
}
