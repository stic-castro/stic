import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '../lib/auth';
import { TimeEntryService } from '../services/time_entries.service';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error';

  if (message === 'Authentication required') {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (
    message === 'Only staff can view time tracking' ||
    message === 'You can only view your own time report' ||
    message === 'You are not allowed to check this user in' ||
    message === 'You are not allowed to check this user out'
  ) {
    return NextResponse.json({ error: message }, { status: 403 });
  }

  if (message === 'User not found') {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  if (
    message === 'User already has an open time entry' ||
    message === 'User does not have an open time entry'
  ) {
    return NextResponse.json({ error: message }, { status: 409 });
  }

  console.error('Time tracking error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

async function readUserId(request: NextRequest | Request) {
  const body = await request.json().catch(() => null);
  return typeof body?.userId === 'string' ? body.userId : null;
}

export const TimeEntryController = {
  getAll: async (request: NextRequest, currentUser?: SessionUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const entries = await TimeEntryService.getEntries(currentUser, {
        userId: searchParams.get('userId'),
        from: searchParams.get('from'),
        to: searchParams.get('to'),
      });

      return NextResponse.json(entries, { status: 200 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  checkIn: async (request: NextRequest, currentUser?: SessionUser | null) => {
    try {
      const userId = await readUserId(request);

      if (!userId) {
        return NextResponse.json({ error: 'Missing required field (userId)' }, { status: 400 });
      }

      const entry = await TimeEntryService.checkIn(currentUser, userId);
      return NextResponse.json(entry, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  },

  checkOut: async (request: NextRequest, currentUser?: SessionUser | null) => {
    try {
      const userId = await readUserId(request);

      if (!userId) {
        return NextResponse.json({ error: 'Missing required field (userId)' }, { status: 400 });
      }

      const entry = await TimeEntryService.checkOut(currentUser, userId);
      return NextResponse.json(entry, { status: 200 });
    } catch (error) {
      return errorResponse(error);
    }
  },
};
