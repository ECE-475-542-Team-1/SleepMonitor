// /app/api/active-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/authOptions';
import { setActiveUser } from '../../lib/activeUserStore';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?._id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  setActiveUser(session.user._id);
  return NextResponse.json({ message: 'Active user set' });
}
