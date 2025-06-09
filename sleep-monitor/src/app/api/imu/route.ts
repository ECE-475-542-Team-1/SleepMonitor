import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../../lib/authOptions';
import Device from '@/app/models/Device';
import SensorReading from '@/app/models/SensorReadings';

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const apiKey = request.headers.get('x-api-key');
    let userId: string | undefined;

    if (apiKey) {
      const device = await Device.findOne({ apiKey });
      if (!device) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      userId = device.userId.toString();
    } else {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token || !token.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = token.sub;
    }

    const body = await request.json();
    const serverTimestamp = Math.floor(Date.now() / 1000);
    console.log('Received IMU data:', body);

    if (Array.isArray(body)) {
      const sorted = [...body].sort((a, b) => a.timestamp - b.timestamp);
      const batch = sorted.map((entry) => ({
        userId,
        respiratoryRate: entry.respiratoryRate,
        timestamp: serverTimestamp - (sorted[sorted.length - 1].timestamp - entry.timestamp),
      }));

      await SensorReading.insertMany(batch);
      return NextResponse.json({ message: `Saved ${batch.length} IMU readings` });
    }

    const data = {
      userId,
      respiratoryRate: body.respiratoryRate,
      timestamp: serverTimestamp - body.timestamp,
    };

    await SensorReading.create(data);
    return NextResponse.json({ message: 'IMU data saved' });

  } catch (err) {
    console.error('IMU POST error:', err);
    return NextResponse.json({ error: 'Invalid IMU data' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  await connectMongo();
  const readings = await SensorReading
    .find({ respiratoryRate: { $exists: true } })
    .sort({ timestamp: 1 })
    .lean();
  return NextResponse.json(readings);
}


