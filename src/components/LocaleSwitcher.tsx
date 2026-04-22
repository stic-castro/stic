'use client';

import { Languages } from 'lucide-react';
import { Locale, useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';

const localeOptions: Locale[] = ['es', 'en'];

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, changeLocale, t } = useTranslation();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-secondary/12 bg-white/90 p-1 shadow-sm dark:bg-secondary/25",
        className
      )}
      aria-label={t('navigation.localeLabel')}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full text-secondary/60">
        <Languages className="h-4 w-4" />
      </div>
      {localeOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => changeLocale(option)}
          className={cn(
            "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
            option === locale
              ? "bg-primary text-white"
              : "text-secondary/70 hover:bg-secondary/8 hover:text-secondary"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
