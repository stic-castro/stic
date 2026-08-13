'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { formatDateTimeInBolivia } from '../lib/contact';
import { useTranslation } from '../lib/i18n';
import type { Notification } from '../features/jobs/types';

export function NotificationCenter() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyNotificationId, setBusyNotificationId] = React.useState<string | null>(null);

  const unreadCount = notifications.length;

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' }).catch(() => null);
    fetchNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      setBusyNotificationId(notification.id);
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: [notification.id] }),
      }).catch(() => null);

      setNotifications((current) => current.filter((item) => item.id !== notification.id));

      if (notification.job_id) {
        router.push(`/jobs/${notification.job_id}`);
      }
    } finally {
      setBusyNotificationId(null);
    }
  };

  return (
    <div className="rounded-[1.5rem] border border-secondary/8 bg-background px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/50 dark:text-white/45">
            {t('auth.notifications')}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button type="button" onClick={markAllAsRead} className="text-xs font-medium text-primary hover:underline">
            {t('auth.markNotificationsRead')}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-secondary/60 dark:text-white/60">{t('auth.notificationsLoading')}</p>
      ) : notifications.length === 0 ? (
        <p className="mt-3 text-sm text-secondary/60 dark:text-white/60">{t('auth.notificationsEmpty')}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className="w-full rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-left transition hover:border-primary/35 hover:bg-primary/12"
              disabled={busyNotificationId === notification.id}
            >
              <p className="text-sm font-semibold text-secondary dark:text-white">{notification.title}</p>
              <p className="mt-1 text-sm text-secondary/70 dark:text-white/70">{notification.message}</p>
              <p className="mt-2 text-xs text-secondary/45 dark:text-white/45">
                {formatDateTimeInBolivia(notification.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
