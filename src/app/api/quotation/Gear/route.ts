import { NextRequest } from 'next/server';
import { QuotationController } from '../../../../server/controllers/quotation.controller';

export async function GET() {
  return QuotationController.list('gear_quotations');
}

export async function POST(request: NextRequest) {
  return QuotationController.calculateGear(request);
}
