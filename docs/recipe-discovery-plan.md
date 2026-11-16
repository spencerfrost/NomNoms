# Recipe Discovery Plan

Status: implemented, all four phases (written 2026-11-14, implemented 2026-11-16)

## Goal

Search the web for recipes from inside NomNoms, look at a result as a clean parsed recipe, and save it to the library in one click. This replaces Paprika's built-in browser.

NomNoms is a single-user personal app. Nothing here is designed for other users.

## Why not an embedded browser

Paprika is native and embeds a real web view. A web app can only embed other sites in an iframe, and most recipe sites send `X-Frame-Options` or `frame-ancestors` headers that block that. Proxying pages through our server breaks scripts, cookie banners and paywalls. So the design is search results plus a parsed preview, with a clipper for pages found in the normal browser.

## User flow

1. Open **Discover** from the menu and type a query, e.g. "chicken tikka masala".
2. See result cards: title, site name, snippet, thumbnail. Results already in the library are marked "Saved".
3. Click a card. The existing importer parses the page and a preview shows image, times, ingredients and steps, plus an "Open original" link (new tab).
4. Click **Save** to add it to the library as-is, or **Edit first** to open it in the add form.
5. When browsing outside the app, a bookmarklet (desktop) or the share sheet (Android) sends the current page to the same preview.

## Design

### Search backend

- New `lib/recipe-search.ts` exporting `searchRecipes(query, page)` which returns `{ title, url, site, snippet, thumbnail }[]`.
- The provider sits behind a small interface so it can be swapped. Default provider: Brave Search API (`GET https://api.search.brave.com/res/v1/web/search`, key in the `X-Subscription-Token` header). Confirm the endpoint, response shape and pricing against Brave's docs when implementing.
- The query sent to the provider is the user's text plus the word "recipe".
- The key is a new optional env var `BRAVE_SEARCH_API_KEY` in `lib/env.ts` and `.env.example`. It must stay optional so the app still boots without it.
- With no key set, Discover still works in a reduced mode: the search box opens a web search in a new tab, and the paste-a-URL and clipper paths work as normal.
- The provider host is fixed, not user-supplied, so this call does not need the SSRF checks in `lib/safe-fetch.ts`. It still needs a timeout.

### Search route

- `GET /api/discover/search?q=&page=`
- Calls `getServerSession(authOptions)` itself and returns 401 when signed out (middleware does not cover this path).
- New `RATE_LIMITS.recipeSearch` rule, per user, around 30 per 10 minutes. Its job is protecting the API quota from a runaway client.
- Looks up which result URLs match a saved recipe's `sourceUrl` for the current user and returns the slug for those, so the UI can show "Saved" and link to the recipe.
- Provider failures map to a typed error and a 502, following the pattern in the import route. No status chosen by matching message text.

### Preview

- Reuses `POST /api/recipes/import` unchanged. It already returns an `ImportedRecipe` without saving.
- Raise `RATE_LIMITS.recipeImport` from 20 to about 60 per 10 minutes, since clicking through results uses one import each.
- Cache previews on the client by URL (SWR) so reopening a result does not refetch.
- Import failures (`no_recipe`, `blocked`, `timeout`, ...) show the existing user-facing message on the card with an "Open original" link.

### Saving

- Move the `ImportedRecipe` to form/payload mapping out of `handleImportedRecipe` in `app/add/page.tsx` into a shared client-safe helper, and use it from both the add page and Discover. Client code may only `import type` from `recipe-import-utils`.
- **Save** calls `saveRecipe()` from `lib/client-recipes.ts` and then shows a toast with a link to the new recipe. The user stays on Discover so they can keep browsing.
- **Edit first** stores the parsed recipe in `sessionStorage` and navigates to `/add`, which picks it up and prefills. This avoids fetching the page a second time.
- Recipes saved from Discover default to `private`.

### Source URL

- Migration: add `sourceUrl String?` to `Recipe`.
- `createRecipe` and `updateRecipe` accept it; the API routes validate that it is an http(s) URL. On update, `undefined` leaves it alone and `null`/`""` clears it, like the other optional strings.
- The recipe page shows a "Source: example.com" link. The edit form gets a source field.
- The existing add-page import also starts saving it (it is currently dropped).

### Discover page

- `app/discover/page.tsx`, a client component, linked from `components/common/hamburger-menu.tsx`.
- Add `/discover` to the middleware matcher so signed-out visits redirect to sign-in.
- Reads `?q=` to run a search and `?url=` to open a preview directly. `?url=` is what the clipper uses.
- Recipe thumbnails and preview images come from arbitrary hosts, so every `next/image` must pass `unoptimized={shouldSkipOptimization(src)}`.

### Clipper

- **Bookmarklet:** Discover shows a draggable link built from `window.location.origin`:
  `javascript:location.href='<origin>/discover?url='+encodeURIComponent(location.href)`
- **Share target (Android):** add `share_target` to `public/site.webmanifest` with `action: "/discover"`, `method: "GET"` and params `title`, `text`, `url`. Android often puts the link in `text`, so Discover extracts the first URL from `text` when `url` is empty.
- Fill in the manifest's empty `name` and `short_name` at the same time; the share target only appears once the app is installed.
- iOS Safari does not support web share targets. On iPhone the path is copy link, then paste into Discover.

## Phases

Each phase is usable on its own.

| Phase | Work | Done when |
|---|---|---|
| 1. Source URL | Migration, data layer, routes, recipe page link, edit field, add-page import saves it | An imported recipe shows its source link |
| 2. Preview and save | Discover page with paste-a-URL and `?url=`, preview view, Save, Edit first, shared mapping helper, raised import limit | Pasting a URL on Discover previews and saves in one click |
| 3. Search | `lib/recipe-search.ts`, search route, rate limit rule, result cards, "Saved" markers, no-key fallback | Typing a query shows results that open in the preview |
| 4. Clipper | Bookmarklet, manifest name and share target, URL extraction from shared text | Bookmarklet on a recipe site lands on the preview |

Phases 1, 2 and 4 need no API key. Only phase 3 depends on the provider choice.

## Tests

Follow the conventions in `CLAUDE.md`.

- `__tests__/lib/recipe-search.test.ts` (node env): maps a provider response to results, handles empty and malformed responses, times out, appends "recipe" to the query.
- `__tests__/api/discover-search.test.ts` (node env, `next-test-api-route-handler` first import): 401 signed out, 400 without `q`, 429 when limited, 502 on provider failure, "Saved" annotation.
- Extend `__tests__/lib/recipes-db.test.ts` and `__tests__/api/recipe-slug.test.ts` for `sourceUrl` create, update, clear and validation.
- Component test for Discover: preview renders from a mocked import, Save calls `saveRecipe` with the mapped payload, import error shows the message.
- Unit test for the shared mapping helper and for URL extraction from shared text.

## Open decisions

1. **Search provider.** The plan assumes Brave. Google Programmable Search is the alternative if restricting results to a hand-picked list of recipe sites matters more. The provider interface keeps this a small change later.
2. **Sites without structured data.** Results that fail to parse are shown with an error and an "Open original" link. Parsing recipes from plain page text is out of scope here.

## Out of scope

- A proxied or iframe browser.
- Copying remote images into our own storage (imported recipes keep hotlinking for now).
- Search history, saved searches, recommendations.
