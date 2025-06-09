// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { connectMongo } from '@/app/lib/mongoose';
import User from '@/app/models/Users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/authOptions';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectMongo();
  const user = await User.findById(session.user!._id).lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { name, email, height, weight, age, profilePic } = user as any;
  return NextResponse.json({ name, email, height, weight, age, profilePic });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await request.json();
  await connectMongo();
  const user = await User.findByIdAndUpdate(
    session.user!._id,
    { $set: updates },
    { new: true }
  ).lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ message: 'Updated' });
}
