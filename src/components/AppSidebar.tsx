'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, PanelsTopLeft, X } from 'lucide-react';
import type { SessionUser } from '../server/lib/auth';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { getSiteNavigation } from './site-navigation';

type AppSidebarProps = {
  currentUser: SessionUser | null;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

function normalizeHref(href: string) {
  return href.split('#')[0] || '/';
}

function matchesPath(pathname: string, href: string) {
  const basePath = normalizeHref(href);

  if (basePath === '/') {
    return pathname === '/';
  }

  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function AppSidebar({ currentUser, mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const categories = React.useMemo(() => getSiteNavigation(currentUser?.role), [currentUser?.role]);

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      categories.map((category) => [
        category.labelKey,
        category.items.some((item) => item.href && matchesPath(pathname, item.href)),
      ])
    )
  );

  React.useEffect(() => {
    setOpenGroups((current) =>
      Object.fromEntries(
        categories.map((category) => [
          category.labelKey,
          current[category.labelKey] ??
            category.items.some((item) => item.href && matchesPath(pathname, item.href)),
        ])
      )
    );
  }, [categories, pathname]);

  const navContent = (
    <div className="flex h-full flex-col border-r border-secondary/10 bg-background/95 px-3 py-4 backdrop-blur">
      <div className="flex items-start justify-between gap-3 border-b border-secondary/10 px-3 pb-5">
        <div>
          <Link href="/" onClick={onMobileClose} className="block">
            <div className="relative h-11 w-[8.5rem] overflow-hidden rounded-sm">
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
          <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-primary">{t('brand.name')}</p>
          <p className="mt-2 text-sm text-secondary/62 dark:text-white/62">{t('navigation.sidebarLabel')}</p>
        </div>

        <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={onMobileClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {categories.map((category) => {
          const isOpen = openGroups[category.labelKey] ?? false;

          return (
            <div key={category.labelKey} className="py-2">
              <button
                type="button"
                onClick={() =>
                  setOpenGroups((current) => ({
                    ...current,
                    [category.labelKey]: !isOpen,
                  }))
                }
                className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-secondary/6 dark:hover:bg-white/6"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary dark:text-white">
                    {t(category.labelKey)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-secondary/52 dark:text-white/52">
                    {t(category.descriptionKey)}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-secondary/45 transition-transform dark:text-white/45',
                    isOpen ? 'rotate-180' : ''
                  )}
                />
              </button>

              {isOpen ? (
                <div className="mt-2 space-y-1 pl-2">
                  {category.items.map((item) => {
                    const isActive = item.href ? matchesPath(pathname, item.href) : false;

                    return (
                      <Link
                        key={item.href ?? item.labelKey}
                        href={item.href ?? '/'}
                        onClick={onMobileClose}
                        className="group block rounded-2xl px-3 py-3 transition hover:bg-secondary/6 dark:hover:bg-white/6"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p
                              className={cn(
                                'text-sm font-medium transition',
                                isActive
                                  ? 'text-primary'
                                  : 'text-secondary/78 group-hover:text-secondary dark:text-white/72 dark:group-hover:text-white'
                              )}
                            >
                              {t(item.labelKey)}
                            </p>
                            <p
                              className={cn(
                                'mt-1 text-xs leading-5 transition',
                                isActive
                                  ? 'text-primary/72'
                                  : 'text-secondary/48 group-hover:text-secondary/70 dark:text-white/42 dark:group-hover:text-white/68'
                              )}
                            >
                              {t(item.descriptionKey)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'text-sm transition',
                              isActive
                                ? 'text-primary'
                                : 'text-secondary/22 group-hover:text-secondary/46 dark:text-white/24 dark:group-hover:text-white/44'
                            )}
                            aria-hidden="true"
                          >
                            {'->'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      {currentUser ? (
        <div className="mt-6 border-t border-secondary/10 px-3 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/8 text-secondary dark:bg-white/10 dark:text-white">
              <PanelsTopLeft className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-secondary dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-secondary/52 dark:text-white/52">{t(`auth.${currentUser.role}Role`)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <aside className="hidden w-[18.5rem] shrink-0 lg:block">
        <div className="sticky top-[4.8rem] h-[calc(100svh-4.8rem)]">{navContent}</div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-secondary/28 backdrop-blur-[2px]"
            onClick={onMobileClose}
            aria-label="Close navigation"
          />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,22rem)] bg-background/96 p-3 backdrop-blur">
            {navContent}
          </div>
        </div>
      ) : null}
    </>
  );
}
