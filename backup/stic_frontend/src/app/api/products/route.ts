import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Product } from '@/app/types/Products';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/catalog" || '';

/**
 * GET: Fetch all products
 */
export async function GET() {
  try {
    const response = await axios.get<Product[]>(`${BASE_URL}/api/Product`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

/**
 * POST: Create a new product
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await axios.post<Product>(`${BASE_URL}/api/Product`, body);
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
