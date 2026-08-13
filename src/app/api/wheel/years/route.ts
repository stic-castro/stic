import { NextRequest } from 'next/server';
import { WheelDetailsController } from '../../../../server/controllers/quotation.controller';

export async function GET(request: NextRequest) {
  return WheelDetailsController.getYears(request);
}
