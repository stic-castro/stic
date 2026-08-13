import { WheelDetailsController } from '../../../../server/controllers/quotation.controller';

export async function GET() {
  return WheelDetailsController.getMakes();
}
