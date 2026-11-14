# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use **pnpm** (not npm/yarn). Dev server runs on port **3001**.

```bash
pnpm dev                      # next dev --turbopack on :3001
pnpm exec tsc --noEmit        # typecheck (there is no typecheck script)
pnpm lint                     # next lint (unused-arg warnings in function types are pre-existing)
pnpm test                     # jest
pnpm exec jest __tests__/lib/recipes-db.test.ts     # single file
pnpm exec jest -t "returns 404"                     # single test by name
pnpm db:migrate:dev           # create/apply a Prisma migration locally
pnpm db:studio
```

**Do not run `pnpm build` casually**: it runs `prisma migrate deploy` against whatever `DATABASE_URL` points to before building. To verify a production build without touching a DB, run `pnpm exec next build` with placeholder `NEXTAUTH_URL`, `NEXTAUTH_SECRET` and `DATABASE_URL`. `lib/env.ts` throws at module load if those three are missing, which also breaks builds and route imports.

Env setup: copy `.env.example` to `.env.local`; `pnpm generate-secret` makes `NEXTAUTH_SECRET`.

## Architecture

Next.js 15 App Router + React 19, PostgreSQL via Prisma, NextAuth v4, Tailwind v4 + shadcn/ui ("new-york" style). Path alias `@/*` maps to the repo root.

### Auth

- `lib/auth-config.ts` holds the only `authOptions`: **Credentials provider + JWT sessions**. `session.user.id` and `role` are copied from the token in callbacks. README/Copilot docs mention OAuth providers and the Prisma adapter, but neither is wired up (their tables were dropped in migration `20261114010000`).
- `middleware.ts` only checks for a token on write methods to `/api/recipes/*` and on `/add`. Every route handler must still call `getServerSession(authOptions)` itself, and ownership is enforced in the data layer, not middleware.
- `/profile` and the recipe view page (`app/recipes/[slug]/page.tsx`) are server components that read the session with `getServerSession`; the edit page and `/add` are client components that check the session client-side.
- Password rules live in `lib/password-policy.ts` (client-safe; min 8, max 72 bytes for bcrypt). Use `validatePassword()` in both forms and routes, and only when a password is being set.
- `authorize()` throws `AuthUnavailable` (DB error) or `RateLimited`; the sign-in page maps these `signIn().error` codes to messages. Wrong credentials return null (`CredentialsSignin`).

### Rate limiting

