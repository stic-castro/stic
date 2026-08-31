'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useToast } from '../../../components/ToastProvider';
import { useTranslation } from '../../../lib/i18n';

export function SignupForm() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      showToast(t('auth.requiredFields'), 'error');
      return;
    }

    if (form.password.length < 8) {
      showToast(t('auth.passwordMin'), 'error');
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast(t('auth.passwordMismatch'), 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('auth.signupError'));
      }

      showToast(t('auth.signupSuccess'), 'success');
      router.push(data.requiresEmailConfirmation ? '/login' : '/jobs');
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('auth.signupError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary dark:text-white">{t('auth.name')}</label>
        <Input
          type="text"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary dark:text-white">{t('auth.email')}</label>
        <Input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary dark:text-white">{t('auth.phone')}</label>
        <Input
          type="tel"
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary dark:text-white">{t('auth.password')}</label>
        <Input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-secondary dark:text-white">{t('auth.confirmPassword')}</label>
        <Input
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
          disabled={isSubmitting}
          required
        />
      </div>

      <Button type="submit" className="mt-2 w-full rounded-full" isLoading={isSubmitting}>
        {t('auth.submitSignup')}
      </Button>
    </form>
  );
}
