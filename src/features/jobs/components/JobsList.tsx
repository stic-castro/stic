'use client';

import * as React from 'react';
import Link from 'next/link';
import type { SessionUser } from '../../../server/lib/auth';
import { PlusCircle, Wrench, Calendar, Settings } from 'lucide-react';
import { useToast } from '../../../components/ToastProvider';
import { useTranslation } from '../../../lib/i18n';
import { useJobs } from '../hooks/useJobs';
import { Card, CardContent } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

export function JobsList({ currentUser }: { currentUser: SessionUser }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { jobs, loading, error } = useJobs();
  const [plateQuery, setPlateQuery] = React.useState('');
  const monitorStorageKey = React.useMemo(
    () => `tracked_car_plates:${currentUser.id}`,
    [currentUser.id]
  );
  const [trackedPlates, setTrackedPlates] = React.useState<string[]>([]);

  const canCreateJobs = currentUser.role === 'mechanic' || currentUser.role === 'admin';

  React.useEffect(() => {
    if (currentUser.role !== 'user') {
      return;
    }

    const raw = window.localStorage.getItem(monitorStorageKey);

    if (!raw) {
      setTrackedPlates([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      setTrackedPlates(Array.isArray(parsed) ? parsed : []);
    } catch {
      setTrackedPlates([]);
    }
  }, [currentUser.role, monitorStorageKey]);

  const visibleJobs = React.useMemo(() => {
    if (currentUser.role !== 'user') {
      return jobs;
    }

    let filteredJobs = jobs;

    if (trackedPlates.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        trackedPlates.includes(job.car_plate.toUpperCase())
      );
    }

    if (plateQuery.trim()) {
      filteredJobs = filteredJobs.filter((job) =>
        job.car_plate.toLowerCase().includes(plateQuery.trim().toLowerCase())
      );
    }

    return filteredJobs;
  }, [currentUser.role, jobs, plateQuery, trackedPlates]);
  const activeJobs = visibleJobs.filter((job) => job.status !== 'completed');
  const completedJobs = visibleJobs.filter((job) => job.status === 'completed');

  const clearTrackedPlates = () => {
    window.localStorage.removeItem(monitorStorageKey);
    setTrackedPlates([]);
    showToast(t('jobs.monitorCleared'), 'info');
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center p-6">
        <span className="text-secondary/50 font-medium">{t('jobs.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center p-6 text-error">
        <span>{t('jobs.error')}: {error}</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col h-60 items-center justify-center p-8 bg-white border border-neutral-200 rounded-lg text-center">
        <Wrench className="h-12 w-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700">{t('jobs.noJobs')}</h3>
        {canCreateJobs ? (
          <Link href="/jobs/new" className="mt-4">
            <Button variant="primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('jobs.createNew')}
            </Button>
          </Link>
        ) : null}
      </div>
    );
  }

  function renderJobCard(job: typeof visibleJobs[number]) {
    return (
      <Link href={`/jobs/${job.id}`} key={job.id}>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer active:bg-neutral-50 group">
          <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-base sm:text-lg text-neutral-800 line-clamp-2">
                {job.description}
              </h3>
              <Badge
                variant={
                  job.status === 'completed' ? 'success' :
                  job.status === 'in_progress' ? 'warning' : 'default'
                }
                className="ml-2 mt-1 sm:mt-0 whitespace-nowrap shrink-0"
              >
                {t(`status.${job.status}`)}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row text-sm text-neutral-500 gap-y-2 sm:gap-6 mt-1">
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                <span>{job.mechanic_name || t('jobs.unassignedMechanic')}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{job.car_brand} {job.car_model} - {job.car_plate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('jobs.title')}</h1>
        {canCreateJobs ? (
          <Link href="/jobs/new" className="mt-4 sm:mt-0">
            <Button variant="primary" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('jobs.createNew')}
            </Button>
          </Link>
        ) : null}
      </div>

      {currentUser.role === 'user' ? (
        <div className="rounded-2xl border border-secondary/8 bg-white/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                {t('jobs.plateFilterLabel')}
              </label>
              <input
                value={plateQuery}
                onChange={(event) => setPlateQuery(event.target.value)}
                placeholder={t('jobs.plateFilterPlaceholder')}
                className="flex h-12 w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-base shadow-sm"
              />
            </div>
            {trackedPlates.length > 0 ? (
              <Button type="button" variant="outline" className="rounded-full" onClick={clearTrackedPlates}>
                {t('jobs.clearMonitor')}
              </Button>
            ) : null}
          </div>

          {trackedPlates.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {trackedPlates.map((plate) => (
                <span
                  key={plate}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-secondary"
                >
                  {plate}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">{t('jobs.monitorHint')}</p>
          )}
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">{t('jobs.activeJobs')}</h2>
            <span className="text-sm text-neutral-500">{activeJobs.length}</span>
          </div>
          {activeJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeJobs.map(renderJobCard)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
              {t('jobs.noActiveJobs')}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">{t('jobs.historyTitle')}</h2>
            <span className="text-sm text-neutral-500">{completedJobs.length}</span>
          </div>
          {completedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {completedJobs.map(renderJobCard)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
              {t('jobs.noCompletedJobs')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
