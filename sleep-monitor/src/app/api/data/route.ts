import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/authOptions';
import { getActiveUser } from '../../lib/activeUserStore';
import SensorReading from '@/app/models/SensorReadings';

export async function GET(req: NextRequest) {
  await connectMongo();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;

  const readings = await SensorReading.find({ userId })
    .sort({ timestamp: 1 })
    .lean();

  return NextResponse.json(readings);
}


// DELETE latest reading
export async function DELETE(request: NextRequest) {
  await connectMongo();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionStartStr = searchParams.get('sessionStart');

  if (sessionStartStr) {
    const sessionStart = Number(sessionStartStr);
    if (isNaN(sessionStart)) {
      return NextResponse.json({ error: 'Invalid sessionStart' }, { status: 400 });
    }

    const sessionEnd = sessionStart + 60 * 60 * 12;

    const result = await SensorReading.deleteMany({
      userId: session.user._id,
      timestamp: { $gte: sessionStart, $lte: sessionEnd },
    });

    return NextResponse.json({
      message: `Deleted ${result.deletedCount} readings in session`,
    });
  }

  const latest = await SensorReading.findOne({ userId: session.user._id })
  .sort({ timestamp: -1 });

  if (!latest) {
    return NextResponse.json({ error: 'No data to delete' }, { status: 404 });
  }

  await SensorReading.deleteOne({ _id: latest._id });
  return NextResponse.json({ message: 'Deleted most recent reading' });
}


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

    if (Array.isArray(body)) {
      const sorted = [...body].sort((a, b) => a.timestamp - b.timestamp); // ESP32-relative
      const batch = sorted.map((entry) => ({
        hr: entry.hr,
        spo2: entry.spo2,
        userId,
        timestamp: serverTimestamp - (sorted[sorted.length - 1].timestamp - entry.timestamp),
      }));

      await SensorReading.insertMany(batch);
      return NextResponse.json({ message: `Saved ${batch.length} readings` });
    }

    const data = {
      userId,
      hr: body.hr,
      spo2: body.spo2,
      timestamp: serverTimestamp,
    };

    await SensorReading.create(data);

    return NextResponse.json({ message: 'Data saved' });
  } catch (err) {
    console.error('Error parsing/saving data: ', err);
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}




