'use client';

import { AuthShell } from '../../features/auth/components/AuthShell';
import { SignupForm } from '../../features/auth/components/SignupForm';
import { useTranslation } from '../../lib/i18n';

export default function SignupPage() {
  const { t } = useTranslation();

  return (
    <AuthShell
      eyebrow={t('auth.accountEyebrow')}
      title={t('auth.signupShellTitle')}
      description={t('auth.signupShellDescription')}
      footerText={t('auth.hasAccount')}
      footerActionLabel={t('auth.login')}
      footerActionHref="/login"
    >
      <SignupForm />
    </AuthShell>
  );
}
