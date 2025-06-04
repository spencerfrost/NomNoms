import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function LoadMoreButton({ 
  onClick, 
  isLoading = false, 
  disabled = false 
}: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center py-8">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading more recipes...
          </>
        ) : (
          'Load More Recipes'
        )}
      </Button>
    </div>
  )
}
