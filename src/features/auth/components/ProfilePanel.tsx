'use client';

import { NotificationCenter } from '../../../components/NotificationCenter';
import { LogoutButton } from '../../../components/LogoutButton';
import { useTranslation } from '../../../lib/i18n';
import type { SessionUser } from '../../../server/lib/auth';

type ProfilePanelProps = {
  user: SessionUser;
};

export function ProfilePanel({ user }: ProfilePanelProps) {
  const { t } = useTranslation();

  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
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

            <NotificationCenter />

            <LogoutButton className="w-full justify-center" />
          </div>
        </section>
      </div>
    </main>
  );
}
