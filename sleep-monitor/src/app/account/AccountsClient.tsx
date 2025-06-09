'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { UserCircle, Trash } from 'lucide-react';

interface Profile {
  name: string;
  email: string;
  height: number;
  weight: number;
  age: number;
  profilePic?: string;
}

interface Device {
  name: string;
  apiKey: string;
  createdAt: string;
}

export default function AccountsClient() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    height: 0,
    weight: 0,
    age: 0,
    profilePic: '',
  });
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    Promise.all([
      fetch('/api/user').then((res) => res.ok ? res.json() : Promise.reject()),
      fetch('/api/devices').then((res) => res.ok ? res.json() : Promise.reject())
    ])
      .then(([userData, deviceData]) => {
        setProfile(userData);
        setDevices(deviceData);
      })
      .catch(() => setError('Could not load profile or devices'))
      .finally(() => setLoading(false));
  }, [status]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setProfile((p) => ({ ...p, profilePic: evt.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      setError('Save failed');
    } else {
      alert('Profile updated');
    }
    setSaving(false);
  }

  async function deleteDevice(apiKey: string) {
    const res = await fetch('/api/devices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });

    if (res.ok) {
      setDevices((prev) => prev.filter((d) => d.apiKey !== apiKey));
    } else {
      alert('Failed to delete device');
    }
  }

  if (status === 'loading' || loading) {
    return <p className="p-4 text-slate-300">Loading profile…</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-6 text-slate-300">
        <p>You must be signed in to view this page.</p>
        <button
          onClick={() => signOut()}
          className="mt-2 rounded text-sm text-cyan-400 hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white">Account Settings</h1>
          <p className="text-slate-400">Update your personal details and manage your devices.</p>
        </header>

        {error && (
          <div className="rounded bg-red-500/20 p-4 text-sm text-red-300 border border-red-500/40">
            {error}
          </div>
        )}

        <section className="rounded-xl bg-slate-800/80 backdrop-blur p-6 shadow border border-slate-700/30 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-600 bg-slate-900">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-500">
                  <UserCircle size={48} />
                </div>
              )}
            </div>

            <label className="cursor-pointer rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 transition">
              Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Height (cm)</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100"
                  value={profile.height}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, height: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Weight (kg)</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100"
                  value={profile.weight}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, weight: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Age</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-600 bg-slate-900 px-4 py-2 text-slate-100"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, age: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md bg-cyan-600 py-2 text-white text-sm font-medium hover:bg-cyan-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </section>

        {devices.length > 0 && (
          <section className="rounded-xl bg-slate-800/80 backdrop-blur p-6 shadow border border-slate-700/30 space-y-4">
            <h2 className="text-lg font-semibold text-white">Registered Devices</h2>
            <ul className="divide-y divide-slate-700/40">
              {devices.map((device, idx) => (
                <li key={idx} className="flex items-center justify-between py-2">
                  <div className="text-sm text-slate-300">
                    <p className="font-medium">{device.name || 'Unnamed Device'}</p>
                    <p className="text-xs text-slate-500">{new Date(device.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => deleteDevice(device.apiKey)}
                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 transition"
                  >
                    <Trash size={14} className="inline mr-1" /> Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}


