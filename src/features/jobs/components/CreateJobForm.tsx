'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '../../../server/lib/auth';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { useToast } from '../../../components/ToastProvider';
import { useTranslation } from '../../../lib/i18n';
import { Button } from '../../../components/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/Card';
import { Textarea } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { useFormOptions } from '../hooks/useJobs';
import { jobsService } from '../services/jobs.service';
import { CreateJobDTO } from '../types';

export function CreateJobForm({ currentUser }: { currentUser: SessionUser }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const { mechanics, cars, loading: loadingOptions } = useFormOptions();

  const [formData, setFormData] = React.useState<CreateJobDTO>({
    description: '',
    mechanic_id: currentUser.role === 'mechanic' ? currentUser.id : '',
    car_id: '',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.mechanic_id || !formData.car_id) {
      showToast(t('jobs.allFieldsRequired'), 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await jobsService.createJob(formData);
      showToast(t('jobs.jobCreated'), 'success');
      router.push('/jobs');
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('jobs.createError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {t('jobs.title')}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('jobs.createNew')}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                {t('jobs.description')} <span className="text-error">*</span>
              </label>
              <Textarea
                required
                placeholder={t('jobs.descriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {currentUser.role === 'admin' ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  {t('jobs.mechanic')} <span className="text-error">*</span>
                </label>
                <Select
                  required
                  value={formData.mechanic_id}
                  onChange={(e) => setFormData({ ...formData, mechanic_id: e.target.value })}
                  disabled={isSubmitting || loadingOptions}
                >
                  <option value="" disabled>
                    {t('jobs.mechanicPlaceholder')}
                  </option>
                  {mechanics.map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id}>
                      {mechanic.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">{t('jobs.mechanic')}</label>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-700">
                  {currentUser.name}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                {t('jobs.car')} <span className="text-error">*</span>
              </label>
              <Select
                required
                value={formData.car_id}
                onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                disabled={isSubmitting || loadingOptions}
              >
                <option value="" disabled>
                  {t('jobs.carPlaceholder')}
                </option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.brand} {car.model} - {car.plate}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isSubmitting}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t('jobs.createJob')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push('/jobs')}
              disabled={isSubmitting}
            >
              {t('jobs.cancel')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
