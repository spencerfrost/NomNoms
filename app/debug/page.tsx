import { getAllRecipes } from '@/lib/recipes-db';

// Debug page to check environment variables and recipes in production
export default async function DebugPage() {
  const databaseUrl = process.env.DATABASE_URL;
  const recipes = await getAllRecipes();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Production Debug</h1>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Environment</h2>
          <div className="space-y-1 text-sm">
            <p>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </p>
            <p>
              <strong>DATABASE_URL (first 50 chars):</strong> {databaseUrl?.substring(0, 50)}...
            </p>
            <p>
              <strong>Database Protocol:</strong> {databaseUrl?.split('://')[0]}
            </p>
            <p>
              <strong>Is Prisma Accelerate?:</strong>{' '}
              {databaseUrl?.startsWith('prisma+postgres://') ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Database Connection</h2>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Recipes Found:</strong> {recipes.length}
            </p>
            <p>
              <strong>Sample Recipe Titles:</strong>
            </p>
            <ul className="ml-4 list-disc">
              {recipes.slice(0, 5).map((recipe, i) => (
                <li key={i}>{recipe.title}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
