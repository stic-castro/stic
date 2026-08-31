'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserCircle2 } from 'lucide-react';
import type { SessionUser } from '../server/lib/auth';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Button } from './Button';

type SiteHeaderProps = {
  currentUser: SessionUser | null;
  mobileSidebarOpen: boolean;
  onOpenSidebar?: () => void;
};

export function SiteHeader({
  currentUser,
  mobileSidebarOpen,
  onOpenSidebar,
}: SiteHeaderProps) {
  const { t } = useTranslation();
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  React.useEffect(() => {
    if (!currentUser) {
      setUnreadNotifications(0);
      return;
    }

    async function loadNotifications() {
      try {
        const response = await fetch('/api/notifications');

        if (!response.ok) {
          return;
        }

        const notifications = (await response.json()) as Array<{ id: string }>;
        setUnreadNotifications(notifications.length);
      } catch {
        setUnreadNotifications(0);
      }
    }

    loadNotifications();
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-40 border-b border-secondary/8 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/82">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="group relative h-11 w-11 shrink-0 rounded-full border-secondary/16 bg-background/90 p-0 shadow-sm lg:hidden"
            onClick={onOpenSidebar}
            aria-label={mobileSidebarOpen ? t('navigation.closeSidebar') : t('navigation.openSidebar')}
            aria-pressed={mobileSidebarOpen}
          >
            <span className="relative h-5 w-5">
              <span
                className={cn(
                  'absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-[7px] rounded-full bg-current transition-all duration-300',
                  mobileSidebarOpen ? 'translate-y-0 rotate-45' : ''
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-all duration-300',
                  mobileSidebarOpen ? 'scale-x-0 opacity-0' : ''
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1/2 block h-0.5 w-5 translate-y-[6px] rounded-full bg-current transition-all duration-300',
                  mobileSidebarOpen ? 'translate-y-0 -rotate-45' : ''
                )}
              />
            </span>
          </Button>

          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-full bg-transparent text-secondary transition-opacity hover:opacity-80"
          >
            <div className="relative h-9 w-[7.5rem] overflow-hidden rounded-sm sm:h-10 sm:w-[9rem] lg:h-12 lg:w-[11rem] xl:h-[3.25rem] xl:w-[12.5rem]">
              <Image
                src="/black-logo.png"
                alt={t('brand.name')}
                fill
                className="object-contain object-left dark:hidden"
                priority
              />
              <Image
                src="/white-logo.png"
                alt={t('brand.name')}
                fill
                className="hidden object-contain object-left dark:block"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="relative h-9 max-w-[11rem] rounded-full px-3 text-sm sm:max-w-none sm:px-4">
                <UserCircle2 className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{currentUser.name}</span>
                {unreadNotifications > 0 ? (
                  <span className="ml-2 inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-white">
                    {unreadNotifications}
                  </span>
                ) : null}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="sm" className="h-9 rounded-full px-4 text-sm">
                  {t('navigation.login')}
                </Button>
              </Link>
              <Link href="/signup" className="hidden md:block">
                <Button variant="outline" size="sm" className="h-9 rounded-full px-4 text-sm">
                  {t('navigation.signup')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
