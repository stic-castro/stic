'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';

type ThemeMode = 'light' | 'dark';

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem('app_theme', theme);
}

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [theme, setTheme] = React.useState<ThemeMode>('light');

  React.useEffect(() => {
    const stored = window.localStorage.getItem('app_theme');
    const nextTheme: ThemeMode =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('navigation.themeLabel')}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-secondary/12 bg-white/88 px-3 py-2 text-sm text-secondary shadow-sm transition hover:border-primary/25 hover:bg-white dark:bg-secondary/25 dark:text-white",
        className
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white dark:bg-white dark:text-secondary">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
      <span className="hidden font-medium sm:inline">
        {isDark ? t('navigation.darkMode') : t('navigation.lightMode')}
      </span>
    </button>
  );
}
