import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface NotFoundProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonUrl?: string;
  backButtonText?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function NotFound({
  title = 'Not Found',
  message = "The item you're looking for doesn't exist.",
  showBackButton = true,
  backButtonUrl = '/',
  backButtonText = 'Go Back',
  icon = <Search className="h-16 w-16 text-muted-foreground" />,
  className,
}: NotFoundProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center p-4', className)}>
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">{icon}</div>

        <h1 className="text-2xl font-bold mb-3">{title}</h1>

        <p className="text-muted-foreground mb-6 leading-relaxed">{message}</p>

        {showBackButton && (
          <Link href={backButtonUrl}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backButtonText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
