import { NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import SensorReading from '@/app/models/SensorReadings';

interface SensorData {
  timestamp: number;
  hr: number;
  spo2: number;
}

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
  try {
    const body = await request.json();
    console.log('Received from ESP32: ', body);
    sensorDataStore.push(body);

    return NextResponse.json({ message: 'Data received' });
  } catch(err) {
    console.error('Error parsing data: ', err);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  // try {
  //   const readings = await request.json();
  //   // connect to Mongo
  //   await connectMongo();

  //   await SensorReading.insertMany(readings);

  //   return NextResponse.json({ message: 'Batch inserted' }, { status: 201 });
  // } catch (error) {
  //   console.error('Error inserting sensor data:', error);
  //   return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 });
  // }
}


