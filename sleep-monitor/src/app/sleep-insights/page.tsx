import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';
import { redirect } from 'next/navigation';
import SleepInsightsClient from './SleepInsightsClient';

export default async function SleepInsightsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/signin');
  }

  return <SleepInsightsClient />;
}

