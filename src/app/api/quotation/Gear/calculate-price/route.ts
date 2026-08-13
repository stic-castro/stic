import { NextRequest } from 'next/server';
import { QuotationController } from '../../../../../server/controllers/quotation.controller';

export async function POST(request: NextRequest) {
  return QuotationController.calculateGear(request);
}
