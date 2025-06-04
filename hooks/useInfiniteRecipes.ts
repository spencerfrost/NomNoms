import useSWRInfinite from 'swr/infinite'
import { Recipe } from '@/types'

interface InfiniteRecipeResponse {
  recipes: Recipe[]
  nextCursor: string | null
  hasMore: boolean
}

interface UseInfiniteRecipesProps {
  search?: string
  tags?: string[]
  limit?: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useInfiniteRecipes({ 
  search, 
  tags, 
  limit = 24 
}: UseInfiniteRecipesProps = {}) {
  const getKey = (pageIndex: number, previousPageData: InfiniteRecipeResponse | null) => {
    // If no more data, stop fetching
    if (previousPageData && !previousPageData.hasMore) return null
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(search && { search }),
      ...(tags?.length && { tags: tags.join(',') })
    })
    
    // First page
    if (pageIndex === 0) {
      return `/api/recipes/infinite?${params}`
    }
    
    // Subsequent pages with cursor
    if (previousPageData?.nextCursor) {
      params.set('cursor', previousPageData.nextCursor)
      return `/api/recipes/infinite?${params}`
    }
    
    return null
  }

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<InfiniteRecipeResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
      persistSize: true,
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
      focusThrottleInterval: 5000 // Throttle revalidation on focus
    }
  )

  const recipes = data ? data.flatMap(page => page.recipes) : []
  const isLoading = !data && !error
  const isLoadingMore = isValidating && data && typeof data[size - 1] !== 'undefined'
  const isEmpty = data?.[0]?.recipes?.length === 0
  const isReachingEnd = data && !data[data.length - 1]?.hasMore
  const hasMore = !isReachingEnd && !isEmpty

  return {
    recipes,
    error,
    isLoading,
    isLoadingMore,
    isEmpty,
    hasMore,
    loadMore: () => setSize(size + 1),
    refresh: () => mutate()
  }
}
