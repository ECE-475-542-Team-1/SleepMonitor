import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/authOptions';
import { redirect } from 'next/navigation';
import AccountsClient from './AccountsClient';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/signin');
  }

  return <AccountsClient />;
}

