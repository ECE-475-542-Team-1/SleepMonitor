'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInClient() {
    
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      alert(result?.error || 'Sign in failed');
    }
  }

  return (
    <main className="flex w-full flex-col bg-gradient-to-b from-sky-100 to-white">
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between p-7">
      <div className="flex items-center space-x-2">
      <svg
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 16 16"
        className="text-sky-700"
      >
        <path d="M7 8a3.5 3.5 0 0 1 3.5 3.555.5.5 0 0 0 .625.492A1.503 1.503 0 0 1 13 13.5a1.5 1.5 0 0 1-1.5 1.5H3a2 2 0 1 1 .1-3.998.5.5 0 0 0 .509-.375A3.5 3.5 0 0 1 7 8m4.473 3a4.5 4.5 0 0 0-8.72-.99A3 3 0 0 0 3 16h8.5a2.5 2.5 0 0 0 0-5z" />
        <path d="M11.286 1.778a.5.5 0 0 0-.565-.755 4.595 4.595 0 0 0-3.18 5.003 5.5 5.5 0 0 1 1.055.209A3.6 3.6 0 0 1 9.83 2.617a4.593 4.593 0 0 0 4.31 5.744 3.58 3.58 0 0 1-2.241.634q.244.477.394 1a4.59 4.59 0 0 0 3.624-2.04.5.5 0 0 0-.565-.755 3.593 3.593 0 0 1-4.065-5.422z" />
      </svg>
      <Link
          href="/"
        >
          <span className="text-lg font-bold text-sky-700">SleepTracker</span>
        </Link>
      </div>
    </header>
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-2xl font-bold">Sign In</h1>

        <label className="block mb-2">
          <span className="text-gray-700">Email</span>
          <input
            className="mt-1 w-full rounded border p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Password</span>
          <input
            className="mt-1 w-full rounded border p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="w-full rounded bg-sky-600 py-2 text-white hover:bg-sky-700"
        >
          Sign In
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
            New here?{' '}
            <Link href="/signup" className="text-sky-600 hover:underline">
                Create an account
            </Link>
        </p>
      </form>
    </div>
    </main>
  );
}