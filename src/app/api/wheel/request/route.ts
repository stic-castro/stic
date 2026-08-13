import { NextRequest } from 'next/server';
import { WheelDetailsController } from '../../../../server/controllers/quotation.controller';

export async function POST(request: NextRequest) {
  return WheelDetailsController.request(request);
}
