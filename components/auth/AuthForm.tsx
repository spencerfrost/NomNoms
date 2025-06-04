import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthErrorDisplay } from './AuthErrorDisplay';

interface AuthFormProps {
  onSubmit: (_e: React.FormEvent) => Promise<void>;
  children: React.ReactNode;
  submitText: string;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export function AuthForm({
  onSubmit,
  children,
  submitText,
  isLoading,
  error,
  className = '',
}: AuthFormProps) {
  return (
    <CardContent>
      <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
        {children}

        {error && <AuthErrorDisplay error={error} />}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? `${submitText.replace('Sign In', 'Signing in').replace('Create Account', 'Creating Account')}...`
            : submitText}
        </Button>
      </form>
    </CardContent>
  );
}
