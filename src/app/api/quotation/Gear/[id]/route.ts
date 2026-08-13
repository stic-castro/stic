import { NextRequest } from 'next/server';
import { QuotationController } from '../../../../../server/controllers/quotation.controller';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  return QuotationController.get('gear_quotations', id);
}

export async function PUT(request: NextRequest) {
  return QuotationController.calculateGear(request);
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  return QuotationController.delete('gear_quotations', id);
}
