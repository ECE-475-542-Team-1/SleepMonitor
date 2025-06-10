import { getToken } from 'next-auth/jwt';
import Device from '@/app/models/Device';
import { NextRequest } from 'next/server';

export async function resolveUserId(req: NextRequest): Promise<string | null> {
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    const device = await Device.findOne({ apiKey });
    return device?.userId?.toString() ?? null;
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub ?? null;
}
