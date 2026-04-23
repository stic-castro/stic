'use client';

import * as React from 'react';
import type { User } from '../../../server/types';
import type { SessionUser } from '../../../server/lib/auth';
import { Button } from '../../../components/Button';
import { Select } from '../../../components/Select';
import { useToast } from '../../../components/ToastProvider';
import { useTranslation } from '../../../lib/i18n';

const roleOptions: User['role'][] = ['user', 'mechanic', 'trainee', 'admin'];

type AdminUsersPanelProps = {
  currentUser: SessionUser;
  initialUsers: User[];
};

export function AdminUsersPanel({ currentUser, initialUsers }: AdminUsersPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [users, setUsers] = React.useState(initialUsers);
  const [draftRoles, setDraftRoles] = React.useState<Record<string, User['role']>>(
    () => Object.fromEntries(initialUsers.map((user) => [user.id, user.role])) as Record<string, User['role']>
  );
  const [savingUserId, setSavingUserId] = React.useState<string | null>(null);

  const handleRoleSave = async (userId: string) => {
    try {
      setSavingUserId(userId);

      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: draftRoles[userId] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('admin.updateError'));
      }

      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, role: data.role } : user))
      );
      setDraftRoles((current) => ({ ...current, [userId]: data.role }));
      showToast(t('admin.updateSuccess'), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('admin.updateError'), 'error');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-secondary/8 bg-secondary px-6 py-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t('admin.eyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t('admin.title')}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base">
            {t('admin.description')}
          </p>
        </section>

        <section className="grid gap-4">
          {users.length === 0 ? (
            <div className="rounded-[2rem] border border-secondary/8 bg-white/86 px-6 py-8 text-secondary/72 shadow-sm dark:bg-secondary/18 dark:text-white/72">
              {t('admin.empty')}
            </div>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUser.id;
              const selectedRole = draftRoles[user.id] ?? user.role;

              return (
                <article
                  key={user.id}
                  className="grid gap-4 rounded-[2rem] border border-secondary/8 bg-white/86 p-5 shadow-sm backdrop-blur dark:bg-secondary/18 lg:grid-cols-[1.3fr_1fr_auto]"
                >
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/45 dark:text-white/45">
                        {t('admin.nameLabel')}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-secondary dark:text-white">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/45 dark:text-white/45">
                        {t('admin.emailLabel')}
                      </p>
                      <p className="mt-1 text-sm text-secondary/72 dark:text-white/72">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/45 dark:text-white/45">
                      {t('admin.roleLabel')}
                    </p>
                    <Select
                      value={selectedRole}
                      onChange={(event) =>
                        setDraftRoles((current) => ({
                          ...current,
                          [user.id]: event.target.value as User['role'],
                        }))
                      }
                      disabled={isSelf || savingUserId === user.id}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {t(`auth.${role}Role`)}
                        </option>
                      ))}
                    </Select>
                    {isSelf ? (
                      <p className="text-xs text-secondary/65 dark:text-white/65">{t('admin.selfRoleLocked')}</p>
                    ) : null}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      className="w-full rounded-full lg:w-auto"
                      isLoading={savingUserId === user.id}
                      disabled={isSelf || selectedRole === user.role}
                      onClick={() => handleRoleSave(user.id)}
                    >
                      {savingUserId === user.id ? t('admin.saving') : t('admin.save')}
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
