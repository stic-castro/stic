import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '../lib/auth';
import { createNotification, getVisibleNotifications, markNotificationsAsRead } from '../services/notifications.service';

export const NotificationController = {
  getAll: async (currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const notifications = await getVisibleNotifications(currentUser);
      return NextResponse.json(notifications, { status: 200 });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  create: async (req: NextRequest | Request, currentUser?: SessionUser | null) => {
    try {
      if (currentUser?.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can create notifications manually' }, { status: 403 });
      }

      const body = await req.json().catch(() => null);

      if (!body?.user_id || !body?.title || !body?.message) {
        return NextResponse.json({ error: 'Missing required fields (user_id, title, message)' }, { status: 400 });
      }

      const notification = await createNotification(body);
      return NextResponse.json(notification, { status: 201 });
    } catch (error: unknown) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  markAllRead: async (req: NextRequest | Request, currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const body = await req.json().catch(() => null);
      const notificationIds = Array.isArray(body?.notification_ids)
        ? body.notification_ids.filter((value: unknown): value is string => typeof value === 'string')
        : undefined;

      await markNotificationsAsRead(currentUser, notificationIds);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};
