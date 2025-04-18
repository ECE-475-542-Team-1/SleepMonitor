'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface Profile {
  name: string;
  email: string;
  height: number;
  weight: number;
  age: number;
  profilePic?: string;
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    fetch('/api/user')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data: Profile) => setProfile(data))
      .catch(() => setError('Could not load profile 123'))
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

  if (status === 'loading' || loading) {
    return <p className="p-4">Loading profile…</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-4">
        <p>You must be signed in to view this page.</p>
        <button
          onClick={() => signOut()}
          className="mt-2 rounded text-sm text-blue-600 hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-md p-4">
      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center space-x-4">
        <div className="h-24 w-24 overflow-hidden rounded-full border bg-gray-100">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              No photo
            </div>
          )}
        </div>
        <label className="cursor-pointer rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600">
          Change Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Name
          </label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 p-2"
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded border border-gray-300 p-2"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
          />
        </div>

        {/* Height, Weight, Age */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label
              htmlFor="height"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Height (cm)
            </label>
            <input
              id="height"
              type="number"
              className="w-full rounded border border-gray-300 p-2"
              value={profile.height}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  height: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label
              htmlFor="weight"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              className="w-full rounded border border-gray-300 p-2"
              value={profile.weight}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  weight: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label
              htmlFor="age"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Age
            </label>
            <input
              id="age"
              type="number"
              className="w-full rounded border border-gray-300 p-2"
              value={profile.age}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  age: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
