import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

//const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/chatbot" || '';
const BASE_URL = "http://localhost:5005";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(`${BASE_URL}/webhooks/rest/webhook`, body);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error sending message to chatbot:', error.message || error);
    return NextResponse.json({ error: 'Failed to contact chatbot' }, { status: 500 });
  }
}