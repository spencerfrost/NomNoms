"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ComponentSection } from "../ComponentSection";
import { Trash2, LogOut, Download, Share2, AlertTriangle, Info } from "lucide-react";

export function DialogShowcase() {
  const codeExample = `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Recipe</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the recipe.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`;

  return (
    <ComponentSection
      title="Alert Dialog"
      description="A modal dialog that interrupts the user with important content and expects a response."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Basic Dialogs */}
        <div>
          <h4 className="font-medium mb-4">Basic Dialogs</h4>
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Recipe
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the recipe
                    &ldquo;Chocolate Chip Cookies&rdquo; from your collection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You&apos;ll need to sign in again to access your recipes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Sign Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Different Actions */}
        <div>
          <h4 className="font-medium mb-4">Different Action Types</h4>
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Export Recipe Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will download all your recipes as a JSON file. The file will include recipe details,
                    ingredients, and instructions but not images.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Recipe
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Share &ldquo;Spaghetti Carbonara&rdquo;</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will make your recipe public and generate a shareable link. Anyone with the link
                    will be able to view and copy this recipe.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Private</AlertDialogCancel>
                  <AlertDialogAction className="bg-green-600 hover:bg-green-700">
                    <Share2 className="mr-2 h-4 w-4" />
                    Make Public
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Warning Dialogs */}
        <div>
          <h4 className="font-medium mb-4">Warning Dialogs</h4>
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-yellow-300 text-yellow-700">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Unsaved Changes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    You have unsaved changes to this recipe. If you leave now, your changes will be lost.
                    Would you like to save your changes first?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                  <Button variant="outline" className="mr-2">
                    Discard Changes
                  </Button>
                  <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
                    Save & Exit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-orange-300 text-orange-700">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Storage Full
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <AlertDialogTitle>Storage Limit Reached</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    You&apos;ve reached your storage limit of 50 recipes. To add more recipes, you&apos;ll need to
                    upgrade to a premium plan or delete some existing recipes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                  <Button variant="outline" className="mr-2">
                    Manage Recipes
                  </Button>
                  <AlertDialogAction className="bg-purple-600 hover:bg-purple-700">
                    Upgrade Plan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Information Dialogs */}
        <div>
          <h4 className="font-medium mb-4">Information Dialogs</h4>
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Info className="mr-2 h-4 w-4" />
                  Recipe Tips
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <AlertDialogTitle>Cooking Tips</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    <div className="space-y-2 mt-2">
                      <p className="font-medium">For the best Spaghetti Carbonara:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Use room temperature eggs to prevent scrambling</li>
                        <li>Reserve pasta water before draining</li>
                        <li>Work quickly when combining ingredients</li>
                        <li>Serve immediately for best texture</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Got It</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  Import Complete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Import Successful!</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-2 mt-2">
                      <p>Successfully imported 3 recipes:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Chocolate Chip Cookies</li>
                        <li>Banana Bread</li>
                        <li>Apple Pie</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        You can find them in your recipe collection.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  <AlertDialogAction>View Recipes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Complex Actions */}
        <div>
          <h4 className="font-medium mb-4">Complex Action Dialogs</h4>
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600">⚠️ Clear All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-3">
                      <p className="font-medium text-red-800">
                        This action cannot be undone and will permanently delete:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>All your recipes (127 recipes)</li>
                        <li>Favorites and collections</li>
                        <li>Meal plans and shopping lists</li>
                        <li>Recipe photos and notes</li>
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Consider exporting your data first as a backup.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button variant="outline" className="mr-2">
                    <Download className="mr-2 h-4 w-4" />
                    Export First
                  </Button>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  Upgrade Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Upgrade to Premium</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-3">
                      <p>Unlock all premium features:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Unlimited recipes</li>
                        <li>Advanced meal planning</li>
                        <li>Recipe collaboration</li>
                        <li>Priority support</li>
                      </ul>
                      <p className="text-lg font-semibold">$9.99/month</p>
                      <p className="text-sm text-muted-foreground">
                        Cancel anytime. 14-day free trial included.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                  <Button variant="outline" className="mr-2">
                    Learn More
                  </Button>
                  <AlertDialogAction className="bg-purple-600 hover:bg-purple-700">
                    Start Free Trial
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
