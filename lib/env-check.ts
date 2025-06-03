/**
 * Early environment validation
 * Import this at the top of your main application entry points
 */

// This will throw an error if environment variables are invalid
import './env'

export { env, isDevelopment, isProduction, isTest } from './env'
