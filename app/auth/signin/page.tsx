'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { AuthFormContainer, AuthForm, FormField, AuthFooter } from '@/components/auth';

/** Where to go after signing in: a same-site path from ?callbackUrl=, else home. */
function afterSignInPath(): string {
  const target = new URLSearchParams(window.location.search).get('callbackUrl');
  // Only root-relative paths, so this can't be used to bounce users to another site.
  return target && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
    ? target
    : '/';
}

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        // "CredentialsSignin" means authorize() rejected the email/password. Anything else
        // (e.g. "AuthUnavailable" from lib/auth-config.ts) means we couldn't check them.
        setError(
          result.error === 'CredentialsSignin'
            ? 'Invalid credentials'
            : result.error === 'RateLimited'
              ? 'Too many sign-in attempts. Please wait a few minutes and try again.'
              : 'Sign-in is temporarily unavailable. Please try again in a moment.'
        );
      } else {
        const session = await getSession();
        if (session) {
          // Full page load, not router.push: the client router cache still holds
          // prefetches made while signed out (e.g. /add -> middleware redirect to sign-in),
          // and a client-side navigation would replay them.
          window.location.assign(afterSignInPath());
        } else {
          setError('Signed in, but the session could not be loaded. Please try again.');
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
