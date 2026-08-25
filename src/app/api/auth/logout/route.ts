import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '../../../../server/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { supabase, withCookies } = createSupabaseRouteHandlerClient(request);
  await supabase.auth.signOut();
  return withCookies(NextResponse.json({ success: true }, { status: 200 }));
}