`lib/rate-limit.ts`: fixed-window counters in the Postgres `rate_limits` table, updated with one atomic upsert (in-memory counters don't work across Vercel instances). Rules are in `RATE_LIMITS` (signup per IP, login per email and per IP, import per user, password change per user). It **fails open** on DB errors. `clientIp()` trusts `x-real-ip`/`x-forwarded-for`, which is only safe behind a proxy that overwrites them (Vercel does). Routes answer with `tooManyRequests()` (429 + `Retry-After`).

### Recipe data flow

- **Server data layer:** `lib/recipes-db.ts` (Prisma). Visibility and ownership rules live here:
  - `getRecipeBySlug(slug, userId)` hides `private` recipes unless `userId` is the author, so routes must pass the viewer's id.
  - `updateRecipe`/`deleteRecipe` return `null`/`false` for "not found or not yours" (routes map that to 404); they don't throw.
  - `createRecipe` derives the slug server-side and de-duplicates it (`-2`, `-3`, …); clients navigate to the slug the API returns.
  - Author info is selected via the shared `authorInclude` (id and name only). **Never add author `email`**: these results are served to unauthenticated users.
- **Recipe view page** is a server component: it calls `getRecipeBySlug(slug, viewerId)` directly (wrapped in React `cache()` so `generateMetadata` and the page share one lookup), `notFound()`s on null, and lets DB errors reach `error.tsx`. Only the scale multiplier is client state, in `components/recipe/display/ScalableRecipe.tsx`; static pieces are passed in as server-rendered slots. Private recipes get `robots: noindex`.
- **Client:** `lib/client-recipes.ts` wraps `fetch` to the API routes for the client pages (`app/add`, `app/recipes/[slug]/edit`).
- **Home page listing** uses cursor pagination: `hooks/useInfiniteRecipes.ts` (SWR infinite) → `app/api/recipes/infinite/route.ts`, which queries Prisma directly, public recipes only, `limit` capped at 50.
- **Validation:** `lib/recipe-schema.ts` (zod) is the only place recipe input is validated and normalized. `POST /api/recipes` uses `parseRecipeCreate`, `PUT /api/recipes/[slug]` uses `parseRecipeUpdate`; both return `{ ok, data | error }` and strip unknown keys (so clients can't set `authorId`/`slug`). The data layer takes the schema's output types and does no normalization of its own. Shared field definitions carry no `.default()`: defaults are added only on the create schema, otherwise an update omitting a field would reset it. The schema is client-safe; client code uses its `RecipeCreatePayload`/`RecipeUpdatePayload` types.
- **Unique constraints, not check-then-insert:** catch `isUniqueViolation(error, field)` from `lib/prisma-errors.ts` (Prisma `P2002`). `createRecipe` retries the slug on collision; `createUser` throws `UserExistsError` (signup maps it to 409).
- **Update semantics** in `PUT /api/recipes/[slug]`: for optional string fields (`image`, `yield`, `prepTime`, `cookTime`), `undefined` leaves the value alone and `null`/`""` clears it (the schema maps `""` to `null`). `image` must be an http(s) URL or a root-relative path. Slugs are never changed on update.

### Ingredients and scaling

- `Recipe.ingredients` is a Prisma `Json` column holding `Ingredient[]` (`{ amount: number, unit, name }`, amount always a decimal). Always read it through `getRecipeIngredients()` in `types/recipe.ts` (type guard), not by casting.
- `amount: 0` means "no amount" (e.g. "salt to taste"). Forms keep these and the display omits the number.
- Amount parsing/formatting (fractions ↔ decimals) is in `lib/amount-utils.ts`; scaling multiplies the stored decimal.

### Recipe URL import

`POST /api/recipes/import` → `lib/recipe-import-utils.ts` (JSON-LD extraction with cheerio, HTML fallbacks) → returns an `ImportedRecipe` to prefill the add form (it doesn't save anything). Failures are typed: `safe-fetch` throws `UnsafeUrlError` / `FetchError` (with `kind`, `status`), the importer converts those to `RecipeImportError` (with `code` and a user-facing message), and the route maps `code` to the HTTP status. Never pick a status by matching error message text; unknown errors become a generic 500. Outbound fetches **must** go through `lib/safe-fetch.ts` (`safeFetchText`), which blocks private/loopback/metadata IPs, re-checks each redirect, and enforces timeout and size limits. Client components may only `import type` from `recipe-import-utils`, because importing its values pulls `node:dns` into the client bundle.

### Images

`next.config.ts` allows the optimizer only for hosts in `lib/image-hosts.ts` (`OPTIMIZED_IMAGE_HOSTS`). Imported recipes can carry images from arbitrary hosts, so every `next/image` rendering a recipe image must pass `unoptimized={shouldSkipOptimization(src)}`, or Next throws on unknown hosts. Seed images live in `public/images/recipes/`.

### Other

- `data/recipes/*.json` are legacy seed recipes from before the DB migration; `scripts/compiled/migrate-data.js` imports them (and a local, git-ignored `data/users.json`) into Postgres.
- `/debug/*` pages (session inspector, component showcase) return 404 in production via `app/debug/layout.tsx`, which is also `force-dynamic` so the debug pages' DB queries don't run during `next build`.
- Schema changes go through Prisma migrations (`prisma/migrations/`).

## Testing

- Jest via `next/jest`, default environment `jsdom`. API route and server-lib tests opt into Node with a `/** @jest-environment node */` docblock.
- `jest.setup.ts` globally mocks `next/navigation`, `next/link`, `next-auth/react`, `@/lib/client-recipes`, `@/lib/recipe-import-utils`, and stubs `fetch` **only in jsdom**. Tests that need real behavior from those modules must override the mocks.
- Route handlers are tested with `next-test-api-route-handler`, which must be the first import (see `__tests__/api/`).
- Don't let tests load the real `next-auth` or `@/lib/auth-config`: next-auth pulls in ESM-only `jose`, which Jest can't parse. Mock them with explicit factories, e.g. `jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))`. A bare `jest.mock('next-auth')` still loads the real module.
- Prisma is mocked per test file (`jest.mock('@/lib/prisma', () => ({ prisma: { recipe: {...} } }))`); there is no test database.
