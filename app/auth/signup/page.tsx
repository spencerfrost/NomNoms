"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  AuthFormContainer, 
  AuthForm, 
  FormField, 
  AuthFooter, 
  AuthSuccessMessage 
} from '@/components/auth'

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccess(true);

      // Auto sign in after successful signup
      setTimeout(async () => {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/");
        }
      }, 1500);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthFormContainer
        title="Account Created!"
        description="Welcome to NomNoms! You're being signed in..."
        showBackLink={false}
      >
        <AuthSuccessMessage
          title="Account Created!"
          message="Welcome to NomNoms!"
          autoRedirect={true}
        />
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer
      title="Create Account"
      description="Join NomNoms to add and manage your recipes"
    >
      <AuthForm
        onSubmit={handleSubmit}
        submitText="Create Account"
        isLoading={isLoading}
        error={error}
      >
        <FormField
          id="name"
          label="Name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={setName}
          required
        />

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
          placeholder="At least 6 characters"
          value={password}
          onChange={setPassword}
          required
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
        />
      </AuthForm>

      <div className="px-6 pb-6">
        <AuthFooter
          primaryText="Already have an account?"
          linkText="Sign in"
          linkUrl="/auth/signin"
        />
      </div>
    </AuthFormContainer>
  );
}
