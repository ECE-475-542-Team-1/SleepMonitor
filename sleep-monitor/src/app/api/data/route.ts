import { NextResponse } from 'next/server';

interface SensorData {
  timestamp: number;
  hr: number;
  spo2: number;
}

// Temporary in-memory store for demo
const sensorDataStore: SensorData[] = [
  { timestamp: 1680730012, hr: 72, spo2: 98 },
  { timestamp: 1680730022, hr: 71, spo2: 97 },
  { timestamp: 1680730032, hr: 73, spo2: 95 },
  { timestamp: 1680730042, hr: 78, spo2: 93 },
  { timestamp: 1680730052, hr: 89, spo2: 90 },
  { timestamp: 1680730062, hr: 94, spo2: 88 },
  { timestamp: 1680730072, hr: 84, spo2: 92 },
];

export async function GET() {
  return NextResponse.json(sensorDataStore);
}

export async function POST(request: Request) {
  const body = await request.json();
  // e.g., body could be { timestamp: 1680730140, hr: 75, spo2: 97 }
  sensorDataStore.push(body);

  return NextResponse.json({ message: 'Data received' });
}

