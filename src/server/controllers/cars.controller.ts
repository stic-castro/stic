import { NextRequest, NextResponse } from 'next/server';
import { SessionUser } from '../lib/auth';
import { CarService, getVisibleCars } from '../services/cars.service';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export const CarController = {
  getAll: async (currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const cars = await getVisibleCars(currentUser);
      return NextResponse.json(cars, { status: 200 });
    } catch (error) {
      console.error('Error fetching cars:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },

  create: async (req: NextRequest | Request, currentUser?: SessionUser | null) => {
    try {
      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      if (!['user', 'mechanic', 'admin'].includes(currentUser.role)) {
        return NextResponse.json({ error: 'Only users, mechanics, and admins can create cars' }, { status: 403 });
      }

      const body = await req.json().catch(() => null);

      if (!body) {
        return NextResponse.json({ error: 'Invalid or missing request body' }, { status: 400 });
      }

      const { brand, model, year, plate, user_id } = body;

      if (!brand || !model || !year || !plate) {
        return NextResponse.json(
          { error: 'Missing required fields (brand, model, year, plate)' },
          { status: 400 }
        );
      }

      const monitoringUserId = currentUser.role === 'user' ? currentUser.id : user_id;

      if (!monitoringUserId) {
        return NextResponse.json(
          { error: 'Monitoring user is required when a mechanic or admin creates a car' },
          { status: 400 }
        );
      }

      const newCar = await CarService.create({
        user_id: monitoringUserId,
        brand,
        model,
        year,
        plate,
      });
      return NextResponse.json(newCar, { status: 201 });
      
    } catch (error: unknown) {
      console.error('Error creating car:', error);
      const message = getErrorMessage(error);
      if (
        message === 'Missing required fields for car' ||
        message === 'Monitoring user must be an existing regular user'
      ) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};
