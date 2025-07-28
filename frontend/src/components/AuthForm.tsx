'use client';

import { useState, FormEvent } from 'react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (payload: { email: string; password: string }) => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthForm = ({ mode, onSubmit, isLoading, error }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border rounded-md"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isLoading ? 'Loading...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
            </button>
          </div>
        </form>
        <p className="text-center text-sm">
          {mode === 'login' ? (
            <>
              Do not have an account? <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">Sign up</a>
            </>
          ) : (
            <>
              Already have an account? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Log in</a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};