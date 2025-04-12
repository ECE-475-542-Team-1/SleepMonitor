'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

export default function AccountPage() {
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@example.com');
  const [height, setHeight] = useState(170); // in cm
  const [weight, setWeight] = useState(65);  // in kg
  const [age, setAge] = useState(30);

  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function(evt) {
        if (evt.target?.result) {
          setProfilePic(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updatedUserData = {
      name,
      email,
      height,
      weight,
      age,
    };
    console.log('Updated user data:', updatedUserData);
    alert('Account info updated');
  };

  return (
    <div className="max-w-screen-md p-4">
      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className="h-24 w-24 overflow-hidden rounded-full border bg-gray-100">
          {profilePic ? (
            <img
              src={profilePic}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-sm font-semibold text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="rounded border border-gray-300 p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-sm font-semibold text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="rounded border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col w-full">
            <label htmlFor="height" className="mb-1 text-sm font-semibold text-gray-700">
              Height (cm)
            </label>
            <input
              id="height"
              type="number"
              className="rounded border border-gray-300 p-2"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="weight" className="mb-1 text-sm font-semibold text-gray-700">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              className="rounded border border-gray-300 p-2"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="age" className="mb-1 text-sm font-semibold text-gray-700">
              Age
            </label>
            <input
              id="age"
              type="number"
              className="rounded border border-gray-300 p-2"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

