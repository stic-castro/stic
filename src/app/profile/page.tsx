import { redirect } from 'next/navigation';
import { ProfilePanel } from '../../features/auth/components/ProfilePanel';
import { getCurrentUserFromCookies } from '../../server/lib/current-user';

export default async function ProfilePage() {
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  return <ProfilePanel user={currentUser} />;
}
