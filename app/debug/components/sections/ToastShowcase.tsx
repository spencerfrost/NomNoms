'use client';

import { Button } from '@/components/ui/button';
import { ComponentSection } from '../ComponentSection';
import { toast } from 'sonner';
import {
  Heart,
  Share2,
  Download,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export function ToastShowcase() {
  const codeExample = `import { toast } from "sonner";

// Basic toasts
toast.success("Recipe saved successfully!");
toast.error("Failed to delete recipe");
toast.info("Recipe shared with 3 friends");
toast.warning("Storage almost full");

// Loading toast
const loadingId = toast.loading("Importing recipe...");
// Update it later
toast.success("Recipe imported!", { id: loadingId });

// Toast with action
toast("Recipe shared", {
  description: "Anyone with the link can now view this recipe",
  action: {
    label: "Copy Link",
    onClick: () => navigator.clipboard.writeText("https://...")
  }
});`;

  return (
    <ComponentSection
      title="Toast Notifications"
      description="Non-intrusive messages to communicate with users using Sonner."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Basic Toasts */}
        <div>
          <h4 className="font-medium mb-4">Basic Toast Types</h4>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => toast.success('Recipe saved successfully!')} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Success Toast
            </Button>

            <Button
              variant="destructive"
              onClick={() => toast.error('Failed to delete recipe')}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Error Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info('Recipe shared with 3 friends')}
              className="gap-2"
            >
              <Info className="h-4 w-4" />
              Info Toast
            </Button>

            <Button
              variant="secondary"
              onClick={() => toast.warning('Storage almost full (90%)')}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Warning Toast
            </Button>
          </div>
        </div>

        {/* Loading Toasts */}
        <div>
          <h4 className="font-medium mb-4">Loading Toasts</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast.loading('Importing recipe...', { id: 'import' })}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Start Loading
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.success('Import completed!', { id: 'import' })}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Loading
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.error('Import failed!', { id: 'import' })}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Fail Loading
            </Button>
          </div>
        </div>

        {/* Toast with Actions */}
        <div>
          <h4 className="font-medium mb-4">Toasts with Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                toast('Recipe shared successfully', {
                  description: 'Anyone with the link can now view this recipe',
                  action: {
                    label: 'Copy Link',
                    onClick: () => {
                      navigator.clipboard.writeText('https://nomnoms.app/recipes/carbonara');
                      toast.success('Link copied to clipboard!');
                    },
                  },
                });
              }}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share with Action
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                toast('Recipe exported', {
                  description: 'Your recipe has been saved as a PDF',
                  action: {
                    label: 'Download',
                    onClick: () => toast.info('Download started!'),
                  },
                });
              }}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export with Action
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                toast('Recipe deleted', {
                  description: 'Chocolate Chip Cookies has been removed',
                  action: {
                    label: 'Undo',
                    onClick: () => toast.success('Recipe restored!'),
                  },
                });
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete with Undo
            </Button>
          </div>
        </div>

        {/* Recipe-specific Toasts */}
        <div>
          <h4 className="font-medium mb-4">Recipe-specific Examples</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                toast.success('Added to favorites', {
                  description: 'Spaghetti Carbonara',
                  action: {
                    label: 'View Favorites',
                    onClick: () => toast.info('Navigating to favorites...'),
                  },
                });
              }}
              className="gap-2"
            >
              <Heart className="h-4 w-4" />
              Add to Favorites
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                toast('Recipe scaled', {
                  description: 'Adjusted ingredients for 8 servings',
                  action: {
                    label: 'Reset',
                    onClick: () => toast.info('Reset to 4 servings'),
                  },
                });
              }}
              className="gap-2"
            >
              Scale Recipe
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                toast('Timer started', {
                  description: 'Baking timer: 25 minutes',
                  action: {
                    label: 'View Timer',
                    onClick: () => toast.info('Opening timer...'),
                  },
                });
              }}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Start Timer
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                toast.success('Recipe imported from URL', {
                  description: 'Chocolate Chip Cookies from allrecipes.com',
                });
              }}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Success
            </Button>
          </div>
        </div>

        {/* Duration Examples */}
        <div>
          <h4 className="font-medium mb-4">Custom Duration</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast.success('Quick toast', { duration: 1000 })}
            >
              1 Second Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info('Normal toast', { duration: 4000 })}
            >
              4 Second Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.warning('Long toast', { duration: 10000 })}
            >
              10 Second Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.error('Persistent toast', { duration: Infinity })}
            >
              Persistent Toast
            </Button>
          </div>
        </div>

        {/* Complex Examples */}
        <div>
          <h4 className="font-medium mb-4">Complex Workflow Examples</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // Simulate a recipe import workflow
                const importId = toast.loading('Analyzing recipe URL...');

                setTimeout(() => {
                  toast.loading('Extracting ingredients...', { id: importId });
                }, 1000);

                setTimeout(() => {
                  toast.loading('Processing instructions...', { id: importId });
                }, 2000);

                setTimeout(() => {
                  toast.success('Recipe imported successfully!', {
                    id: importId,
                    description: 'Chocolate Chip Cookies added to your collection',
                    action: {
                      label: 'View Recipe',
                      onClick: () => toast.info('Opening recipe...'),
                    },
                  });
                }, 3000);
              }}
            >
              Full Import Workflow
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Simulate batch operations
                toast.info('Starting batch export...');

                setTimeout(() => toast.success('Exported recipe 1/5'), 500);
                setTimeout(() => toast.success('Exported recipe 2/5'), 1000);
                setTimeout(() => toast.success('Exported recipe 3/5'), 1500);
                setTimeout(() => toast.success('Exported recipe 4/5'), 2000);
                setTimeout(() => {
                  toast.success('All recipes exported!', {
                    description: '5 recipes saved to your downloads folder',
                    action: {
                      label: 'Open Folder',
                      onClick: () => toast.info('Opening downloads...'),
                    },
                  });
                }, 2500);
              }}
            >
              Batch Operations
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Simulate error recovery
                const saveId = toast.loading('Saving recipe...');

                setTimeout(() => {
                  toast.error('Save failed - connection error', {
                    id: saveId,
                    action: {
                      label: 'Retry',
                      onClick: () => {
                        const retryId = toast.loading('Retrying save...');
                        setTimeout(() => {
                          toast.success('Recipe saved successfully!', {
                            id: retryId,
                            description: 'Your changes have been saved',
                          });
                        }, 1500);
                      },
                    },
                  });
                }, 2000);
              }}
            >
              Error Recovery
            </Button>
          </div>
        </div>

        {/* Position Examples */}
        <div>
          <h4 className="font-medium mb-4">Different Positions</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast.success('Top-right toast', { position: 'top-right' })}
            >
              Top Right
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info('Top-left toast', { position: 'top-left' })}
            >
              Top Left
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.warning('Bottom-right toast', { position: 'bottom-right' })}
            >
              Bottom Right
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.error('Bottom-left toast', { position: 'bottom-left' })}
            >
              Bottom Left
            </Button>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
