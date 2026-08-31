'use client';

import Link from 'next/link';
import { Languages, LogIn, LogOut, Moon, Settings, Sun, UserPlus } from 'lucide-react';
import { Button } from '../../../components/Button';
import { LocaleSwitcher } from '../../../components/LocaleSwitcher';
import { LogoutButton } from '../../../components/LogoutButton';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { useTranslation } from '../../../lib/i18n';
import type { SessionUser } from '../../../server/lib/auth';

type SettingsPanelProps = {
  user: SessionUser | null;
};

export function SettingsPanel({ user }: SettingsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-white dark:bg-white dark:text-secondary">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {t('settings.eyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-secondary dark:text-white sm:text-4xl">
              {t('settings.title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-secondary/65 dark:text-white/65">
              {t('settings.description')}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          <section className="rounded-2xl border border-secondary/8 bg-white/86 p-5 shadow-sm backdrop-blur dark:bg-secondary/18 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/8 text-secondary dark:bg-white/10 dark:text-white">
                <Languages className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-secondary dark:text-white">{t('settings.languageTitle')}</h2>
                <p className="mt-1 text-sm leading-6 text-secondary/60 dark:text-white/60">
                  {t('settings.languageDescription')}
                </p>
              </div>
            </div>
            <LocaleSwitcher className="mt-5 sm:mt-0" />
          </section>

          <section className="rounded-2xl border border-secondary/8 bg-white/86 p-5 shadow-sm backdrop-blur dark:bg-secondary/18 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/8 text-secondary dark:bg-white/10 dark:text-white">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="hidden h-4 w-4 dark:block" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-secondary dark:text-white">{t('settings.themeTitle')}</h2>
                <p className="mt-1 text-sm leading-6 text-secondary/60 dark:text-white/60">
                  {t('settings.themeDescription')}
                </p>
              </div>
            </div>
            <ThemeToggle className="mt-5 sm:mt-0" />
          </section>

          <section className="rounded-2xl border border-secondary/8 bg-white/86 p-5 shadow-sm backdrop-blur dark:bg-secondary/18 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/8 text-secondary dark:bg-white/10 dark:text-white">
                {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              </div>
              <div>
                <h2 className="text-base font-semibold text-secondary dark:text-white">{t('settings.sessionTitle')}</h2>
                <p className="mt-1 text-sm leading-6 text-secondary/60 dark:text-white/60">
                  {user ? `${t('settings.sessionDescription')} ${user.email}` : t('settings.guestSessionDescription')}
                </p>
              </div>
            </div>
            {user ? (
              <LogoutButton className="mt-5 w-full justify-center sm:mt-0 sm:w-auto" />
            ) : (
              <div className="mt-5 grid gap-2 sm:mt-0 sm:flex">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full rounded-full px-4 text-sm sm:w-auto">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('navigation.login')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm" className="w-full rounded-full px-4 text-sm sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('navigation.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
