// app/api/devices/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/authOptions';
import { connectMongo } from '@/app/lib/mongoose';
import Device from '@/app/models/Device';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const devices = await Device.find({ userId: session.user._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(devices);
}

export async function DELETE(req: NextRequest) {
  await connectMongo();
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { apiKey } = await req.json();
  const deleted = await Device.deleteOne({ apiKey, userId: session.user._id });

  if (deleted.deletedCount === 0) {
    return NextResponse.json({ error: 'Device not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Device deleted' });
}
