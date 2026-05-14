'use client';

import * as React from 'react';
import { Box } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';
import { cn } from '../../../lib/utils';

type ThreeSceneFrameProps = {
  children: React.ReactNode;
  isReady: boolean;
  className?: string;
};

export function ThreeSceneFrame({ children, isReady, className }: ThreeSceneFrameProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'relative min-h-[22rem] overflow-hidden rounded-lg border border-secondary/10 bg-secondary/[0.035] dark:border-white/10 dark:bg-white/[0.035]',
        className
      )}
    >
      {isReady ? (
        children
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center text-secondary/55 dark:text-white/55">
          <Box className="h-10 w-10 text-primary" />
          <p className="max-w-sm text-sm leading-6">{t('quotation.viewerEmpty')}</p>
        </div>
      )}
    </div>
  );
}
