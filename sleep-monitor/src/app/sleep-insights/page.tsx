'use client';

import React, { useState } from 'react';

export default function SleepInsightsPage() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const heartRateArray = [72, 75, 78, 68, 65];
  const spo2Array = [98, 97, 97, 96, 95];
//   const motionArray = [0, 1, 0, 2, 1]; // e.g., motion events per interval

  const handleAnalyze = async () => {
    setLoading(true);
    setInsights('');

    try {
      const response = await fetch('/api/sleepAnalysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartRateArray, spo2Array}),
      });
      const json = await response.json();

      if (json.insights) {
        setInsights(json.insights);
      } else {
        setInsights('No insights received.');
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      setInsights('Error fetching insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-md p-4">
      <h1 className="mb-4 text-2xl font-bold">Sleep Quality</h1>
      <p className="mb-6 text-gray-700">
        Below is a brief analysis of your recent sleep metrics.
        Please note this is not medical advice.
      </p>

      <button
        onClick={handleAnalyze}
        className="rounded bg-blue-500 px-4 py-2 font-semibold text-white shadow hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Analyze My Sleep'}
      </button>

      <div className="mt-6 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">AI Insights</h2>
        {insights ? (
          <div className="whitespace-pre-wrap text-gray-700">{insights}</div>
        ) : (
          <p className="text-gray-500">No insights yet. Click "Analyze My Sleep" above.</p>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Disclaimer: This analysis is auto-generated and not a substitute for professional medical advice.
      </p>
    </div>
  );
}

