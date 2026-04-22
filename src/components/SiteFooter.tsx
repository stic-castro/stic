'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '../lib/i18n';
import { siteNavigation } from './site-navigation';

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-secondary/8 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="max-w-xl">
          <div className="relative h-16 w-[14rem] overflow-hidden rounded-sm">
            {/* Light mode logo */}
            <Image
              src="/black-logo.png"
              alt={t('brand.name')}
              fill
              className="object-contain object-left dark:hidden"
            />
            {/* Dark mode logo */}
            <Image
              src="/white-logo.png"
              alt={t('brand.name')}
              fill
              className="hidden object-contain object-left dark:block"
            />
          </div>
          <p className="mt-5 text-xl font-semibold tracking-tight text-secondary dark:text-white">
            {t('footer.title')}
          </p>
          <p className="mt-3 text-sm leading-7 text-secondary/68 dark:text-white/68">
            {t('footer.description')}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-secondary dark:text-white">
              {t('footer.navigationTitle')}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {siteNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-1 text-sm text-secondary/68 transition hover:text-primary dark:text-white/68 dark:hover:text-white"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-secondary dark:text-white">
              {t('footer.visionTitle')}
            </p>
            <p className="mt-4 text-sm leading-7 text-secondary/68 dark:text-white/68">
              {t('footer.visionDescription')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
