import { redirect } from 'next/navigation';
import { ProfilePanel } from '../../features/auth/components/ProfilePanel';
import { getCurrentUserFromCookies } from '../../server/lib/current-user';
import { TimeEntryService } from '../../server/services/time_entries.service';

export default async function ProfilePage() {
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  const attendanceEntries = currentUser.role === 'mechanic' || currentUser.role === 'trainee'
    ? await TimeEntryService.getEntries(currentUser, { userId: currentUser.id })
    : [];

  return <ProfilePanel user={currentUser} attendanceEntries={attendanceEntries} />;
}
