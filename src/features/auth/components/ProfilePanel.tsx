'use client';

import * as React from 'react';
import { NotificationCenter } from '../../../components/NotificationCenter';
import { Badge } from '../../../components/Badge';
import { useTranslation } from '../../../lib/i18n';
import type { SessionUser } from '../../../server/lib/auth';
import type { TimeEntryWithRelations } from '../../../server/types';

type ProfilePanelProps = {
  user: SessionUser;
  attendanceEntries?: TimeEntryWithRelations[];
};

function getDurationMs(entry: TimeEntryWithRelations, now: number) {
  const start = new Date(entry.checked_in_at).getTime();
  const end = entry.checked_out_at ? new Date(entry.checked_out_at).getTime() : now;
  return Math.max(0, end - start);
}

function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

export function ProfilePanel({ user, attendanceEntries = [] }: ProfilePanelProps) {
  const { t } = useTranslation();
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const attendanceOpenEntry = attendanceEntries.find((entry) => !entry.checked_out_at);
  const attendanceDurationMs = attendanceEntries.reduce(
    (total, entry) => total + getDurationMs(entry, now),
    0
  );

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-secondary/8 bg-secondary px-6 py-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('auth.profileEyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{user.name}</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/74 sm:text-base">
            {t('auth.profileDescription')}
          </p>

          <div className="mt-8 rounded-[1.5rem] border border-white/12 bg-white/8 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{t('auth.currentRole')}</p>
            <p className="mt-3 text-2xl font-semibold">{t(`auth.${user.role}Role`)}</p>
            <p className="mt-2 text-sm text-white/65">{t('auth.roleManagementNote')}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-secondary/8 bg-white/86 p-6 shadow-sm backdrop-blur dark:bg-secondary/18 sm:p-8">
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-secondary/8 bg-background px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/50 dark:text-white/45">
                {t('auth.accountName')}
              </p>
              <p className="mt-2 text-lg font-semibold text-secondary dark:text-white">{user.name}</p>
            </div>

            <div className="rounded-[1.5rem] border border-secondary/8 bg-background px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/50 dark:text-white/45">
                {t('auth.accountEmail')}
              </p>
              <p className="mt-2 text-lg font-semibold text-secondary dark:text-white">{user.email}</p>
            </div>

            <div className="rounded-[1.5rem] border border-secondary/8 bg-background px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/50 dark:text-white/45">
                {t('auth.accountPhone')}
              </p>
              <p className="mt-2 text-lg font-semibold text-secondary dark:text-white">{user.phone}</p>
            </div>

            <div className="rounded-[1.5rem] border border-secondary/8 bg-background px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/50 dark:text-white/45">
                {t('auth.role')}
              </p>
              <p className="mt-2 text-lg font-semibold text-secondary dark:text-white">{t(`auth.${user.role}Role`)}</p>
            </div>

            {user.role === 'mechanic' || user.role === 'trainee' ? (
              <div className="rounded-[1.5rem] border border-secondary/8 bg-background px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/50 dark:text-white/45">
                  {t('attendance.profileTitle')}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge variant={attendanceOpenEntry ? 'success' : 'outline'}>
                    {attendanceOpenEntry ? t('attendance.checkedIn') : t('attendance.checkedOut')}
                  </Badge>
                  <p className="text-lg font-semibold text-secondary dark:text-white">
                    {formatDuration(attendanceDurationMs)}
                  </p>
                </div>
              </div>
            ) : null}

            <NotificationCenter />
          </div>
        </section>
      </div>
    </div>
  );
}
