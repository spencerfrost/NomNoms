'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RecipeImagePreview from './RecipeImagePreview'

interface FormData {
  title: string
  description: string
  imageUrl: string
  yield: string
  prepTime: string
  cookTime: string
  visibility: string
}

interface RecipeBasicInfoFormProps {
  formData: FormData
  onChange: (field: keyof FormData, value: string) => void
}

/**
 * Validates if a string is a valid image URL
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') && 
           url.length > 8 // More than just "https://"
  } catch {
    return false
  }
}

/**
 * Component for basic recipe information (title, description, image, yield)
 */
export default function RecipeBasicInfoForm({ formData, onChange }: RecipeBasicInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Tell us about your recipe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="recipe-title" className="block text-sm font-medium mb-2">Title *</label>
          <Input
            id="recipe-title"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g., Spaghetti Carbonara"
            required
          />
        </div>
        
        <div>
          <label htmlFor="recipe-description" className="block text-sm font-medium mb-2">Description</label>
          <Input
            id="recipe-description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="A brief description of your recipe"
          />
        </div>

        <div>
          <label htmlFor="recipe-image-url" className="block text-sm font-medium mb-2">Image URL</label>
          <Input
            id="recipe-image-url"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => onChange('imageUrl', e.target.value)}
            placeholder="https://example.com/recipe-image.jpg"
          />
          {formData.imageUrl && isValidImageUrl(formData.imageUrl) && (
            <div className="mt-2">
              <RecipeImagePreview
                src={formData.imageUrl}
                alt="Recipe preview"
                className="w-full h-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Image preview - if this doesn't load, check that the URL is valid and publicly accessible
              </p>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="recipe-yield" className="block text-sm font-medium mb-2">Yield</label>
          <Input
            id="recipe-yield"
            value={formData.yield}
            onChange={(e) => onChange('yield', e.target.value)}
            placeholder="e.g., 4 servings, 12 cookies"
          />
        </div>
      </CardContent>
    </Card>
  )
}
