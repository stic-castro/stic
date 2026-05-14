import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { Product } from '@/app/types/Products'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/catalog" || ''

export async function GET(req: NextRequest, ctx: any) {
  const id = ctx.params?.id

  try {
    const response = await axios.get<Product>(`${BASE_URL}/api/Product/${id}`)
    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(req: NextRequest, ctx: any) {
  const id = ctx.params?.id

  try {
    const body = await req.json()
    const response = await axios.put<Product>(`${BASE_URL}/api/Product/${id}`, body)
    return NextResponse.json(response.data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx: any) {
  const id = ctx.params?.id

  try {
    await axios.delete(`${BASE_URL}/api/Product/${id}`)
    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
