import { NextRequest } from 'next/server';
import { MaterialController } from '../../../../server/controllers/quotation.controller';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  return MaterialController.getById(id);
}

export async function PUT(request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  return MaterialController.update(request, id);
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  return MaterialController.delete(id);
}
