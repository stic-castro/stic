import { redirect } from 'next/navigation';
import { JobDetail } from '../../../features/jobs/components/JobDetail';
import { getCurrentUserFromCookies } from '../../../server/lib/current-user';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const currentUser = await getCurrentUserFromCookies();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <JobDetail jobId={resolvedParams.id} currentUser={currentUser} />
      </div>
    </main>
  );
}
