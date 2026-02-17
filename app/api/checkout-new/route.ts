import { NextRequest, NextResponse } from 'next/server';
import { preference } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // 0. Environment Checks
        if (!process.env.MP_ACCESS_TOKEN) {
            console.error("MP_ACCESS_TOKEN is missing");
            return NextResponse.json({ error: 'Error de configuración: Falta MP_ACCESS_TOKEN en Vercel' }, { status: 500 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseKey) {
            console.error('SUPABASE_SERVICE_ROLE_KEY missing');
            return NextResponse.json({ error: 'Error de configuración: Falta SUPABASE_SERVICE_ROLE_KEY en Vercel' }, { status: 500 });
        }

        // 1. Validate User
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'No autorizado (Falta Header)' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        // 2. Auth Check with Service Role
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        let user;
        try {
            const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
            if (authError) throw authError;
            user = data.user;
        } catch (authErr: any) {
            console.error("Auth Check Failed:", authErr);
            return NextResponse.json({ error: `Fallo de Autenticación: ${authErr.message}` }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ error: 'No autorizado (Usuario no encontrado)' }, { status: 401 });
        }

        // 3. Create Preference
        const body = await req.json();
        const { planType } = body;
        const title = 'Suscripción Anual - DocX (Prueba)';
        const unit_price = 1; // Testing price

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const result = await preference.create({
            body: {
                items: [{
                    id: 'plan-yearly',
                    title: title,
                    quantity: 1,
                    unit_price: unit_price,
                    currency_id: 'ARS',
                }],
                payer: { email: user.email },
                back_urls: {
                    success: `${appUrl}/success`,
                    failure: `${appUrl}/pricing?status=failure`,
                    pending: `${appUrl}/pricing?status=pending`,
                },
                auto_return: 'approved',
                external_reference: user.id,
                notification_url: `${appUrl}/api/webhooks/mercadopago`,
            }
        });

        if (!result.init_point) {
            throw new Error('MercadoPago no devolvió un punto de inicio');
        }

        return NextResponse.json({ url: result.init_point });

    } catch (error: any) {
        console.error('Final Error:', error);
        return NextResponse.json({ error: `Error Final: ${error.message}` }, { status: 500 });
    }
}
