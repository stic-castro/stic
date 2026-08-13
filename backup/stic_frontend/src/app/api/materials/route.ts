// app/api/materials/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { Material } from '@/app/types/Materials';

const MATERIAL_API_URL = process.env.NEXT_PUBLIC_API_URL + "/quotation" || '';

export async function GET() {
  try {
    const response = await axios.get<Material[]>(`${MATERIAL_API_URL}/api/Material`, {
      params: {
        page: 1,
        pageSize: 100,
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching materials from backend API:', error.message || error);
    return NextResponse.json({ error: 'Error fetching materials' }, { status: 500 });
  }
}
