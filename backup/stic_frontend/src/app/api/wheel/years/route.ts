import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/integration" || '';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');

    if (!make || !model) {
      return NextResponse.json({ error: 'Make and model are required' }, { status: 400 });
    }

    const response = await axios.get<number[]>(`${BASE_URL}/api/WheelDetails/years?make=${make}&model=${model}`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching years:', error);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
}
