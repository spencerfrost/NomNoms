# NomNoms Recipe App

NomNoms is a modern recipe manager built with Next.js. It helps you convert, organize, and browse your favorite recipes with ease.

## Features
- Convert old HTML recipe files to structured JSON
- Automatic image extraction and renaming
- Browse, search, and view recipes in a clean UI
- Add, edit, and scale recipes
- Tag-based filtering (e.g., vegetarian, dessert, quick, etc.)
- Built with Next.js App Router, TypeScript, and Contentlayer
- Styled with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

2. **Convert your old recipes (optional):**
   Place your old HTML recipe files in `old_recipes/Recipes/` and run:
   ```bash
   node convert-recipes.js
   ```
   This will generate JSON files in `data/recipes/` and copy images to `public/images/recipes/`.

3. **Run the development server:**
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
