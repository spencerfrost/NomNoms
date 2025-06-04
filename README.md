# NomNoms Recipe App

NomNoms is a modern recipe manager built with Next.js that's evolving into a comprehensive personal cooking companion. It helps you organize, plan, and enhance your cooking experience.

## ✨ Current Features

- 🔍 Browse, search, and view recipes in a clean UI
- 📏 Recipe scaling with intelligent unit conversion
- 🏷️ Tag-based filtering (vegetarian, dessert, quick, etc.)
- 👤 **User Authentication** - Secure recipe management with NextAuth.js
- ✏️ Add, edit, and manage your personal recipes
- 🔒 **Public/Private Recipes** - Control recipe visibility
- 📱 Mobile-responsive design for kitchen use
- 🎨 Modern UI built with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Planned Features

### 📚 Recipe Organization

- **Recipe Collections/Cookbooks** - Organize recipes into themed collections
- **Favorite Recipes** - Quick access to your most-loved recipes
- **Recipe Forking** - Create and share recipe variations
- **Recipe Import** - Import recipes from cooking websites via URL

### 🍽️ Personal Cooking Assistant

- **Recipe Notes** - Add personal modifications and cooking tips
- **Cooking History** - Track what you've cooked and when
- **Ingredient Substitutions** - Smart ingredient swapping suggestions

### 📅 Meal Planning & Shopping

- **Meal Planning Calendar** - Plan meals in advance with drag-and-drop
- **Smart Shopping Lists** - Auto-generate lists from meal plans

### 🌟 Discovery & Social

- **Recipe Sharing** - Discover trending recipes from the community
- **Advanced Search** - Find recipes by ingredients, dietary needs, cook time
- **Seasonal Suggestions** - Recipe recommendations based on time of year

> 📋 See our detailed [ROADMAP.md](./docs/ROADMAP.md) for complete feature plans and timeline

## Authentication Setup

This app uses NextAuth.js for authentication. Guests can view recipes, but authentication is required to add, edit, or delete recipes.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3001
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
5. Add `http://localhost:3001/api/auth/callback/google` to authorized redirect URIs

#### GitHub OAuth:

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3001/api/auth/callback/github`

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js with multiple OAuth providers
- **Database**: PostgreSQL with Prisma ORM (migrating from JSON files)
- **Deployment**: Vercel-ready with environment configuration

## 🚀 Getting Started

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

   Open [http://localhost:3001](http://localhost:3001) to see the app.

## 📁 Project Structure

- `app/` – Next.js app router pages and API routes
- `components/` – Reusable UI components (built with shadcn/ui)
- `lib/` – Utilities, types, and business logic
- `data/` – Current JSON-based data storage (migrating to database)
- `public/` – Static assets and recipe images
- `prisma/` – Database schema and migrations (coming soon)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🐛 Bug Reports** - Open an issue with detailed reproduction steps
2. **💡 Feature Requests** - Check our [roadmap](./docs/ROADMAP.md) and suggest new ideas
3. **🔧 Code Contributions** - Pick up an issue or implement a planned feature
4. **📖 Documentation** - Help improve our docs and guides

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Commit with clear, descriptive messages
5. Push to your branch and open a Pull Request

## 📈 Project Status

- ✅ **MVP Complete** - Core recipe management functionality
- 🚧 **Database Migration** - Moving from JSON files to PostgreSQL
- 📋 **Feature Development** - Implementing planned cooking assistant features

## 📞 Support

- 📧 Issues: [GitHub Issues](https://github.com/yourusername/nomnoms/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/nomnoms/discussions)
- 📚 Documentation: [Wiki](https://github.com/yourusername/nomnoms/wiki)

## License

MIT
