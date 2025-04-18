'use client';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SensorData {
  timestamp: number;
  hr: number;
  spo2: number;
}

export default function DashboardClient() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();
        setSensorData(data);
      } catch (err) {
        console.error('Failed to fetch sensor data:', err);
      }
    };
  
    fetchData(); // Initial load
    const interval = setInterval(fetchData, 3000); // Every 3 seconds
  
    return () => clearInterval(interval);
  }, []);

  const timestamps = sensorData.map((item) =>
    new Date(item.timestamp * 1000).toLocaleTimeString()
  );
  const hrValues = sensorData.map((item) => item.hr);
  const spo2Values = sensorData.map((item) => item.spo2);

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: hrValues,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: 'SpO₂ (%)',
        data: spo2Values,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-screen-md p-4">
      <h1 className="mb-4 text-3xl font-bold">Sleep Tracker Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          title="Latest HR"
          value={sensorData[sensorData.length - 1]?.hr || '--'}
          unit="bpm"
        />
        <SummaryCard
          title="Latest SpO₂"
          value={sensorData[sensorData.length - 1]?.spo2 || '--'}
          unit="%"
        />
        <SummaryCard title="Data Points" value={sensorData.length} unit="" />

        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow">
          <div className="flex justify-between">
            <h3 className="me-1 text-lg font-medium text-gray-600">Sleep Score</h3>
            <div className="tooltip">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold">
            7 <span className="ml-1 text-base text-gray-500">/10</span>
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-md bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-semibold">Recent Readings</h2>
        {sensorData.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p className="text-gray-600">No data available yet.</p>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number | string;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      <p className="mt-2 text-2xl font-bold">
        {value}
        {unit && <span className="ml-1 text-base text-gray-500">{unit}</span>}
      </p>
    </div>
  );
}
