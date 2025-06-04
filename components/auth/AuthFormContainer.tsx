import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthFormContainerProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showBackLink?: boolean;
  backLinkUrl?: string;
  backLinkText?: string;
}

export function AuthFormContainer({
  children,
  title,
  description,
  showBackLink = true,
  backLinkUrl = '/',
  backLinkText = 'Back to recipes',
}: AuthFormContainerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showBackLink && (
          <Link href={backLinkUrl} className="inline-flex items-center mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLinkText}
          </Link>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {children}
        </Card>
      </div>
    </div>
  );
}
