'use client';

import * as React from 'react';
import Link from 'next/link';
import type { SessionUser } from '../../../server/lib/auth';
import { ChevronLeft, Clock, Info, MessageCircle, Plus } from 'lucide-react';
import { useToast } from '../../../components/ToastProvider';
import { formatDateTimeInBolivia, toWhatsAppHref } from '../../../lib/contact';
import { useTranslation } from '../../../lib/i18n';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/Card';
import { Input, Textarea } from '../../../components/Input';
import { useJobDetail } from '../hooks/useJobs';
import { jobsService } from '../services/jobs.service';

export function JobDetail({ jobId, currentUser }: { jobId: string; currentUser: SessionUser }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { job, logs, loading, error, refresh } = useJobDetail(jobId);

  const [newLogDesc, setNewLogDesc] = React.useState('');
  const [startedAt, setStartedAt] = React.useState('');
  const [endedAt, setEndedAt] = React.useState('');
  const [completeJob, setCompleteJob] = React.useState(false);
  const [isAddingLog, setIsAddingLog] = React.useState(false);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center p-6">
        <span className="font-medium text-secondary/50">{t('jobs.loading')}</span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex h-40 items-center justify-center p-6 text-error">
        <span>{error || t('jobs.error')}</span>
      </div>
    );
  }

  const canAddLogs =
    (currentUser.role === 'admin' || currentUser.id === job.mechanic_id) &&
    job.status !== 'completed';
  const mechanicWhatsApp = job.mechanic_phone
    ? toWhatsAppHref(job.mechanic_phone, `Hola ${job.mechanic_name ?? ''}, quiero consultar el trabajo de mi vehiculo ${job.car_plate}.`)
    : null;
  const ownerWhatsApp = job.car_owner_phone
    ? toWhatsAppHref(job.car_owner_phone, `Hola ${job.car_owner_name ?? ''}, te escribo sobre tu vehiculo ${job.car_plate} en STIC.`)
    : null;

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLogDesc.trim() || !startedAt || !endedAt) {
      showToast(t('jobs.logFieldsRequired'), 'error');
      return;
    }

    try {
      setIsAddingLog(true);

      await jobsService.createProgressLog({
        job_id: jobId,
        description: newLogDesc,
        started_at: new Date(startedAt).toISOString(),
        ended_at: new Date(endedAt).toISOString(),
        complete_job: completeJob,
      });

      setNewLogDesc('');
      setStartedAt('');
      setEndedAt('');
      setCompleteJob(false);
      await refresh();
      showToast(completeJob ? t('jobs.jobCompleted') : t('jobs.logAdded'), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('jobs.logError'), 'error');
    } finally {
      setIsAddingLog(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {t('jobs.title')}
      </Link>

      <Card>
        <CardHeader className="border-b border-neutral-100 pb-4">
          <div className="flex items-start justify-between gap-4">
            <CardTitle>{t('jobs.viewDetails')}</CardTitle>
            <Badge
              variant={
                job.status === 'completed'
                  ? 'success'
                  : job.status === 'in_progress'
                    ? 'warning'
                    : 'default'
              }
            >
              {t(`status.${job.status}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-start">
            <Info className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-neutral-400" />
            <p className="font-medium text-neutral-700">{job.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 text-sm text-neutral-600">
            <div>
              <span className="block font-semibold text-neutral-900">{t('jobs.mechanic')}</span>
              <span>{job.mechanic_name || t('jobs.unassignedMechanic')}</span>
            </div>
            <div>
              <span className="block font-semibold text-neutral-900">{t('jobs.car')}</span>
              <span>{job.car_brand} {job.car_model} - {job.car_plate}</span>
            </div>
          </div>
          <div className="pt-2 text-sm text-neutral-600">
            <span className="block font-semibold text-neutral-900">{t('jobs.mechanicContact')}</span>
            <div className="mt-1 space-y-1">
              <div>{job.mechanic_email || t('jobs.noMechanicContact')}</div>
              <div>{job.mechanic_phone || t('jobs.noMechanicPhone')}</div>
              {currentUser.role === 'user' && mechanicWhatsApp ? (
                <a
                  href={mechanicWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t('jobs.contactMechanicWhatsApp')}
                </a>
              ) : null}
            </div>
          </div>
          {(currentUser.role === 'mechanic' || currentUser.role === 'admin') ? (
            <div className="pt-2 text-sm text-neutral-600">
              <span className="block font-semibold text-neutral-900">{t('jobs.customerContact')}</span>
              <div className="mt-1 space-y-1">
                <div>{job.car_owner_name || t('jobs.noCustomerContact')}</div>
                <div>{job.car_owner_email || t('jobs.noCustomerContact')}</div>
                <div>{job.car_owner_phone || t('jobs.noCustomerPhone')}</div>
                {ownerWhatsApp ? (
                  <a
                    href={ownerWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t('jobs.contactCustomerWhatsApp')}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="flex items-center text-lg font-bold text-neutral-900">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          {t('jobs.progressLogs')}
        </h3>

        {logs.length === 0 ? (
          <div className="rounded-md border border-dashed border-neutral-200 bg-white p-4 text-sm italic text-neutral-500">
            {t('jobs.noLogsYet')}
          </div>
        ) : (
          <div className="space-y-3 border-l-2 border-primary/20 pl-2">
            {logs.map((log) => (
              <div key={log.id} className="relative py-2 pl-6">
                <div className="absolute left-[-5px] top-4 h-2 w-2 rounded-full bg-primary" />
                <div className="rounded-md border border-neutral-100 bg-white p-3 text-sm shadow-sm">
                  <p className="text-neutral-800">{log.description}</p>
                  <span className="mt-2 block text-xs text-neutral-400">
                    {t('jobs.startedAt')}: {formatDateTimeInBolivia(log.started_at)}
                  </span>
                  <span className="mt-1 block text-xs text-neutral-400">
                    {t('jobs.endedAt')}: {log.ended_at ? formatDateTimeInBolivia(log.ended_at) : t('jobs.noEndTime')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canAddLogs ? (
        <Card>
          <CardHeader>
            <h4 className="font-semibold">{t('jobs.addLog')}</h4>
          </CardHeader>
          <form onSubmit={handleAddLog}>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-neutral-600">{t('jobs.logDescription')}</label>
                <Textarea
                  value={newLogDesc}
                  onChange={(e) => setNewLogDesc(e.target.value)}
                  placeholder={t('jobs.logPlaceholder')}
                  disabled={isAddingLog}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-600">{t('jobs.startedAt')}</label>
                <Input
                  type="datetime-local"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  disabled={isAddingLog}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-600">{t('jobs.endedAt')}</label>
                <Input
                  type="datetime-local"
                  value={endedAt}
                  onChange={(e) => setEndedAt(e.target.value)}
                  disabled={isAddingLog}
                />
              </div>
              <label className="flex items-center gap-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={completeJob}
                  onChange={(e) => setCompleteJob(e.target.checked)}
                  disabled={isAddingLog}
                />
                {t('jobs.markAsCompleted')}
              </label>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="primary" className="w-full" isLoading={isAddingLog}>
                <Plus className="mr-2 h-4 w-4" />
                {completeJob ? t('jobs.addLogAndFinish') : t('jobs.addLog')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
