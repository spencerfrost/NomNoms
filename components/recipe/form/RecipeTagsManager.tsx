'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface RecipeTagsManagerProps {
  tags: string[]
  newTag: string
  onTagAdd: () => void
  onTagRemove: (tag: string) => void
  onNewTagChange: (value: string) => void
}

/**
 * Component for managing recipe tags (add, remove, display)
 */
export default function RecipeTagsManager({ 
  tags, 
  newTag, 
  onTagAdd, 
  onTagRemove, 
  onNewTagChange 
}: RecipeTagsManagerProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onTagAdd()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>Add tags to categorize your recipe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newTag}
            onChange={(e) => onNewTagChange(e.target.value)}
            placeholder="Add a tag (e.g., italian, quick, dessert)"
            onKeyPress={handleKeyPress}
          />
          <Button type="button" onClick={onTagAdd} variant="outline">
            Add
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => onTagRemove(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
