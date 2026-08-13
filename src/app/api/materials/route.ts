import { NextRequest } from 'next/server';
import { MaterialController } from '../../../server/controllers/quotation.controller';

export async function GET() {
  return MaterialController.getAll();
}

export async function POST(request: NextRequest) {
  return MaterialController.create(request);
}
