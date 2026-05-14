'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, CarFront, ChevronDown, Cog, GraduationCap, PanelLeftClose, PanelsTopLeft, Wrench, X } from 'lucide-react';
import type { SessionUser } from '../server/lib/auth';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { getSiteNavigation } from './site-navigation';

type AppSidebarProps = {
  currentUser: SessionUser | null;
  desktopCollapsed: boolean;
  mobileOpen: boolean;
  onDesktopToggle: () => void;
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

function getItemIcon(labelKey: string, href?: string) {
  if (href?.startsWith('/cars')) {
    return CarFront;
  }

  if (href?.startsWith('/jobs')) {
    return Wrench;
  }

  if (href?.startsWith('/separadores') || href?.startsWith('/poleas') || href?.startsWith('/engranajes')) {
    return Cog;
  }

  if (labelKey.includes('training') || labelKey.includes('apprentice') || labelKey.includes('mentorship')) {
    return GraduationCap;
  }

  return BriefcaseBusiness;
}

export function AppSidebar({
  currentUser,
  desktopCollapsed,
  mobileOpen,
  onDesktopToggle,
  onMobileClose,
}: AppSidebarProps) {
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
      <div className="flex items-center justify-between gap-3 border-b border-secondary/10 px-3 pb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden rounded-full px-4 lg:inline-flex"
          onClick={onDesktopToggle}
        >
          <PanelLeftClose className={cn('mr-2 h-4 w-4 transition-transform', desktopCollapsed ? 'rotate-180' : '')} />
          {desktopCollapsed ? t('navigation.openSidebar') : t('navigation.closeSidebar')}
        </Button>

        <Button type="button" variant="ghost" size="sm" className="rounded-full px-4 lg:hidden" onClick={onMobileClose}>
          {t('navigation.closeSidebar')}
        </Button>

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
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary dark:text-white">
                  {t(category.labelKey)}
                </p>
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
                          <div className="flex min-w-0 items-center gap-3">
                            {React.createElement(getItemIcon(item.labelKey, item.href), {
                              className: cn(
                                'h-4 w-4 shrink-0 transition',
                                isActive
                                  ? 'text-primary'
                                  : 'text-secondary/44 group-hover:text-secondary/72 dark:text-white/40 dark:group-hover:text-white/70'
                              ),
                            })}
                            <p
                              className={cn(
                                'truncate text-sm font-medium transition',
                                isActive
                                  ? 'text-primary'
                                  : 'text-secondary/78 group-hover:text-secondary dark:text-white/72 dark:group-hover:text-white'
                              )}
                            >
                              {t(item.labelKey)}
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
      <aside
        className={cn(
          'hidden shrink-0 transition-[width] duration-300 lg:block',
          desktopCollapsed ? 'w-[4.75rem]' : 'w-[18.5rem]'
        )}
      >
        <div className="sticky top-[4.8rem] h-[calc(100svh-4.8rem)]">
          {desktopCollapsed ? (
            <div className="flex h-full flex-col items-center border-r border-secondary/10 bg-background/95 px-3 py-4 backdrop-blur">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={onDesktopToggle}
                aria-label={t('navigation.openSidebar')}
                title={t('navigation.openSidebar')}
              >
                <PanelLeftClose className="h-5 w-5 rotate-180" />
              </Button>
            </div>
          ) : (
            navContent
          )}
        </div>
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-secondary/28 backdrop-blur-[2px] transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={onMobileClose}
            aria-label={t('navigation.closeSidebar')}
          />
        </div>
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-[min(88vw,22rem)] bg-background/96 p-3 backdrop-blur transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
            {navContent}
        </div>
      </div>
    </>
  );
}
