import { NextRequest, NextResponse } from 'next/server';
import { MechanicService } from '../services/mechanics.service';

export const MechanicController = {
  getAll: async () => {
    try {
      const mechanics = await MechanicService.getAll();
      return NextResponse.json(mechanics, { status: 200 });
    } catch (error) {
      console.error('Error fetching mechanics:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  create: async (req: NextRequest | Request) => {
    try {
      await req.json().catch(() => null);
      await MechanicService.create(undefined as never);
      return NextResponse.json({ error: 'Mechanics are managed through user roles' }, { status: 405 });
    } catch (error: unknown) {
      console.error('Error creating mechanic:', error);
      if (error instanceof Error && error.message === 'Mechanics are managed through users with the mechanic role') {
        return NextResponse.json({ error: 'Mechanics are managed through user roles' }, { status: 405 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};
