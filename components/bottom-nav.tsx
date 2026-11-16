'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutGrid, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Phone navigation: a tab bar pinned to the bottom of the screen. Hidden from `md` up,
 * where the page header carries the same links. The root layout pads the body so page
 * content never ends underneath it.
 */
export default function BottomNav() {
  const pathname = usePathname() ?? '/';
  const { data: session } = useSession();

  const onRecipes = pathname === '/' || pathname.startsWith('/recipes');
  const onAccount = pathname.startsWith('/profile') || pathname.startsWith('/auth');
  const account = session
    ? { href: '/profile', label: 'You' }
    : { href: '/auth/signin', label: 'Sign in' };

  const tab = (active: boolean) =>
    cn(
      'flex h-14 w-24 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-bold',
      active ? 'text-foreground' : 'text-muted-foreground'
    );

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between rounded-t-[28px] bg-card px-7 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <Link href="/" aria-current={onRecipes ? 'page' : undefined} className={tab(onRecipes)}>
        <LayoutGrid className="size-6" aria-hidden="true" />
        Recipes
      </Link>
      <Link
        href="/add"
        aria-label="Add a recipe"
        aria-current={pathname.startsWith('/add') ? 'page' : undefined}
        className="-mt-9 flex size-16 items-center justify-center rounded-full border-[5px] border-background bg-primary text-primary-foreground"
      >
        <Plus className="size-7" strokeWidth={3} aria-hidden="true" />
      </Link>
      <Link
        href={account.href}
        aria-current={onAccount ? 'page' : undefined}
        className={tab(onAccount)}
      >
        <User className="size-6" aria-hidden="true" />
        {account.label}
      </Link>
    </nav>
  );
}
