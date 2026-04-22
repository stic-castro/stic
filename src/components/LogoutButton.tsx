'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Button } from './Button';

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast(t('auth.logoutSuccess'), 'success');
      router.push('/');
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
      isLoading={isSubmitting}
      className={cn('h-10 rounded-full px-4 text-sm', className)}
    >
      {t('navigation.logout')}
    </Button>
  );
}
