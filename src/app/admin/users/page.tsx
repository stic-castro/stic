import { redirect } from 'next/navigation';
import { AdminUsersPanel } from '../../../features/admin/components/AdminUsersPanel';
import { getCurrentUserFromCookies } from '../../../server/lib/current-user';
import { UserService } from '../../../server/services/users.service';

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'admin') {
    redirect('/profile');
  }

  const users = await UserService.getAll();

  return <AdminUsersPanel currentUser={currentUser} initialUsers={users} />;
}
