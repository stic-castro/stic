import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/catalog" || '';

/**
 * Fetches the all categories for the database
 *
 * @returns list of all categories
 */
export async function GET() {
  const fullUrl = `${BASE_URL}/api/Category`;
  try {
    const response = await axios.get(fullUrl, {
      params: {
        page: 1,
        pageSize: 100,
      },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 200 },
    );
  }
}
