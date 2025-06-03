# NomNoms Recipe App - GitHub Copilot Instructions

## Project Overview
NomNoms is a modern recipe management app built with Next.js 15, focusing on personal cooking companion features. The app helps users organize, plan, and enhance their cooking experience with features like recipe scaling, authentication, and intelligent recipe management.

## Tech Stack & Dependencies
- **Framework**: Next.js 15 with App Router and React 19
- **Database**: PostgreSQL with Prisma ORM for data modeling
- **Authentication**: NextAuth.js v4 with Prisma adapter
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
- **Package Manager**: pnpm (use pnpm commands, not npm)
- **TypeScript**: Full TypeScript project with strict type checking
- **Icons**: Lucide React for consistent iconography
- **Password Hashing**: bcryptjs for secure authentication

## Code Style & Conventions
- Use TypeScript for all new code with proper type definitions
- Follow React Server Components patterns (RSC enabled)
- Use Tailwind CSS for styling with the established design system
- Implement shadcn/ui components following the "new-york" style variant
- Use Prisma for all database operations and type generation
- Follow Next.js App Router conventions for file structure

## Database & Data Modeling
- Use Prisma schema for all database models located in `prisma/schema.prisma`
- PostgreSQL is the primary database
- All recipe data includes scaling capabilities with decimal amounts
- User authentication follows NextAuth.js schema requirements
- Recipe ingredients are stored as JSON with amount, unit, and name properties

## Component Architecture
- UI components are located in `components/ui/` (shadcn/ui)
- Feature components are in `components/` root
- Use the established alias paths: `@/components`, `@/lib`, `@/hooks`
- Implement proper separation between client and server components
- Use the existing component patterns for consistency

## Authentication & Security
- Implement NextAuth.js for all authentication flows
- Use bcryptjs for password hashing
- Follow the established user model with proper relations
- Implement proper session management and protection for routes

## Recipe Data Management
- Recipe scaling uses intelligent unit conversion from `lib/amount-utils.ts`
- Ingredients follow the established Ingredient interface with decimal amounts
- Support for public/private recipe visibility
- Use the existing recipe utilities in `lib/recipe-utils.ts`

## Development Practices
- Use `pnpm dev` for development server
- All database changes should go through Prisma migrations
- Follow the established project structure and file naming conventions
- Implement proper error handling and user feedback
- Use the existing utility functions in `lib/utils.ts` for common operations

## File Organization
- API routes in `app/api/`
- Page components in `app/` following App Router structure
- Shared utilities in `lib/`
- Database scripts in `scripts/` directory
- Static assets in `public/` directory

## Future Features Context
The app is evolving toward meal planning, shopping lists, recipe collections, and personal cooking assistant features. Consider this roadmap when implementing new functionality to ensure compatibility with planned features.
