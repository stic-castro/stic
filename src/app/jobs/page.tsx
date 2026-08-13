import { redirect } from 'next/navigation';
import { JobsList } from '../../features/jobs/components/JobsList';
import { getCurrentUserFromCookies } from '../../server/lib/current-user';

export default async function JobsPage() {
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <JobsList currentUser={currentUser} />
      </div>
    </section>
  );
}
