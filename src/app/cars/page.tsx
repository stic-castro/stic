import { redirect } from 'next/navigation';
import { CarsDashboard } from '../../features/cars/components/CarsDashboard';
import { getCurrentUserFromCookies } from '../../server/lib/current-user';

export default async function CarsPage() {
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  return <CarsDashboard currentUser={currentUser} />;
}
