import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '../lib/auth';
import { UserService } from '../services/users.service';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export const UserController = {
  getAll: async (request: NextRequest | Request, currentUser?: SessionUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const scope = searchParams.get('scope');

      if (scope === 'monitoring') {
        const users = await UserService.getMonitoringUsers(currentUser);
        return NextResponse.json(users, { status: 200 });
      }

      if (currentUser?.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can view users' }, { status: 403 });
      }

      const users = await UserService.getAll();
      return NextResponse.json(users, { status: 200 });
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof Error && error.message === 'Only admins and mechanics can view monitoring users') {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  create: async (req: NextRequest | Request, currentUser?: SessionUser | null) => {
    try {
      const body = await req.json().catch(() => null);

      if (!body) {
        return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
      }

      const { name, email, phone, role, password } = body;

      if (!name || !email || !phone || !password) {
        return NextResponse.json(
          { error: 'Missing required fields (name, email, phone, password)' },
          { status: 400 }
        );
      }

      const newUser = await UserService.create({ name, email, phone, role, password }, { requestedBy: currentUser });
      return NextResponse.json(newUser, { status: 201 });
      
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      const message = getErrorMessage(error);
      if (
        message === 'Name cannot be empty' ||
        message === 'Email cannot be empty' ||
        message === 'Phone cannot be empty' ||
        message === 'Role must be one of: user, admin, mechanic, trainee' ||
        message === 'Only admins can assign admin, mechanic, or trainee roles' ||
        message === 'Password must be at least 8 characters long'
      ) {
         return NextResponse.json({ error: message }, { status: message?.includes('Only admins') ? 403 : 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  updateRole: async (req: NextRequest | Request, userId: string, currentUser?: SessionUser | null) => {
    try {
      const body = await req.json().catch(() => null);

      if (!body || !body.role) {
        return NextResponse.json({ error: 'Missing required field (role)' }, { status: 400 });
      }

      const updatedUser = await UserService.updateRole(userId, body.role, { requestedBy: currentUser });
      return NextResponse.json(updatedUser, { status: 200 });
    } catch (error: unknown) {
      console.error('Error updating user role:', error);
      const message = getErrorMessage(error);
      if (
        message === 'Role must be one of: user, admin, mechanic, trainee' ||
        message === 'User id is required' ||
        message === 'User not found'
      ) {
        return NextResponse.json({ error: message }, { status: message === 'User not found' ? 404 : 400 });
      }

      if (
        message === 'Only admins can update roles' ||
        message === 'Admins cannot change their own role from this page'
      ) {
        return NextResponse.json({ error: message }, { status: 403 });
      }

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};
