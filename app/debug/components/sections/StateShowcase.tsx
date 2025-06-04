"use client";

import { 
  ErrorMessage, 
  NotFound, 
  EmptyState, 
  SuccessMessage,
  StateWrapper 
} from "@/components/common";
import { ComponentSection } from "../ComponentSection";

export function StateShowcase() {
  const codeExample = `import { 
  ErrorMessage, 
  NotFound, 
  EmptyState, 
  SuccessMessage,
  StateWrapper 
} from "@/components/common";

// Error Message
<ErrorMessage 
  variant="banner"
  title="Something went wrong"
  message="Failed to load recipes."
  action={{ label: "Retry", onClick: () => {} }}
  dismissible
/>

// Empty State
<EmptyState 
  title="No recipes yet"
  description="Start building your recipe collection."
  action={{ label: "Add Recipe", onClick: () => {} }}
/>

// State Wrapper
<StateWrapper
  loading={false}
  error={null}
  empty={items.length === 0}
>
  {/* Your content */}
</StateWrapper>`;

  return (
    <ComponentSection
      title="State Components"
      description="Standardized components for handling different application states."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Error Messages */}
        <div>
          <h4 className="font-medium mb-4">Error Messages</h4>
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium mb-3">Inline Error</h5>
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
              <h5 className="text-sm font-medium mb-3">Banner Error</h5>
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
              <h5 className="text-sm font-medium mb-3">Card Error</h5>
              <ErrorMessage 
                variant="card"
                title="Failed to Load Recipes"
                message="We couldn't load your recipes. This might be due to network issues or server problems."
                action={{
                  label: "Reload Page",
                  onClick: () => window.location.reload()
                }}
                dismissible
                onDismiss={() => alert("Dismissed")}
              />
            </div>
          </div>
        </div>

        {/* Success Messages */}
        <div>
          <h4 className="font-medium mb-4">Success Messages</h4>
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium mb-3">Banner Success</h5>
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
              <h5 className="text-sm font-medium mb-3">Card Success</h5>
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
          </div>
        </div>

        {/* Empty States */}
        <div>
          <h4 className="font-medium mb-4">Empty States</h4>
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium mb-3">No Recipes</h5>
              <div className="border p-6">
                <EmptyState 
                  title="No recipes yet"
                  description="Start building your recipe collection by adding your first recipe."
                  action={{
                    label: "Add Your First Recipe",
                    onClick: () => alert("Adding recipe...")
                  }}
                />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-3">No Search Results</h5>
              <div className="border  p-6">
                <EmptyState 
                  title="No recipes found"
                  description="Try adjusting your search terms or browse our featured recipes."
                  action={{
                    label: "Clear Search",
                    onClick: () => alert("Clearing search...")
                  }}
                />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-3">No Favorites</h5>
              <div className="border  p-6">
                <EmptyState 
                  title="No favorite recipes"
                  description="Start favoriting recipes you love to see them here."
                  action={{
                    label: "Browse Recipes",
                    onClick: () => alert("Browsing recipes...")
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Not Found */}
        <div>
          <h4 className="font-medium mb-4">Not Found</h4>
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium mb-3">Recipe Not Found</h5>
              <div className="border  p-6">
                <NotFound 
                  title="Recipe Not Found"
                  message="The recipe you're looking for doesn't exist or has been removed."
                  backButtonText="Back to Recipes"
                  backButtonUrl="#"
                  className="min-h-0"
                />
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-3">Page Not Found</h5>
              <div className="border  p-6">
                <NotFound 
                  title="Page Not Found"
                  message="The page you're looking for doesn't exist."
                  backButtonText="Go Home"
                  backButtonUrl="#"
                  className="min-h-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* State Wrapper Examples */}
        <div>
          <h4 className="font-medium mb-4">State Wrapper</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium mb-3">Loading State</h5>
              <div className="border  p-4">
                <StateWrapper
                  loading={true}
                  error={null}
                  loadingText="Loading recipes..."
                >
                  <p>This content won't show while loading</p>
                </StateWrapper>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-3">Error State</h5>
              <div className="border  p-4">
                <StateWrapper
                  loading={false}
                  error="Failed to load recipes"
                  errorAction={{
                    label: "Retry",
                    onClick: () => alert("Retrying...")
                  }}
                >
                  <p>This content won't show when there's an error</p>
                </StateWrapper>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-3">Empty State</h5>
              <div className="border  p-4">
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
                  <p>This content won't show when empty</p>
                </StateWrapper>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-3">Success State</h5>
              <div className="border  p-4">
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
          </div>
        </div>

        {/* Real-world Examples */}
        <div>
          <h4 className="font-medium mb-4">Real-world Examples</h4>
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium mb-3">Recipe List with State Wrapper</h5>
              <div className="border  p-4">
                <StateWrapper
                  loading={false}
                  error={null}
                  empty={false}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border ">
                      <div className="w-12 h-12 bg-orange-100  flex items-center justify-center">
                        🍝
                      </div>
                      <div>
                        <h6 className="font-medium">Spaghetti Carbonara</h6>
                        <p className="text-sm text-muted-foreground">25 min • 4 servings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border ">
                      <div className="w-12 h-12 bg-yellow-100  flex items-center justify-center">
                        🍪
                      </div>
                      <div>
                        <h6 className="font-medium">Chocolate Chip Cookies</h6>
                        <p className="text-sm text-muted-foreground">30 min • 24 cookies</p>
                      </div>
                    </div>
                  </div>
                </StateWrapper>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-3">Recipe Import Status</h5>
              <div className="space-y-3">
                <SuccessMessage 
                  variant="banner"
                  title="Import Successful"
                  message="Successfully imported 5 recipes from your backup file."
                  action={{
                    label: "View Imported",
                    onClick: () => alert("Viewing imported recipes...")
                  }}
                />
                
                <ErrorMessage 
                  variant="inline"
                  message="Failed to import 2 recipes due to invalid format."
                  action={{
                    label: "View Details",
                    onClick: () => alert("Showing import details...")
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
