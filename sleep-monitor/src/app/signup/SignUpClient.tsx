'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignUpPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const login = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (login?.ok) router.push('/dashboard');
      else router.push('/signin');
    } else {
      const { error } = await res.json();
      setError(error || 'Registration failed');
    }
  };

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

        <Link
          href="/signin"
          className="rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
        >
          Log In
        </Link>
      </header>
      <div className="flex min-h-screen items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded bg-white p-6 shadow"
        >
          <h1 className="mb-4 text-2xl font-bold">Create Account</h1>

          {error && (
            <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="block mb-3">
            <span className="text-gray-700">Name</span>
            <input
              className="mt-1 w-full rounded border p-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="block mb-3">
            <span className="text-gray-700">Email</span>
            <input
              type="text"
              name="fake-email"
              autoComplete="username"
              className="hidden"
            />
            <input
              type="email"
              name="user_email"
              className="mt-1 w-full rounded border p-2"
              value={form.email}
              autoComplete="off"         
              autoCorrect="off"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Password</span>
            <input
              type="password"      
              name="fake-password"  
              autoComplete="new-password" 
              tabIndex={-1}
              className="absolute opacity-0 pointer-events-none h-0 w-0"
            />

            {/* real field */}
            <input
              type="password"
              name="user_password"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              className="mt-1 w-full rounded border p-2"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded bg-sky-600 py-2 text-white hover:bg-sky-700"
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}