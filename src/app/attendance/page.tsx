import { redirect } from 'next/navigation';
import { AttendancePanel } from '../../features/attendance/components/AttendancePanel';
import { getCurrentUserFromCookies } from '../../server/lib/current-user';
import { TimeEntryService } from '../../server/services/time_entries.service';

export default async function AttendancePage() {
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'admin') {
    redirect('/profile');
  }

  const dashboard = await TimeEntryService.getDashboard(currentUser);

  return (
    <AttendancePanel
      currentUser={currentUser}
      initialUsers={dashboard.users}
      initialEntries={dashboard.entries}
    />
  );
}
