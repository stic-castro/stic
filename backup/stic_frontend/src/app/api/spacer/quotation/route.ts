import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/quotation" || '';

export async function GET() {
  try {
    const response = await axios.get(`${BASE_URL}/api/quotation/Spacer`, {
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

    console.error('Error fetching spacer quotations:', error.message || error);
    return NextResponse.json({ error: 'Failed to fetch spacer quotations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(`${BASE_URL}/api/quotation/Spacer/calculate-price`, body);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error calculating quotation:', error.message || error);
    return NextResponse.json({ error: 'Failed to calculate quotation' }, { status: 500 });
  }
}
