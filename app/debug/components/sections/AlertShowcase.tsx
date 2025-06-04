"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ComponentSection } from "../ComponentSection";
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Terminal,
  Lightbulb,
  Heart,
  Clock,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AlertShowcase() {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const dismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };

  const resetAlerts = () => {
    setDismissedAlerts([]);
  };

  const codeExample = `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Basic Alert
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

// Destructive Alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>`;

  return (
    <ComponentSection
      title="Alert"
      description="Display a callout for user attention with optional title and description."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Basic Alerts */}
        <div>
          <h4 className="font-medium mb-4">Basic Alerts</h4>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is a basic informational alert with an icon and description.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again or contact support if the problem persists.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Different Icons and Contexts */}
        <div>
          <h4 className="font-medium mb-4">Different Contexts</h4>
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your recipe has been saved successfully!
              </AlertDescription>
            </Alert>

            <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This recipe contains allergens. Please check the ingredients list carefully.
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-200 bg-blue-50 text-blue-800">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertTitle>Tip</AlertTitle>
              <AlertDescription>
                For best results, let the dough rest in the refrigerator for at least 30 minutes before baking.
              </AlertDescription>
            </Alert>

            <Alert className="border-purple-200 bg-purple-50 text-purple-800">
              <Heart className="h-4 w-4 text-purple-600" />
              <AlertTitle>Pro Tip</AlertTitle>
              <AlertDescription>
                This recipe is a favorite among our community! Try adding a pinch of sea salt on top.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Alert without Title */}
        <div>
          <h4 className="font-medium mb-4">Simple Alerts (No Title)</h4>
          <div className="space-y-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                You can now run commands in your terminal to manage recipes.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to import recipe. Please check the URL and try again.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Dismissible Alerts */}
        <div>
          <h4 className="font-medium mb-4">Dismissible Alerts</h4>
          <div className="space-y-4">
            {!dismissedAlerts.includes('welcome') && (
              <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                <Info className="h-4 w-4 text-blue-600" />
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <AlertTitle>Welcome to NomNoms!</AlertTitle>
                    <AlertDescription>
                      Start by adding your first recipe or browse our featured collection.
                    </AlertDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                    onClick={() => dismissAlert('welcome')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            )}

            {!dismissedAlerts.includes('update') && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <AlertTitle>App Updated</AlertTitle>
                    <AlertDescription>
                      New features available! Check out the improved recipe scaling and meal planning tools.
                    </AlertDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
                    onClick={() => dismissAlert('update')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            )}

            {!dismissedAlerts.includes('reminder') && (
              <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <AlertTitle>Cooking Reminder</AlertTitle>
                    <AlertDescription>
                      Don&apos;t forget to preheat your oven 15 minutes before starting the recipe.
                    </AlertDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100"
                    onClick={() => dismissAlert('reminder')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            )}

            {dismissedAlerts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetAlerts}
                className="mt-2"
              >
                Reset Dismissed Alerts
              </Button>
            )}
          </div>
        </div>

        {/* Alerts with Actions */}
        <div>
          <h4 className="font-medium mb-4">Alerts with Actions</h4>
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle>Recipe Import Available</AlertTitle>
              <AlertDescription className="mb-3">
                We detected a recipe URL in your clipboard. Would you like to import it?
              </AlertDescription>
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Import Recipe
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Dismiss
                </Button>
              </div>
            </Alert>

            <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Storage Almost Full</AlertTitle>
              <AlertDescription className="mb-3">
                You&apos;ve used 90% of your recipe storage. Consider upgrading to premium for unlimited recipes.
              </AlertDescription>
              <div className="flex gap-2">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  Upgrade Now
                </Button>
                <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Manage Recipes
                </Button>
              </div>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription className="mb-3">
                Unable to sync your recipes. Check your internet connection.
              </AlertDescription>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  Retry Sync
                </Button>
                <Button variant="ghost" size="sm" className="text-red-100 hover:bg-red-800">
                  Work Offline
                </Button>
              </div>
            </Alert>
          </div>
        </div>

        {/* Inline Alerts */}
        <div>
          <h4 className="font-medium mb-4">Inline Alerts</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipe Title</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-red-300  focus:outline-none focus:ring-2 focus:ring-red-500"
                defaultValue="My Recipe"
              />
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Recipe title must be at least 3 characters long.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cooking Time</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-green-300  focus:outline-none focus:ring-2 focus:ring-green-500"
                defaultValue="30"
              />
              <Alert className="py-2 border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  Perfect! This cooking time looks realistic.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
