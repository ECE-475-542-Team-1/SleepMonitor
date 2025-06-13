// Server Component – public landing page
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './lib/authOptions';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-sky-200 to-white">
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
          <span className="text-lg font-bold text-sky-700">SleepTracker</span>
        </div>

        <Link
          href="/signin"
          className="rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
        >
          Log In
        </Link>
      </header>

      <section className="mx-auto mt-20 flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 md:text-5xl">
          Better Sleep Through Insightful Data
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          SleepTracker pairs a lightweight wearable with real‑time analytics to
          highlight heart‑rate variability, SpO2 drops, and respiratory rate.
        </p>

        <Link
          href="/signup"
          className="mt-8 rounded bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-sky-700"
        >
          Try It Free
        </Link>
      </section>

      <section className="mx-auto mt-24 mb-4 grid w-full max-w-6xl gap-10 px-6 md:grid-cols-3">
        <Feature
          title="Tiny Wearable"
          text="Low‑profile ESP32 wristband tracks vitals all night on a single charge."
        />
        <Feature
          title="Edge Analytics"
          text="Batch uploads every 10 min to conserve battery while still capturing fine‑grain data."
        />
        <Feature
          title="Actionable Insights"
          text="Visualize trends, understand your sleep‑quality, and receive personalized tips."
        />
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-100 py-6 text-center text-sm text-slate-500">
        {new Date().getFullYear()} ECE 475/542 Team 1
      </footer>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-sky-700">{title}</h3>
      <p className="text-slate-600">{text}</p>
    </div>
  );
}


