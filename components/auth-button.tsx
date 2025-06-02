'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { User, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Button variant="ghost" disabled>
        Loading...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{session.user?.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signIn()}
        className="flex items-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center gap-2"
      >
        <Link href="/auth/signup">
          <span className="hidden sm:inline">Sign up</span>
          <span className="sm:hidden">Join</span>
        </Link>
      </Button>
    </div>
  )
}
