'use client';

import * as React from 'react';
import Link from 'next/link';
import type { SessionUser } from '../../../server/lib/auth';
import { CheckCircle2, ChevronLeft, Clock, CreditCard, Info, MessageCircle, Plus, Receipt, Star } from 'lucide-react';
import { useToast } from '../../../components/ToastProvider';
import { formatDateTimeInBolivia, toWhatsAppHref } from '../../../lib/contact';
import { useTranslation } from '../../../lib/i18n';
import { RATE_PER_HOUR_BS } from '../../../lib/config';
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
  const [isUpdatingJob, setIsUpdatingJob] = React.useState(false);
  const [reviewRating, setReviewRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState('');

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
  const canFinalizeWithoutLog = canAddLogs;
  const canMarkPaid = currentUser.role === 'admin' && job.status === 'completed' && job.payment_status !== 'paid';
  const canReviewJob = currentUser.role === 'user' && currentUser.id === job.car_owner_id && job.status === 'completed';
  const mechanicWhatsApp = job.mechanic_phone
    ? toWhatsAppHref(job.mechanic_phone, `Hola ${job.mechanic_name ?? ''}, quiero consultar el trabajo de mi vehiculo ${job.car_plate}.`)
    : null;
  const ownerWhatsApp = job.car_owner_phone
    ? toWhatsAppHref(job.car_owner_phone, `Hola ${job.car_owner_name ?? ''}, te escribo sobre tu vehiculo ${job.car_plate} en STIC.`)
    : null;
  const ratingLabels = [
    t('jobs.reviewScaleOne'),
    t('jobs.reviewScaleTwo'),
    t('jobs.reviewScaleThree'),
    t('jobs.reviewScaleFour'),
    t('jobs.reviewScaleFive'),
  ];
  const activeRatingLabel =
    reviewRating > 0 ? ratingLabels[reviewRating - 1] : t('jobs.reviewScaleEmpty');

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

  const handleFinalizeJob = async () => {
    try {
      setIsUpdatingJob(true);
      await jobsService.updateJob(jobId, { status: 'completed' });
      await refresh();
      showToast(t('jobs.jobCompleted'), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('jobs.updateJobError'), 'error');
    } finally {
      setIsUpdatingJob(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setIsUpdatingJob(true);
      await jobsService.updateJob(jobId, { payment_status: 'paid' });
      await refresh();
      showToast(t('jobs.paymentMarkedPaid'), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('jobs.updateJobError'), 'error');
    } finally {
      setIsUpdatingJob(false);
    }
  };

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!reviewRating) {
      showToast(t('jobs.reviewRatingRequired'), 'error');
      return;
    }

    try {
      setIsUpdatingJob(true);
      await jobsService.updateJob(jobId, {
        mechanic_review_rating: reviewRating,
        mechanic_review_comment: reviewComment,
      });
      await refresh();
      showToast(t('jobs.reviewSaved'), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('jobs.updateJobError'), 'error');
    } finally {
      setIsUpdatingJob(false);
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
          {job.status === 'completed' ? (
            <div className="grid grid-cols-1 gap-3 pt-2 text-sm text-neutral-600 sm:grid-cols-2">
              <div>
                <span className="block font-semibold text-neutral-900">{t('jobs.status')}</span>
                <Badge variant="success" className="mt-2">{t(`status.${job.status}`)}</Badge>
              </div>
              <div>
                <span className="block font-semibold text-neutral-900">{t('jobs.paymentStatus')}</span>
                <div className="mt-2 rounded-2xl border border-secondary/10 bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant={job.payment_status === 'paid' ? 'success' : 'warning'}>
                        {t(`paymentStatus.${job.payment_status}`)}
                      </Badge>
                      <p className="mt-3 text-sm text-neutral-600">
                        {job.payment_status === 'paid'
                          ? t('jobs.paymentCompleteDescription')
                          : t('jobs.paymentPendingDescription')}
                      </p>
                    </div>
                    <div className={job.payment_status === 'paid' ? 'text-success' : 'text-warning'}>
                      {job.payment_status === 'paid' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {canMarkPaid ? (
                    <Button
                      type="button"
                      className="mt-4 w-full rounded-full"
                      onClick={handleMarkAsPaid}
                      isLoading={isUpdatingJob}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t('jobs.markAsPaid')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
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

      {/* ── Resumen de costo (solo cuando el trabajo está completado) ── */}
      {job.status === 'completed' && (() => {
        const totalMs = logs.reduce((acc, log) => {
          if (!log.ended_at) return acc;
          return acc + (new Date(log.ended_at).getTime() - new Date(log.started_at).getTime());
        }, 0);
        const totalHours = totalMs / (1000 * 60 * 60);
        const totalCost = totalHours * RATE_PER_HOUR_BS;

        return (
          <Card className="border-success/40 bg-success/5">
            <CardHeader className="border-b border-success/20 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-success" />
                <CardTitle className="text-success">{t('jobs.costSummary')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">{t('jobs.totalHours')}</span>
                <span className="font-semibold text-neutral-900">
                  {totalHours.toFixed(2)} {t('jobs.hoursUnit')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">{t('jobs.ratePerHour')}</span>
                <span className="font-semibold text-neutral-900">
                  {RATE_PER_HOUR_BS} Bs/{t('jobs.hoursUnit')}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-success/20 pt-3">
                <span className="text-base font-bold text-neutral-900">{t('jobs.totalCost')}</span>
                <span className="text-lg font-extrabold text-success">
                  {totalCost.toFixed(2)} Bs
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {job.status === 'completed' ? (
        <Card>
          <CardHeader className="border-b border-neutral-100 pb-4">
            <CardTitle>{t('jobs.mechanicExperience')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {job.mechanic_review_rating ? (
              <>
                <div className="inline-flex rounded-full bg-amber-50 px-4 py-2 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${index < job.mechanic_review_rating! ? 'fill-current' : 'text-amber-200'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-700">
                  {job.mechanic_review_comment || t('jobs.noReviewComment')}
                </p>
                {job.mechanic_reviewed_at ? (
                  <p className="text-xs text-neutral-500">
                    {t('jobs.reviewSubmittedAt')}: {formatDateTimeInBolivia(job.mechanic_reviewed_at)}
                  </p>
                ) : null}
              </>
            ) : canReviewJob ? (
              <form className="space-y-4" onSubmit={handleReviewSubmit}>
                <div>
                  <label className="mb-2 block text-sm text-neutral-600">{t('jobs.reviewStars')}</label>
                  <div className="rounded-[1.5rem] border border-secondary/10 bg-background/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const starValue = index + 1;
                        const isActive = starValue <= (hoverRating || reviewRating);

                        return (
                          <button
                            key={starValue}
                            type="button"
                            onClick={() => setReviewRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            onFocus={() => setHoverRating(starValue)}
                            onBlur={() => setHoverRating(0)}
                            className={`
                              rounded-full p-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                              ${isActive ? 'bg-amber-50 text-amber-500 shadow-[0_10px_24px_rgba(245,158,11,0.18)]' : 'text-neutral-300 hover:bg-neutral-100 hover:text-amber-400'}
                            `}
                            aria-label={`${starValue} ${t('jobs.reviewStarUnit')}`}
                            aria-pressed={starValue === reviewRating}
                          >
                            <Star className={`h-7 w-7 ${isActive ? 'fill-current' : ''}`} />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-neutral-700">{activeRatingLabel}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                        {hoverRating > 0 ? ratingLabels[hoverRating - 1] : t('jobs.reviewReadyHint')}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-neutral-600">{t('jobs.reviewComment')}</label>
                  <Textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder={t('jobs.reviewCommentPlaceholder')}
                    disabled={isUpdatingJob}
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={isUpdatingJob}>
                  {t('jobs.submitReview')}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-neutral-500">{t('jobs.reviewPending')}</p>
            )}
          </CardContent>
        </Card>
      ) : null}

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
        <>
          {canFinalizeWithoutLog ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleFinalizeJob}
              isLoading={isUpdatingJob}
            >
              {t('jobs.finishJobNow')}
            </Button>
          ) : null}

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
        </>
      ) : null}
    </div>
  );
}
