'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/services/apiService';
import { AuthForm } from '@/components/AuthForm';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      await signup({ email, password });
      // After successful signup, redirect to login page with a success message
      router.push('/login?signup=success');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return <AuthForm mode="signup" onSubmit={handleSignup} isLoading={isLoading} error={error} />;
}