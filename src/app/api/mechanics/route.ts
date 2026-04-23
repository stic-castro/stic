import { MechanicController } from '../../../server/controllers/mechanics.controller';

export async function GET() {
  return MechanicController.getAll();
}

export async function POST(request: Request) {
  return MechanicController.create(request);
}
