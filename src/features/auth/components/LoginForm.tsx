'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useToast } from '../../../components/ToastProvider';
import { useTranslation } from '../../../lib/i18n';

export function LoginForm() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!identifier || !password) {
      showToast(t('auth.requiredFields'), 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('auth.loginError'));
      }

      showToast(t('auth.loginSuccess'), 'success');
      router.push('/jobs');
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('auth.loginError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary dark:text-white">{t('auth.loginIdentifier')}</label>
        <Input
          type="text"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder={t('auth.loginIdentifierPlaceholder')}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary dark:text-white">{t('auth.password')}</label>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <Button type="submit" className="mt-2 w-full rounded-full" isLoading={isSubmitting}>
        {t('auth.submitLogin')}
      </Button>
    </form>
  );
}
