import { NextRequest, NextResponse } from 'next/server';
import { preference } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    return NextResponse.json({ error: "DEBUG: LLEGUE AL NUEVO ENDPOINT. SI VES ESTO, EL CODIGO ESTA VIVO." }, { status: 400 });
}
