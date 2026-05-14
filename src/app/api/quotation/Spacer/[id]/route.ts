import { NextRequest } from 'next/server';
import { QuotationController } from '../../../../../server/controllers/quotation.controller';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  return QuotationController.get('spacer_quotations', id);
}

export async function PUT(request: NextRequest) {
  return QuotationController.calculateSpacer(request);
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const { id } = await context.params;
  return QuotationController.delete('spacer_quotations', id);
}
