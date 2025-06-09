// /app/api/devices/register/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/authOptions';
import { connectMongo } from '@/app/lib/mongoose';
import Device from '@/app/models/Device';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();
  const apiKey = crypto.randomBytes(24).toString('hex');

  const device = await Device.create({
    name,
    userId: session.user._id,
    apiKey,
  });

  return NextResponse.json({ apiKey: device.apiKey });
}
