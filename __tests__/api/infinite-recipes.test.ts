import { GET } from '@/app/api/recipes/infinite/route'
import { NextRequest } from 'next/server'

// Mock the prisma module before importing
const mockFindMany = jest.fn()
jest.mock('@/lib/prisma', () => ({
  prisma: {
    recipe: {
      findMany: mockFindMany
    }
  }
}))

type MockRecipe = {
  id: string
  title: string
  description: string
  createdAt: Date
  author: { id: string; name: string }
}

describe('/api/recipes/infinite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return recipes with pagination info', async () => {
    const mockRecipes: MockRecipe[] = [
      { 
        id: '1', 
        title: 'Recipe 1', 
        description: 'Description 1',
        createdAt: new Date('2024-01-01'),
        author: { id: 'user1', name: 'Chef 1' }
      },
      { 
        id: '2', 
        title: 'Recipe 2', 
        description: 'Description 2',
        createdAt: new Date('2024-01-02'),
        author: { id: 'user2', name: 'Chef 2' }
      }
    ]

    mockFindMany.mockResolvedValue(mockRecipes)

    const request = new NextRequest('http://localhost:3001/api/recipes/infinite?limit=24')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.recipes).toEqual(mockRecipes)
    expect(data.hasMore).toBe(false)
    expect(data.nextCursor).toBeNull()
  })

  it('should handle search parameters', async () => {
    const mockRecipes: MockRecipe[] = []
    mockFindMany.mockResolvedValue(mockRecipes)

    const searchParams = new URLSearchParams({
      search: 'pasta',
      tags: 'italian,dinner',
      limit: '12'
    })
    
    const request = new NextRequest(`http://localhost:3001/api/recipes/infinite?${searchParams}`)
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: 'pasta', mode: 'insensitive' } },
              { description: { contains: 'pasta', mode: 'insensitive' } }
            ]
          },
          { tags: { hasSome: ['italian', 'dinner'] } },
          { visibility: 'public' }
        ]
      },
      take: 13, // limit + 1
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    })
  })

  it('should handle cursor pagination', async () => {
    const mockRecipes: MockRecipe[] = []
    mockFindMany.mockResolvedValue(mockRecipes)

    const searchParams = new URLSearchParams({
      cursor: 'recipe123',
      limit: '24'
    })
    
    const request = new NextRequest(`http://localhost:3001/api/recipes/infinite?${searchParams}`)
    await GET(request)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: 'recipe123' },
        skip: 1
      })
    )
  })

  it('should detect when there are more results', async () => {
    // Return limit + 1 recipes to simulate hasMore = true
    const mockRecipes: MockRecipe[] = Array.from({ length: 25 }, (_, i) => ({
      id: `recipe-${i}`,
      title: `Recipe ${i}`,
      description: `Description ${i}`,
      createdAt: new Date(),
      author: { id: 'user1', name: 'Chef' }
    }))

    mockFindMany.mockResolvedValue(mockRecipes)

    const request = new NextRequest('http://localhost:3001/api/recipes/infinite?limit=24')
    const response = await GET(request)
    const data = await response.json()

    expect(data.recipes).toHaveLength(24) // Should return only limit amount
    expect(data.hasMore).toBe(true)
    expect(data.nextCursor).toBe('recipe-23') // Second to last recipe ID
  })
})
