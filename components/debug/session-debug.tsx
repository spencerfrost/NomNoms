'use client';

import { useSession } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Client Session Debug:</h3>
      <div className="text-sm">
        <p>
          <strong>Status:</strong> {status}
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
        <summary className="cursor-pointer">Full Session Object</summary>
        <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      </details>
    </div>
  );
}
