import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/integration" || '';

export async function GET() {
  try {
    const response = await axios.get<string[]>(`${BASE_URL}/api/WheelDetails/makes`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching makes:', error);
    return NextResponse.json({ error: 'Failed to fetch makes' }, { status: 500 });
  }
}
