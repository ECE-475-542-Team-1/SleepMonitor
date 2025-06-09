'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import clsx from 'clsx';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Sleep Insights', href: '/sleep-insights' },
  { name: 'Account', href: '/account' },
  { name: 'Register Device', href: '/devices/register' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading' || !session) return null;

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-sky-900 p-4 shadow" id="my-nav-bar">
      <div className="mb-6 flex items-center"> 
        <svg
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="text-white"
        >
          <path d="M7 8a3.5 3.5 0 0 1 3.5 3.555.5.5 0 0 0 .625.492A1.503 1.503 0 0 1 13 13.5a1.5 1.5 0 0 1-1.5 1.5H3a2 2 0 1 1 .1-3.998.5.5 0 0 0 .509-.375A3.5 3.5 0 0 1 7 8m4.473 3a4.5 4.5 0 0 0-8.72-.99A3 3 0 0 0 3 16h8.5a2.5 2.5 0 0 0 0-5z" />
          <path d="M11.286 1.778a.5.5 0 0 0-.565-.755 4.595 4.595 0 0 0-3.18 5.003 5.5 5.5 0 0 1 1.055.209A3.6 3.6 0 0 1 9.83 2.617a4.593 4.593 0 0 0 4.31 5.744 3.58 3.58 0 0 1-2.241.634q.244.477.394 1a4.59 4.59 0 0 0 3.624-2.04.5.5 0 0 0-.565-.755 3.593 3.593 0 0 1-4.065-5.422z" />
        </svg>
        <span className="ms-2 text-xl font-bold text-gray-100">SleepTracker</span>
      </div>

      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'block rounded-md px-3 py-2 text-md font-medium',
                isActive
                  ? 'bg-gray-400 text-gray-100'
                  : 'text-gray-300 hover:bg-gray-100'
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <button
        onClick={() =>
          signOut({
            callbackUrl: '/',
          })
        }
        className="mt-4 w-full rounded-md bg-cyan-200 py-2 text-center text-sm font-semibold text-gray-900 hover:bg-cyan-400"
      >
        Logout
      </button>
    </aside>
  );
}


