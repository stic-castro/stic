import { NextRequest } from 'next/server';
import { MechanicController } from '../../../server/controllers/mechanics.controller';

export async function GET(_request: NextRequest) {
  return MechanicController.getAll();
}

export async function POST(request: NextRequest) {
  return MechanicController.create(request);
}
