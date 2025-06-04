'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthFormContainer, AuthForm, FormField, AuthFooter } from '@/components/auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        // Check if sign in was successful
        const session = await getSession();
        if (session) {
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormContainer title="Sign In" description="Sign in to add and manage your recipes">
      <AuthForm onSubmit={handleSubmit} submitText="Sign In" isLoading={isLoading} error={error}>
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={setEmail}
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={setPassword}
          required
        />
      </AuthForm>

      <div className="px-6 pb-6">
        <AuthFooter
          primaryText="Don't have an account?"
          linkText="Create one"
          linkUrl="/auth/signup"
          secondaryText="You can browse recipes without signing in"
        />
      </div>
    </AuthFormContainer>
  );
}
