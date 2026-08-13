'use client';

import * as React from 'react';
import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enAdmin from '../locales/en/admin.json';
import enCars from '../locales/en/cars.json';
import enJobs from '../locales/en/jobs.json';
import enLanding from '../locales/en/landing.json';
import enQuotation from '../locales/en/quotation.json';
import esCommon from '../locales/es/common.json';
import esAuth from '../locales/es/auth.json';
import esAdmin from '../locales/es/admin.json';
import esCars from '../locales/es/cars.json';
import esJobs from '../locales/es/jobs.json';
import esLanding from '../locales/es/landing.json';
import esQuotation from '../locales/es/quotation.json';

const dictionaries = {
  en: {
    ...enCommon,
    ...enAuth,
    ...enAdmin,
    ...enCars,
    ...enJobs,
    ...enLanding,
    ...enQuotation,
  },
  es: {
    ...esCommon,
    ...esAuth,
    ...esAdmin,
    ...esCars,
    ...esJobs,
    ...esLanding,
    ...esQuotation,
  },
};

export type Locale = keyof typeof dictionaries;
const defaultLocale: Locale = 'es';

type I18nContextValue = {
  locale: Locale;
  changeLocale: (newLocale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

function getNestedValue(source: unknown, path: string[]): string | null {
  let current: unknown = source;

  for (const segment of path) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : null;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>(defaultLocale);

  React.useEffect(() => {
    const savedLocale = window.localStorage.getItem('app_locale');

    if (savedLocale === 'en' || savedLocale === 'es') {
      setLocale(savedLocale);
    }
  }, []);

  const changeLocale = React.useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app_locale', newLocale);
    }
  }, []);

  const t = React.useCallback(
    (key: string) => {
      const path = key.split('.');
      return (
        getNestedValue(dictionaries[locale], path) ??
        getNestedValue(dictionaries.en, path) ??
        key
      );
    },
    [locale]
  );

  const value = React.useMemo(
    () => ({
      locale,
      changeLocale,
      t,
    }),
    [changeLocale, locale, t]
  );

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation() {
  const context = React.useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }

  return context;
}
