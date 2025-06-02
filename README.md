# NomNoms Recipe App

NomNoms is a modern recipe manager built with Next.js. It helps you convert, organize, and browse your favorite recipes with ease.

## Features
- Convert old HTML recipe files to structured JSON
- Automatic image extraction and renaming
- Browse, search, and view recipes in a clean UI
- Add, edit, and scale recipes with authentication
- Tag-based filtering (e.g., vegetarian, dessert, quick, etc.)
- **Authentication** - Guests can view recipes, sign in required to add/edit/delete
- Built with Next.js App Router, TypeScript, and NextAuth.js
- Styled with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/)

## Authentication Setup

This app uses NextAuth.js for authentication. Guests can view recipes, but authentication is required to add, edit, or delete recipes.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### Setting up OAuth Providers

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

#### GitHub OAuth:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

2. **Set up authentication:**
   - Copy `.env.example` to `.env.local`
   - Fill in your OAuth provider credentials (optional - you can start with just NEXTAUTH_SECRET)
   - Generate a secret: `openssl rand -base64 32`

3. **Convert your old recipes (optional):**
   Place your old HTML recipe files in `old_recipes/Recipes/` and run:
   ```bash
   node convert-recipes.js
   ```
   This will generate JSON files in `data/recipes/` and copy images to `public/images/recipes/`.

4. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure
- `app/` – Next.js app pages and routes
- `components/` – UI and recipe components (built with shadcn/ui)
- `data/recipes/` – Recipe JSON files
- `lib/` – Utilities and type definitions
- `public/images/recipes/` – Recipe images
- `convert-recipes.js` – Script to convert old HTML recipes

## Contributing
Pull requests and issues are welcome! Please open an issue to discuss your idea or bug before submitting a PR.

## License
MIT
