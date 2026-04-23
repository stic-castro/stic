'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageSquareShare } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getSiteNavigation } from './site-navigation';

export function SiteFooter() {
  const { t } = useTranslation();
  const categories = getSiteNavigation();

  return (
    <footer id="contact" className="border-t border-secondary/8 bg-background">
      <div className="grid gap-10 px-5 py-12 sm:px-8 xl:grid-cols-[1.05fr_0.95fr_0.7fr] xl:px-10">
        <div className="max-w-xl">
          <div className="relative h-16 w-[14rem] overflow-hidden rounded-sm">
            <Image
              src="/black-logo.png"
              alt={t('brand.name')}
              fill
              className="object-contain object-left dark:hidden"
            />
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
            <p className="text-sm font-semibold text-secondary dark:text-white">{t('footer.navigationTitle')}</p>
            <div className="mt-4 space-y-5">
              {categories.map((category) => (
                <div key={category.labelKey}>
                  <p className="text-sm font-semibold text-secondary/80 dark:text-white/80">{t(category.labelKey)}</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {category.items.map((item) =>
                      item.href ? (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="py-1 text-sm text-secondary/68 transition hover:text-primary dark:text-white/68 dark:hover:text-white"
                        >
                          {t(item.labelKey)}
                        </Link>
                      ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-secondary dark:text-white">{t('footer.visionTitle')}</p>
            <p className="mt-4 text-sm leading-7 text-secondary/68 dark:text-white/68">
              {t('footer.visionDescription')}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-secondary dark:text-white">{t('footer.contactTitle')}</p>
          <div className="mt-4 space-y-3 text-sm text-secondary/68 dark:text-white/68">
            <p>{t('footer.contactDescription')}</p>
            <a href="https://wa.me/59162642431" className="flex items-center gap-2 transition hover:text-primary">
              <MessageSquareShare className="h-4 w-4 text-primary" />
              WhatsApp: 62642431
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100085433059639"
              target="_blank"
              rel="noreferrer"
              className="inline-flex transition hover:text-primary"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
