import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL + "/quotation" || '';

export async function GET() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/quotation/Gear`, {
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

    console.error("Error obteniendo cotizaciones de engranajes:", error.message || error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await axios.post(`${BACKEND_URL}/api/quotation/Gear/calculate-price`, body);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Error en API local de engranajes:", error.message || error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
