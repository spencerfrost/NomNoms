# GitHub Issue: Migrate from File-based Storage to PostgreSQL with Prisma

## 🎯 Objective
Migrate the current file-based data storage system to PostgreSQL using Prisma ORM to enable advanced features like user-owned recipes, voting systems, and better data relationships.

## 📋 Current State
- **User data**: Stored in `/data/users.json` 
- **Recipe data**: Individual JSON files in `/data/recipes/`
- **Auth**: NextAuth.js with Prisma adapter already configured
- **Dependencies**: `@auth/prisma-adapter` already installed

## 🎪 Scope of Work

### Phase 1: Database Setup
- [x] Install PostgreSQL dependencies (`pg`, `@types/pg`)
- [x] Set up local PostgreSQL database
- [x] Create Prisma schema with proper models
- [x] Configure database connection string
- [x] Run initial migration

### Phase 2: Schema Design (Core Migration Only)
- [x] **User model**: Migrate from users.json structure
  - [x] id, email, name, password, role, createdAt
  - [x] Basic relationship for owned recipes
- [x] **Recipe model**: Migrate from recipe JSON files
  - [x] Basic fields: slug, title, description, yield, prepTime, cookTime
  - [x] Ingredient handling (JSON field for current structure)
  - [x] Instructions array
  - [x] Tags array
  - [x] Add userId foreign key for ownership
  - [x] Add visibility field (public/private)
- [x] **Note**: Additional models for collections, favorites, meal planning, etc. will be added in separate issues/PRs

### Phase 3: Data Migration
- [x] Create migration script for existing users
- [x] Create migration script for existing recipes
- [x] Assign existing recipes to users (default to first user or create "system" user)
- [x] Verify data integrity after migration

### Phase 4: API Route Updates
- [x] Update `/api/auth/[...nextauth]/route.ts` to use database
- [x] Update `/api/recipes/route.ts` (GET, POST)
- [x] Update `/api/recipes/[slug]/route.ts` (GET, PUT, DELETE)
- [x] Add user authorization checks
- [x] Update recipe creation to associate with authenticated user

### Phase 5: Frontend Updates
- [x] Update recipe fetching logic in `lib/recipes.ts`
- [x] Update user management in `lib/users.ts`
- [x] Modify components to handle user-owned recipes
- [x] Update types in `lib/types.ts`

### Phase 6: Foundation Complete
- [x] All existing functionality migrated to database
- [x] Recipe ownership working
- [x] Basic public/private recipe visibility
- [x] Ready for future feature additions (separate issues)
- [x] Legacy JSON files preserved for backup

## 🔧 Technical Details

### Proposed Schema Structure
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  recipes   Recipe[]
  // Note: Additional relationships (favorites, collections, etc.) 
  // will be added in future feature implementations
  
  @@map("users")
}

model Recipe {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String
  ingredients Json     // Store as JSON for flexibility
  instructions String[] // Array of instruction steps
  tags        String[]
  yield       String?
  prepTime    String?
  cookTime    String?
  image       String?
  visibility  String   @default("public") // "public" | "private"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  // Note: Additional relationships (votes, favorites, collections, etc.)
  // will be added in future feature implementations
  
  @@map("recipes")
}

// Note: Additional models (Vote, Collection, UserFavorite, MealPlan, etc.)
// will be added in separate issues as features are implemented
```

### Environment Variables Needed
```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/nomnoms"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## ⚠️ Risks & Considerations
- **Data loss risk**: Ensure not to modify or delete original JSON files
- **Breaking changes**: API responses will change structure slightly
- **NextAuth compatibility**: Verify Prisma adapter works correctly
- **Performance**: Database queries vs. file reads (should be faster for complex operations)

## 🧪 Testing Strategy
- [ ] Test data migration accuracy
- [ ] Test all existing API endpoints
- [ ] Test authentication flows
- [ ] Verify recipe CRUD operations
- [ ] Test with both existing and new data

## 📚 Resources
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [NextAuth.js Prisma Adapter](https://next-auth.js.org/adapters/prisma)
- [PostgreSQL Setup Guide](https://www.postgresql.org/docs/)

## 🎯 Success Criteria
- [ ] All existing functionality works with database
- [ ] No data loss during migration
- [ ] Recipe ownership is properly assigned
- [ ] Foundation is ready for additional features (collections, favorites, etc.)
- [ ] Database schema is designed to be easily extensible
- [ ] Performance is equal or better than file-based system

## 📅 Estimated Timeline
- **Phase 1-2**: 1-2 days (setup and schema)
- **Phase 3**: 1 day (migration scripts)
- **Phase 4-5**: 2-3 days (API and frontend updates)
- **Testing**: 1 day

**Total**: ~1 week for full migration

---

**Labels**: `enhancement`, `database`, `migration`, `prisma`
**Assignee**: @username
**Priority**: High
