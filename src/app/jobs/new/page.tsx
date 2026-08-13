import { redirect } from 'next/navigation';
import { CreateJobForm } from '../../../features/jobs/components/CreateJobForm';
import { getCurrentUserFromCookies } from '../../../server/lib/current-user';

export default async function NewJobPage() {
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'mechanic' && currentUser.role !== 'admin') {
    redirect('/jobs');
  }

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <CreateJobForm currentUser={currentUser} />
      </div>
    </section>
  );
}
