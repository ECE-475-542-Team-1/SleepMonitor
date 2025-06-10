import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import SensorData from '@/app/models/SensorReadings';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.sub;

    // Fetch only this user's sensor data
    const raw = await SensorData.find({ userId }).sort({ timestamp: 1 }).lean();

    const SESSION_GAP = 30 * 60;
    const sessions: typeof raw[] = [];
    let currentSession: typeof raw = [];

    for (let i = 0; i < raw.length; i++) {
      const current = raw[i];
      const prev = raw[i - 1];

      if (i === 0 || (current.timestamp - prev.timestamp) <= SESSION_GAP) {
        currentSession.push(current);
      } else {
        if (currentSession.length > 0) sessions.push(currentSession);
        currentSession = [current];
      }
    }
    if (currentSession.length > 0) sessions.push(currentSession);

    const lastSessions = sessions.slice(-4);
    const flattened = lastSessions.flat();

    const valid = (x: any) => typeof x === 'number' && x > 0 && !isNaN(x);

    const heartRateArray = flattened.map(d => d.hr).filter(valid);
    const spo2Array = flattened.map(d => d.spo2).filter(valid);
    const rrArray = flattened.map(d => d.respiratoryRate).filter(valid);

    return NextResponse.json({ heartRateArray, spo2Array, rrArray });
  } catch (error) {
    console.error('[API ERROR] /api/averages:', error);
    return NextResponse.json({ error: 'Failed to fetch average data' }, { status: 500 });
  }
}




