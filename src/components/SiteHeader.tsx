'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, UserCircle2, X } from 'lucide-react';
import type { SessionUser } from '../server/lib/auth';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { LocaleSwitcher } from './LocaleSwitcher';
import { LogoutButton } from './LogoutButton';
import { siteNavigation } from './site-navigation';
import { ThemeToggle } from './ThemeToggle';

type SiteHeaderProps = {
  currentUser: SessionUser | null;
};

export function SiteHeader({ currentUser }: SiteHeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDesktopNavOpen, setIsDesktopNavOpen] = React.useState(false);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  const desktopNavRef = React.useRef<HTMLDivElement | null>(null);

  const groupedNavigation = React.useMemo(() => {
    const items = [...siteNavigation];

    if (currentUser?.role === 'admin') {
      items.push({
        href: '/admin/users',
        labelKey: 'navigation.adminUsers',
        descriptionKey: 'navigation.adminUsersDescription',
      });
    }

    return items;
  }, [currentUser?.role]);

  React.useEffect(() => {
    setIsOpen(false);
    setIsDesktopNavOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (desktopNavRef.current && !desktopNavRef.current.contains(event.target as Node)) {
        setIsDesktopNavOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

        const notifications = (await response.json()) as Array<{ is_read: boolean }>;
        setUnreadNotifications(notifications.filter((notification) => !notification.is_read).length);
      } catch {
        setUnreadNotifications(0);
      }
    }

    loadNotifications();
  }, [currentUser, pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-secondary/8 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/82">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full bg-transparent text-secondary transition-opacity hover:opacity-80"
        >
          <div className="relative h-9 w-[7.5rem] overflow-hidden rounded-sm sm:h-10 sm:w-[9rem] lg:h-12 lg:w-[11rem] xl:h-[3.25rem] xl:w-[12.5rem]">
            {/* Light mode logo */}
            <Image
              src="/black-logo.png"
              alt={t('brand.name')}
              fill
              className="object-contain object-left dark:hidden"
              priority
            />
            {/* Dark mode logo */}
            <Image
              src="/white-logo.png"
              alt={t('brand.name')}
              fill
              className="hidden object-contain object-left dark:block"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block" ref={desktopNavRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-full px-4 text-sm"
              aria-expanded={isDesktopNavOpen}
              onClick={() => setIsDesktopNavOpen((open) => !open)}
            >
              {t('navigation.explore')}
              <ChevronDown
                className={cn('ml-2 h-4 w-4 transition-transform', isDesktopNavOpen ? 'rotate-180' : '')}
              />
            </Button>

            {isDesktopNavOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[20rem] overflow-hidden rounded-[1.6rem] border border-secondary/10 bg-background/98 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.14)] backdrop-blur">
                <div className="grid gap-1">
                  {groupedNavigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/jobs' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'rounded-[1.2rem] px-4 py-3 transition',
                          isActive
                            ? 'bg-secondary text-white'
                            : 'text-secondary hover:bg-secondary/6 dark:text-white'
                        )}
                      >
                        <span className="block text-sm font-semibold">{t(item.labelKey)}</span>
                        <span
                          className={cn(
                            'mt-1 block text-xs',
                            isActive ? 'text-white/70' : 'text-secondary/62 dark:text-white/62'
                          )}
                        >
                          {t(item.descriptionKey)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <LocaleSwitcher className="hidden xl:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />

          {currentUser ? (
            <>
              <Link href="/profile" className="hidden md:block">
                <Button variant="ghost" size="sm" className="relative h-9 rounded-full px-4 text-sm">
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  {currentUser.name}
                  {unreadNotifications > 0 ? (
                    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-white">
                      {unreadNotifications}
                    </span>
                  ) : null}
                </Button>
              </Link>
              <LogoutButton className="hidden md:inline-flex" />
            </>
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

          <Link href="/jobs/new" className="hidden md:block">
            <Button size="sm" className="h-9 rounded-full px-4 text-sm">
              {t('navigation.openApp')}
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-secondary/10 bg-background md:hidden">
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6"
            aria-label="Mobile navigation"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <LocaleSwitcher className="self-start" />
              <ThemeToggle />
            </div>
            {groupedNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/jobs' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-2xl border px-4 py-3 transition',
                    isActive
                      ? 'border-primary/30 bg-primary/10 text-secondary'
                      : 'border-secondary/10 bg-white text-secondary/80 hover:border-primary/20 hover:bg-primary/5 dark:bg-secondary/20'
                  )}
                >
                  <span className="block text-sm font-semibold">{t(item.labelKey)}</span>
                  <span className="mt-1 block text-xs text-secondary/65">{t(item.descriptionKey)}</span>
                </Link>
              );
            })}
            {currentUser ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/profile"
                  className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 text-sm font-semibold text-secondary transition hover:border-primary/20 hover:bg-primary/5 dark:bg-secondary/20 dark:text-white"
                >
                  {t('navigation.profile')}
                  {unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}
                </Link>
                <LogoutButton className="h-auto w-full rounded-2xl py-3 sm:col-span-2" />
              </div>
            ) : (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/login"
                  className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 text-sm font-semibold text-secondary transition hover:border-primary/20 hover:bg-primary/5 dark:bg-secondary/20 dark:text-white"
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl border border-primary/20 bg-primary text-center px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  {t('navigation.signup')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
