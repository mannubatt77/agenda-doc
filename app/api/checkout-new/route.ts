import { NextRequest, NextResponse } from 'next/server';
import { preference } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let step = 'START';
    try {
        step = 'ENV_CHECK';
        if (!process.env.MP_ACCESS_TOKEN) throw new Error('MP_TOKEN missing');

        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseKey) throw new Error('SERVICE_ROLE missing');

        /*
        step = 'AUTH_HEADER';
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Falta Header Auth' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');

        step = 'SUPABASE_CLIENT_INIT';
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        step = 'AUTH_GET_USER';
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError) return NextResponse.json({ error: `Auth Error (${step}): ${authError.message}` }, { status: 401 });
        if (!user) return NextResponse.json({ error: `User Not Found (${step})` }, { status: 401 });
        */

        // HARDCODED BYPASS FOR TESTING
        const user = { email: 'debug_test@agenda.doc', id: 'debug_123' };

        step = 'READ_BODY';
        const body = await req.json();
        const { planType } = body;

        step = 'PREPARE_MP';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const preferenceData = {
            body: {
                items: [{
                    id: 'plan-yearly',
                    title: 'Suscripción DocX (Prueba)',
                    quantity: 1,
                    unit_price: 1,
                    currency_id: 'ARS',
                }],
                payer: { email: user.email },
                back_urls: {
                    success: `${appUrl}/success`,
                    failure: `${appUrl}/pricing`,
                    pending: `${appUrl}/pricing`,
                },
                auto_return: 'approved',
                external_reference: user.id
            }
        };

        step = 'CALL_MP_CREATE_RAW';
        // USE RAW FETCH TO BYPASS LIBRARY WEIRDNESS
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferenceData.body)
        });

        if (!mpResponse.ok) {
            const errorText = await mpResponse.text();
            throw new Error(`MP API Error (${mpResponse.status}): ${errorText}`);
        }

        const result = await mpResponse.json();

        step = 'CHECK_RESULT';
        if (!result?.init_point) throw new Error('No init_point returned from raw fetch');

        return NextResponse.json({ url: result.init_point });

    } catch (error: any) {
        console.error(`ERROR AT STEP [${step}]:`, error);
        return NextResponse.json({
            error: `CRASH en paso [${step}]: ${error.message || 'Error desconocido'}`
        }, { status: 500 });
    }
}
