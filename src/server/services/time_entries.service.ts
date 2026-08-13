import { SessionUser } from '../lib/auth';
import { timeEntryRepository } from '../repositories/time_entries.repository';
import { userRepository } from '../repositories/users.repository';
import { TimeEntryWithRelations, User } from '../types';

export type TimeTrackingDashboard = {
  users: User[];
  entries: TimeEntryWithRelations[];
};

type TimeEntryQuery = {
  userId?: string | null;
  from?: string | null;
  to?: string | null;
};

function ensureAuthenticated(currentUser?: SessionUser | null): SessionUser {
  if (!currentUser) {
    throw new Error('Authentication required');
  }

  return currentUser;
}

function canManageTarget(actor: SessionUser, target: User) {
  if (target.role !== 'mechanic' && target.role !== 'trainee') {
    return false;
  }

  if (actor.role === 'admin') {
    return true;
  }

  return actor.role === 'mechanic' && target.role === 'trainee';
}

function canViewTarget(actor: SessionUser, targetUserId: string) {
  return actor.role === 'admin' || actor.id === targetUserId;
}

function millisecondsForEntry(entry: TimeEntryWithRelations, now = Date.now()) {
  const start = new Date(entry.checked_in_at).getTime();
  const end = entry.checked_out_at ? new Date(entry.checked_out_at).getTime() : now;
  return Math.max(0, end - start);
}

export function getEntryDurationHours(entry: TimeEntryWithRelations, now = Date.now()) {
  return millisecondsForEntry(entry, now) / (1000 * 60 * 60);
}

export const TimeEntryService = {
  getDashboard: async (currentUser?: SessionUser | null): Promise<TimeTrackingDashboard> => {
    const actor = ensureAuthenticated(currentUser);

    if (actor.role === 'user') {
      throw new Error('Only staff can view time tracking');
    }

    const allTrackingUsers = await userRepository.findTimeTrackingUsers();
    const users = actor.role === 'admin'
      ? allTrackingUsers
      : allTrackingUsers.filter((user) =>
          actor.role === 'mechanic' ? user.id === actor.id || user.role === 'trainee' : user.id === actor.id
        );

    const entries = actor.role === 'admin'
      ? await timeEntryRepository.find()
      : actor.role === 'mechanic'
        ? [
          ...(await timeEntryRepository.find({ userId: actor.id })),
          ...(await timeEntryRepository.findOpenByUserIds(
            users.filter((user) => user.role === 'trainee').map((user) => user.id)
          )),
        ]
        : await timeEntryRepository.find({ userId: actor.id });

    return { users, entries };
  },

  getEntries: async (
    currentUser: SessionUser | null | undefined,
    query: TimeEntryQuery = {}
  ): Promise<TimeEntryWithRelations[]> => {
    const actor = ensureAuthenticated(currentUser);

    if (actor.role === 'user') {
      throw new Error('Only staff can view time tracking');
    }

    const requestedUserId = query.userId || actor.id;

    if (!canViewTarget(actor, requestedUserId)) {
      throw new Error('You can only view your own time report');
    }

    return timeEntryRepository.find({
      userId: requestedUserId,
      from: query.from ?? undefined,
      to: query.to ?? undefined,
    });
  },

  checkIn: async (
    currentUser: SessionUser | null | undefined,
    userId: string
  ): Promise<TimeEntryWithRelations> => {
    const actor = ensureAuthenticated(currentUser);
    const target = await userRepository.findById(userId);

    if (!target) {
      throw new Error('User not found');
    }

    if (!canManageTarget(actor, target)) {
      throw new Error('You are not allowed to check this user in');
    }

    const openEntry = await timeEntryRepository.findOpenByUserId(userId);

    if (openEntry) {
      throw new Error('User already has an open time entry');
    }

    return timeEntryRepository.createCheckIn(userId, actor.id);
  },

  checkOut: async (
    currentUser: SessionUser | null | undefined,
    userId: string
  ): Promise<TimeEntryWithRelations> => {
    const actor = ensureAuthenticated(currentUser);
    const target = await userRepository.findById(userId);

    if (!target) {
      throw new Error('User not found');
    }

    if (!canManageTarget(actor, target)) {
      throw new Error('You are not allowed to check this user out');
    }

    const openEntry = await timeEntryRepository.findOpenByUserId(userId);

    if (!openEntry) {
      throw new Error('User does not have an open time entry');
    }

    return timeEntryRepository.checkOut(openEntry.id, actor.id);
  },

  getTotalHours: (entries: TimeEntryWithRelations[], now = Date.now()) =>
    entries.reduce((total, entry) => total + getEntryDurationHours(entry, now), 0),
};
