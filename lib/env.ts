/**
 * Environment Variables Validation
 * Validates and provides type-safe access to environment variables
 */

export interface Environment {
  // NextAuth.js
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  
  // Database
  DATABASE_URL: string
  
  // Environment
  NODE_ENV: 'development' | 'production' | 'test'
  
  // Optional OAuth
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GITHUB_ID?: string
  GITHUB_SECRET?: string
  
  // Optional Security
  RATE_LIMIT_ENABLED?: boolean
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error'
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(`Environment Configuration Error: ${message}`)
    this.name = 'EnvironmentError'
  }
}

/**
 * Validates that required environment variables are present and properly formatted
 */
function validateEnvironment(): Environment {
  const errors: string[] = []

  // Required variables
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL
  const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
  const DATABASE_URL = process.env.DATABASE_URL
  const NODE_ENV = process.env.NODE_ENV

  // Validate required variables
  if (!NEXTAUTH_URL) {
    errors.push('NEXTAUTH_URL is required')
  } else if (!isValidUrl(NEXTAUTH_URL)) {
    errors.push('NEXTAUTH_URL must be a valid URL')
  }

  if (!NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is required')
  } else if (NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters long for security')
  } else if (NEXTAUTH_SECRET.includes('development-secret') && NODE_ENV === 'production') {
    errors.push('NEXTAUTH_SECRET must not use development default in production')
  }

  if (!DATABASE_URL) {
    errors.push('DATABASE_URL is required')
  } else if (!isDatabaseUrl(DATABASE_URL)) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string (supports postgresql://, postgres://, or prisma+postgres:// protocols)')
  }

  if (!NODE_ENV || !['development', 'production', 'test'].includes(NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, production, test')
  }

  // Validate OAuth pairs (if one is provided, both must be provided)
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  if ((googleClientId && !googleClientSecret) || (!googleClientId && googleClientSecret)) {
    errors.push('Both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided together')
  }

  const githubId = process.env.GITHUB_ID
  const githubSecret = process.env.GITHUB_SECRET
  if ((githubId && !githubSecret) || (!githubId && githubSecret)) {
    errors.push('Both GITHUB_ID and GITHUB_SECRET must be provided together')
  }

  // If there are errors, throw them
  if (errors.length > 0) {
    throw new EnvironmentError(
      `Configuration validation failed:\n${errors.map(err => `  - ${err}`).join('\n')}`
    )
  }

  // Return validated environment
  return {
    NEXTAUTH_URL: NEXTAUTH_URL!,
    NEXTAUTH_SECRET: NEXTAUTH_SECRET!,
    DATABASE_URL: DATABASE_URL!,
    NODE_ENV: NODE_ENV as 'development' | 'production' | 'test',
    
    // Optional OAuth
    GOOGLE_CLIENT_ID: googleClientId,
    GOOGLE_CLIENT_SECRET: googleClientSecret,
    GITHUB_ID: githubId,
    GITHUB_SECRET: githubSecret,
    
    // Optional Security
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED === 'true',
    LOG_LEVEL: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  }
}

/**
 * Helper function to validate URLs
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Helper function to validate database URLs
 */
function isDatabaseUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    // Support standard PostgreSQL and Prisma Accelerate URLs
    return url.protocol === 'postgresql:' || 
           url.protocol === 'postgres:' || 
           url.protocol === 'prisma+postgres:'
  } catch {
    return false
  }
}

/**
 * Validated environment variables - throws error if validation fails
 */
export const env = validateEnvironment()

/**
 * Check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test'

// Log validation success in development
if (isDevelopment) {
  console.log('✅ Environment variables validated successfully')
}
