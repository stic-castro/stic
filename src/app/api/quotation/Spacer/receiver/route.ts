import { QuotationController } from '../../../../../server/controllers/quotation.controller';

export async function POST() {
  return QuotationController.receiver();
}
