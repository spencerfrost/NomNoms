import { cn } from '@/lib/utils';

interface RecipeLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function RecipeLayout({ children, sidebar, className }: RecipeLayoutProps) {
  return (
    <div className={cn('container mx-auto px-4 py-8', className)}>
      <div className="max-w-4xl mx-auto">
        {children}

        {sidebar && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{sidebar}</div>}
      </div>
    </div>
  );
}
