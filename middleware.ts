import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { env } from './lib/env'

export async function middleware(request: NextRequest) {
  // Protect write operations (POST, PUT, DELETE) on recipe routes
  if (request.nextUrl.pathname.startsWith('/api/recipes') && 
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    
    const token = await getToken({ 
      req: request, 
      secret: env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  // Protect the /add page
  if (request.nextUrl.pathname.startsWith('/add')) {
    const token = await getToken({ 
      req: request, 
      secret: env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/recipes/:path*',
    '/add/:path*'
  ]
}
