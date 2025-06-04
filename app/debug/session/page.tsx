import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import SessionDebug from '@/components/debug/session-debug';

export default async function DebugPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>

      <div className="space-y-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Server Session Debug:</h3>
          <div className="text-sm">
            <p>
              <strong>Session exists:</strong> {session ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>User ID:</strong> {session?.user?.id || 'undefined'}
            </p>
            <p>
              <strong>User Email:</strong> {session?.user?.email || 'undefined'}
            </p>
            <p>
              <strong>User Name:</strong> {session?.user?.name || 'undefined'}
            </p>
            <p>
              <strong>User Role:</strong> {session?.user?.role || 'undefined'}
            </p>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer">Full Server Session Object</summary>
            <pre className="mt-2 text-xs overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>

        <SessionDebug />
      </div>
    </div>
  );
}
