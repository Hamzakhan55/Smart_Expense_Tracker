'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login } from '@/services/apiService';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const router = useRouter();

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const data = await login(formData);
      authLogin(data.access_token);
      router.push('/'); // Redirect to home page on successful login
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} error={error} />;
}