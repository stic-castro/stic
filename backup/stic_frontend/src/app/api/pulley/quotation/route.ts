import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { PulleyQuotationRequest, PulleyQuotationResponse } from '@/app/types/Pulleys';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL + "/quotation" || '';

export async function GET() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/quotation/Pulley`, {
      params: {
        page: 1,
        pageSize: 500,
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return NextResponse.json([], { status: 200 });
    }

    console.error('Error fetching pulley quotations:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch pulley quotations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PulleyQuotationRequest;

    const response = await axios.post<PulleyQuotationResponse>(
      `${BACKEND_URL}/api/quotation/Pulley/calculate-price`,
      body
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error calculating pulley quotation:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to calculate pulley quotation' },
      { status: 500 }
    );
  }
}
