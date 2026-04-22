'use client';

import { AuthShell } from '../../features/auth/components/AuthShell';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { useTranslation } from '../../lib/i18n';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <AuthShell
      eyebrow={t('auth.accessEyebrow')}
      title={t('auth.loginShellTitle')}
      description={t('auth.loginShellDescription')}
      footerText={t('auth.noAccount')}
      footerActionLabel={t('auth.signup')}
      footerActionHref="/signup"
    >
      <LoginForm />
    </AuthShell>
  );
}
