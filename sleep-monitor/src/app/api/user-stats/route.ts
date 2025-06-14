import { NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import SensorReading from '@/app/models/SensorReadings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/authOptions';

export async function GET() {
  await connectMongo();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user._id;

  const data = await SensorReading.find({ userId }).lean();

  const valid = (x: any): x is number => typeof x === 'number' && x > 0 && !isNaN(x);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const stdDev = (arr: number[], mean: number | null) =>
    mean !== null && arr.length
      ? Math.sqrt(arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / arr.length)
      : null;

  const hrArray = data.map(d => d.hr).filter(valid);
  const spo2Array = data.map(d => d.spo2).filter(valid);
  const rrArray = data.map(d => d.respiratoryRate).filter(valid);

  const hrBaseline = avg(hrArray);
  const spo2Baseline = avg(spo2Array);
  const rrBaseline = avg(rrArray);

  const hrStd = stdDev(hrArray, hrBaseline);
  const spo2Std = stdDev(spo2Array, spo2Baseline);
  const rrStd = stdDev(rrArray, rrBaseline);

  return NextResponse.json({
    hrBaseline, spo2Baseline, rrBaseline,
    hrStd, spo2Std, rrStd
  });
}

