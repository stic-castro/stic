import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/integration" || '';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const make = searchParams.get('make');

    if (!make) {
      return NextResponse.json({ error: 'Make is required' }, { status: 400 });
    }

    const response = await axios.get<string[]>(`${BASE_URL}/api/WheelDetails/models?make=${make}`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
