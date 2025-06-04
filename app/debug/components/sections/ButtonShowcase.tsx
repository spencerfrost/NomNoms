'use client';

import { Button } from '@/components/ui/button';
import { ComponentSection } from '../ComponentSection';
import { Download, Plus, Trash2, Settings, ArrowRight, Heart, ExternalLink } from 'lucide-react';

export function ButtonShowcase() {
  const codeExample = `import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus className="h-4 w-4" /></Button>

// With icons
<Button className="gap-2">
  <Download className="h-4 w-4" />
  Download
</Button>`;

  return (
    <ComponentSection
      title="Button"
      description="Trigger an action or event, such as submitting a form or displaying a dialog."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Variants */}
        <div>
          <h4 className="font-medium mb-4">Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h4 className="font-medium mb-4">Sizes</h4>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* With Icons */}
        <div>
          <h4 className="font-medium mb-4">With Icons</h4>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Recipe
            </Button>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button variant="secondary" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="gap-2">
              View Recipe
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="link" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              External Link
            </Button>
          </div>
        </div>

        {/* States */}
        <div>
          <h4 className="font-medium mb-4">States</h4>
          <div className="flex flex-wrap gap-3">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button className="gap-2">
              <Heart className="h-4 w-4 animate-pulse" />
              Loading
            </Button>
          </div>
        </div>

        {/* Usage Examples */}
        <div>
          <h4 className="font-medium mb-4">Common Usage Patterns</h4>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Recipe</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm">
                Delete
              </Button>
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
