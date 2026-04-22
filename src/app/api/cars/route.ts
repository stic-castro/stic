import { NextRequest } from 'next/server';
import { getCurrentUserFromRequest } from '../../../server/lib/current-user';
import { CarController } from '../../../server/controllers/cars.controller';

export async function GET(request: NextRequest) {
  return CarController.getAll(await getCurrentUserFromRequest(request));
}

export async function POST(request: NextRequest) {
  return CarController.create(request, await getCurrentUserFromRequest(request));
}
