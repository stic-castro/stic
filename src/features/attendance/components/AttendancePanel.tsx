'use client';

import * as React from 'react';
import { CalendarDays, Clock, LogIn, LogOut, TimerReset, Users } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Select } from '../../../components/Select';
import { useToast } from '../../../components/ToastProvider';
import { formatDateTimeInBolivia } from '../../../lib/contact';
import { useTranslation } from '../../../lib/i18n';
import type { SessionUser } from '../../../server/lib/auth';
import type { TimeEntryWithRelations, User } from '../../../server/types';

type AttendancePanelProps = {
  currentUser: SessionUser;
  initialUsers: User[];
  initialEntries: TimeEntryWithRelations[];
};

const boliviaDateFormatter = new Intl.DateTimeFormat('es-BO', {
  dateStyle: 'full',
  timeZone: 'America/La_Paz',
});

function getDurationMs(entry: TimeEntryWithRelations, now: number) {
  const start = new Date(entry.checked_in_at).getTime();
  const end = entry.checked_out_at ? new Date(entry.checked_out_at).getTime() : now;
  return Math.max(0, end - start);
}

function formatHours(hours: number) {
  return `${hours.toFixed(2)} h`;
}

function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function getDateKey(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

export function AttendancePanel({ currentUser, initialUsers, initialEntries }: AttendancePanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [users] = React.useState(initialUsers);
  const [entries, setEntries] = React.useState(initialEntries);
  const [selectedUserId, setSelectedUserId] = React.useState(
    currentUser.role === 'admin' ? 'all' : currentUser.id
  );
  const [savingUserId, setSavingUserId] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const canManage = currentUser.role === 'admin' || currentUser.role === 'mechanic';
  const markableUsers = React.useMemo(
    () =>
      users.filter((user) => {
        if (currentUser.role === 'admin') {
          return user.role === 'mechanic' || user.role === 'trainee';
        }

        return currentUser.role === 'mechanic' && user.role === 'trainee';
      }),
    [currentUser.role, users]
  );

  const openEntryByUser = React.useMemo(() => {
    const map = new Map<string, TimeEntryWithRelations>();
    entries.forEach((entry) => {
      if (!entry.checked_out_at) {
        map.set(entry.user_id, entry);
      }
    });
    return map;
  }, [entries]);

  const reportEntries = React.useMemo(() => {
    if (selectedUserId === 'all' && currentUser.role === 'admin') {
      return entries;
    }

    return entries.filter((entry) => entry.user_id === selectedUserId);
  }, [currentUser.role, entries, selectedUserId]);

  const totalHours = React.useMemo(
    () => reportEntries.reduce((total, entry) => total + getDurationMs(entry, now) / 3600000, 0),
    [now, reportEntries]
  );

  const reportGroups = React.useMemo(() => {
    const groups = new Map<string, TimeEntryWithRelations[]>();

    reportEntries.forEach((entry) => {
      const key = getDateKey(entry.checked_in_at);
      groups.set(key, [...(groups.get(key) ?? []), entry]);
    });

    return Array.from(groups.entries()).map(([date, dateEntries]) => ({
      date,
      entries: dateEntries,
      totalMs: dateEntries.reduce((total, entry) => total + getDurationMs(entry, now), 0),
    }));
  }, [now, reportEntries]);

  const handleAction = async (userId: string, action: 'check-in' | 'check-out') => {
    try {
      setSavingUserId(userId);

      const response = await fetch(`/api/time-entries/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('attendance.actionError'));
      }

      setEntries((current) => {
        if (action === 'check-in') {
          return [data, ...current];
        }

        return current.map((entry) => (entry.id === data.id ? data : entry));
      });
      showToast(
        action === 'check-in' ? t('attendance.checkInSuccess') : t('attendance.checkOutSuccess'),
        'success'
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('attendance.actionError'), 'error');
    } finally {
      setSavingUserId(null);
    }
  };

  const selfOpenEntry = openEntryByUser.get(currentUser.id);
  const selfEntries = entries.filter((entry) => entry.user_id === currentUser.id);
  const selfTotalHours = selfEntries.reduce((total, entry) => total + getDurationMs(entry, now) / 3600000, 0);

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-secondary/8 bg-secondary px-6 py-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('attendance.eyebrow')}
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t('attendance.title')}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base">
                {t('attendance.description')}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[24rem]">
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">{t('attendance.myStatus')}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={selfOpenEntry ? 'success' : 'outline'} className="border-white/20 text-white">
                    {selfOpenEntry ? t('attendance.checkedIn') : t('attendance.checkedOut')}
                  </Badge>
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">{t('attendance.myTotal')}</p>
                <p className="mt-2 text-2xl font-semibold">{formatHours(selfTotalHours)}</p>
              </div>
            </div>
          </div>
        </section>

        {canManage ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-secondary dark:text-white">{t('attendance.controlTitle')}</h2>
                <p className="mt-1 text-sm text-secondary/60 dark:text-white/60">{t('attendance.controlDescription')}</p>
              </div>
              <Users className="h-5 w-5 text-secondary/40 dark:text-white/40" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {markableUsers.map((user) => {
                const openEntry = openEntryByUser.get(user.id);

                return (
                  <article
                    key={user.id}
                    className="grid gap-4 rounded-[1.5rem] border border-secondary/8 bg-white/86 p-5 shadow-sm backdrop-blur dark:bg-secondary/18 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold text-secondary dark:text-white">{user.name}</h3>
                        <Badge variant={openEntry ? 'success' : 'outline'}>
                          {openEntry ? t('attendance.checkedIn') : t('attendance.checkedOut')}
                        </Badge>
                        <Badge variant="outline">{t(`auth.${user.role}Role`)}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-secondary/60 dark:text-white/60">{user.email}</p>
                      {openEntry ? (
                        <p className="mt-2 text-sm text-secondary/72 dark:text-white/72">
                          {t('attendance.since')} {formatDateTimeInBolivia(openEntry.checked_in_at)}
                        </p>
                      ) : null}
                    </div>

                    <Button
                      type="button"
                      variant={openEntry ? 'secondary' : 'primary'}
                      className="rounded-full"
                      isLoading={savingUserId === user.id}
                      onClick={() => handleAction(user.id, openEntry ? 'check-out' : 'check-in')}
                    >
                      {openEntry ? <LogOut className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                      {openEntry ? t('attendance.checkOut') : t('attendance.checkIn')}
                    </Button>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="space-y-5">
          <div className="grid gap-4 rounded-[1.5rem] border border-secondary/8 bg-white/86 p-5 shadow-sm backdrop-blur dark:bg-secondary/18 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/45 dark:text-white/45">
                {t('attendance.reportEyebrow')}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-secondary dark:text-white">{t('attendance.reportTitle')}</h2>
            </div>
            {currentUser.role === 'admin' ? (
              <label className="grid gap-2 text-sm font-medium text-secondary/70 dark:text-white/70 lg:min-w-[18rem]">
                {t('attendance.person')}
                <Select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                  <option value="all">{t('attendance.allPeople')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {t(`auth.${user.role}Role`)}
                    </option>
                  ))}
                </Select>
              </label>
            ) : null}
            <div className="rounded-2xl border border-secondary/8 bg-background px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm text-secondary/55 dark:text-white/55">
                <TimerReset className="h-4 w-4" />
                {t('attendance.accumulated')}
              </div>
              <p className="mt-2 text-2xl font-semibold text-secondary dark:text-white">{formatHours(totalHours)}</p>
            </div>
          </div>

          {reportGroups.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-secondary/15 bg-white/70 p-8 text-center text-secondary/60 dark:bg-secondary/12 dark:text-white/60">
              {t('attendance.emptyReport')}
            </div>
          ) : (
            <div className="space-y-4">
              {reportGroups.map((group) => (
                <article
                  key={group.date}
                  className="rounded-[1.5rem] border border-secondary/8 bg-white/86 p-5 shadow-sm backdrop-blur dark:bg-secondary/18"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-secondary dark:text-white">
                        {boliviaDateFormatter.format(new Date(`${group.date}T12:00:00-04:00`))}
                      </h3>
                    </div>
                    <Badge variant="outline">{formatDuration(group.totalMs)}</Badge>
                  </div>

                  <div className="mt-4 divide-y divide-secondary/8 dark:divide-white/10">
                    {group.entries.map((entry) => (
                      <div key={entry.id} className="grid gap-3 py-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
                        <div>
                          <p className="text-sm font-semibold text-secondary dark:text-white">{entry.user_name}</p>
                          <p className="text-xs text-secondary/50 dark:text-white/50">{t(`auth.${entry.user_role}Role`)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary/70 dark:text-white/70">
                          <LogIn className="h-4 w-4 text-success" />
                          {formatDateTimeInBolivia(entry.checked_in_at)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary/70 dark:text-white/70">
                          <LogOut className="h-4 w-4 text-error" />
                          {entry.checked_out_at ? formatDateTimeInBolivia(entry.checked_out_at) : t('attendance.openEntry')}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-secondary dark:text-white">
                          <Clock className="h-4 w-4 text-primary" />
                          {formatDuration(getDurationMs(entry, now))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
