import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '../../lib/authOptions';
import { getServerSession } from 'next-auth';
import { getActiveUser } from '../../lib/activeUserStore';
import SensorReading from '@/app/models/SensorReadings';

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const apiKey = request.headers.get('x-api-key');
    const isFromESP32 = apiKey === process.env.ESP32_API_KEY;

    let userId: string | undefined;

    if (isFromESP32) {
        // Get currently logged in user — for PoC, this works if only one user is ever active
        const activeUserId = getActiveUser();
        if (!activeUserId) {
          return NextResponse.json({ error: 'No active user' }, { status: 401 });
        }
        userId = activeUserId;
      } else {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        console.log('Decoded token:', token);
        if (!token || !token.sub) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        userId = token.sub;
    }
    const body = await request.json();
    const serverTimestamp = Math.floor(Date.now() / 1000);
    console.log('Received IMU data: ', body);

    if (Array.isArray(body)) {
        const sorted = [...body].sort((a, b) => a.timestamp - b.timestamp); // ESP32-relative
        const batch = sorted.map((entry) => ({
          respiratoryRate: entry.respiratoryRate,
          userId,
          timestamp: serverTimestamp - (sorted[sorted.length - 1].timestamp - entry.timestamp),
        }));
  
        await SensorReading.insertMany(batch);
        return NextResponse.json({ message: `Saved ${batch.length} readings` });
    }

    const data = {
      userId,
      respiratoryRate: body.respiratoryRate,
      timestamp: serverTimestamp - body.timestamp
    };

    await SensorReading.create(data);

    return NextResponse.json({ message: 'Data saved' });

  } catch (err) {
    console.error('IMU POST error:', err);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
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

