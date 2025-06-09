import { NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import SensorData from '@/app/models/SensorReadings';

export async function GET() {
  try {
    await connectMongo();
    const data = await SensorData.find({}).lean();

    const heartRateArray = data.map(d => d.hr).filter(hr => typeof hr === 'number');
    const spo2Array = data.map(d => d.spo2).filter(s => typeof s === 'number');

    return NextResponse.json({ heartRateArray, spo2Array });
  } catch (error) {
    console.error('[API ERROR] /api/averages:', error);
    return NextResponse.json({ error: 'Failed to fetch average data' }, { status: 500 });
  }
}

