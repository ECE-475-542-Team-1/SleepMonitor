'use client';

import { useState } from 'react';
import { Key } from 'lucide-react';

export default function RegisterDevicePage() {
  const [deviceName, setDeviceName] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registerDevice = async () => {
    setLoading(true);
    setApiKey(null);

    const res = await fetch('/api/devices/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: deviceName }),
    });

    const data = await res.json();
    if (res.ok) {
      setApiKey(data.apiKey);
    } else {
      alert(data.error || 'Failed to register device');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white">Register Device</h1>
          <p className="text-slate-400">Generate a new API key for an ESP32 and link it to your account.</p>
        </header>

        <section className="rounded-xl bg-slate-800/80 backdrop-blur p-6 shadow border border-slate-700/30 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-700/30 pb-3">
            <Key className="text-teal-400" size={20} />
            <h2 className="text-lg font-semibold text-white">New Device Registration</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="e.g. MyNewESP32"
              className="w-full rounded-md border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-600"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />

            <button
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
              onClick={registerDevice}
              disabled={!deviceName || loading}
            >
              {loading ? 'Registering...' : 'Register Device'}
            </button>
          </div>
        </section>

        {apiKey && (
          <section className="rounded-xl bg-gradient-to-br from-teal-900/30 to-slate-900/60 backdrop-blur p-6 shadow border border-teal-700/30 space-y-4">
            <h2 className="text-lg font-semibold text-teal-300">API Key Generated</h2>
            <p className="text-slate-300">Copy this key and flash it to your ESP32. It will not be shown again.</p>
            <code className="block break-words rounded bg-slate-800 p-4 font-mono text-sm text-cyan-400 border border-slate-700">
              {apiKey}
            </code>
          </section>
        )}

        <footer className="pt-4 border-t border-slate-700/40 text-sm text-slate-500">
          Each device can only be used by one account. Lost your key? Register a new device.
        </footer>
      </div>
    </main>
  );
}

