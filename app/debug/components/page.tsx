"use client";

import { 
  LoadingSpinner, 
  LoadingDots,
  ErrorMessage, 
  NotFound, 
  EmptyState, 
  SuccessMessage,
  StateWrapper 
} from "@/components/common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function ComponentShowcasePage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Common Components Showcase</h1>
        <p className="text-muted-foreground">
          Demonstrating the standardized loading, error, and state components.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Loading Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-4">Spinner</h4>
                <div className="space-y-4 text-center">
                  <LoadingSpinner size="small" text="Small" />
                  <LoadingSpinner size="medium" text="Medium" />
                  <LoadingSpinner size="large" text="Large" />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Progress Bar</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">Indeterminate</p>
                    <Progress className="w-full" />
                  </div>
                  <div>
                    <p className="text-sm mb-2">33% Complete</p>
                    <Progress value={33} className="w-full" />
                  </div>
                  <div>
                    <p className="text-sm mb-2">75% Complete</p>
                    <Progress value={75} className="w-full" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Loading Dots</h4>
                <div className="space-y-4 text-center">
                  <div>
                    <p className="text-sm mb-2">Small</p>
                    <LoadingDots size="small" />
                  </div>
                  <div>
                    <p className="text-sm mb-2">Medium</p>
                    <LoadingDots size="medium" />
                  </div>
                  <div>
                    <p className="text-sm mb-2">Large</p>
                    <LoadingDots size="large" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeletons */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Skeletons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Recipe Card Skeleton</h4>
                <Card className="h-full overflow-hidden">
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
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">List Skeleton</h4>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded">
                      <Skeleton className="w-12 h-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Text Skeleton</h4>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full last:w-2/3" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Error Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Inline Error</h4>
              <ErrorMessage 
                variant="inline"
                message="This is an inline error message with action."
                action={{
                  label: "Retry",
                  onClick: () => alert("Retrying...")
                }}
                dismissible
                onDismiss={() => alert("Dismissed")}
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Banner Error</h4>
              <ErrorMessage 
                variant="banner"
                title="Something went wrong"
                message="This is a banner-style error message with more details."
                action={{
                  label: "Try Again",
                  onClick: () => alert("Trying again...")
                }}
                dismissible
                onDismiss={() => alert("Dismissed")}
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Card Error</h4>
              <ErrorMessage 
                variant="card"
                title="Failed to Load Data"
                message="We couldn't load the requested data. This might be due to network issues or server problems."
                action={{
                  label: "Reload Page",
                  onClick: () => window.location.reload()
                }}
                dismissible
                onDismiss={() => alert("Dismissed")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Success Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Success Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Banner Success</h4>
              <SuccessMessage 
                variant="banner"
                title="Recipe Saved"
                message="Your recipe has been successfully saved to your collection."
                action={{
                  label: "View Recipe",
                  onClick: () => alert("Viewing recipe...")
                }}
                onClose={() => alert("Closed")}
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Card Success</h4>
              <SuccessMessage 
                variant="card"
                title="Account Created"
                message="Welcome to NomNoms! Your account has been created successfully."
                action={{
                  label: "Get Started",
                  onClick: () => alert("Getting started...")
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Empty States */}
        <Card>
          <CardHeader>
            <CardTitle>Empty States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">No Recipes</h4>
              <EmptyState 
                title="No recipes yet"
                description="Start building your recipe collection by adding your first recipe."
                action={{
                  label: "Add Your First Recipe",
                  onClick: () => alert("Adding recipe...")
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Not Found */}
        <Card>
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6">
              <NotFound 
                title="Recipe Not Found"
                message="The recipe you're looking for doesn't exist or has been removed."
                backButtonText="Back to Recipes"
                backButtonUrl="#"
                className="min-h-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* State Wrapper Examples */}
        <Card>
          <CardHeader>
            <CardTitle>State Wrapper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Loading State</h4>
                <StateWrapper
                  loading={true}
                  error={null}
                  loadingText="Loading recipes..."
                >
                  <p>This content won't show</p>
                </StateWrapper>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Error State</h4>
                <StateWrapper
                  loading={false}
                  error="Failed to load recipes"
                  errorAction={{
                    label: "Retry",
                    onClick: () => alert("Retrying...")
                  }}
                >
                  <p>This content won't show</p>
                </StateWrapper>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Empty State</h4>
                <StateWrapper
                  loading={false}
                  error={null}
                  empty={true}
                  emptyTitle="No items"
                  emptyDescription="Add some items to get started."
                  emptyAction={{
                    label: "Add Item",
                    onClick: () => alert("Adding item...")
                  }}
                >
                  <p>This content won't show</p>
                </StateWrapper>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Success State</h4>
                <StateWrapper
                  loading={false}
                  error={null}
                  empty={false}
                >
                  <div className="text-center">
                    <p className="text-green-600 font-medium">✓ Content loaded successfully!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This shows when everything is working.
                    </p>
                  </div>
                </StateWrapper>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toast Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications (Sonner)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => toast.success("Recipe saved successfully!")}
              >
                Success Toast
              </Button>
              <Button 
                variant="destructive"
                onClick={() => toast.error("Failed to delete recipe")}
              >
                Error Toast
              </Button>
              <Button 
                variant="outline"
                onClick={() => toast.info("Recipe shared with 3 friends")}
              >
                Info Toast
              </Button>
              <Button 
                variant="secondary"
                onClick={() => toast.loading("Importing recipe...", { id: "import" })}
              >
                Loading Toast
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  toast.success("Import completed!", { id: "import" })
                }}
              >
                Update Loading Toast
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  toast("Custom message", {
                    description: "With description and action",
                    action: {
                      label: "View",
                      onClick: () => toast.success("Action clicked!")
                    }
                  })
                }}
              >
                Custom Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
