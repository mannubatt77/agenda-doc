import { NextRequest, NextResponse } from 'next/server';
import { preference } from '@/lib/mercadopago';
// import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';


// We need a server-side Supabase client to verify the session securely
// However, for this step, we'll trust the auth header verification or use a service role if needed to update DB, 
// but for creating preference we just need the user ID.
// Ideally, we should use createRouteHandlerClient from @supabase/auth-helpers-nextjs or similar,
// but I'll stick to a simpler approach using the standard client if specific auth helpers aren't set up,
// or verify the token manually.
// UPDATE: The user seems to use a client-side supabase in `lib/supabase`. 
// We should probably use a server-side checking mechanism.
// For now, I'll assume standard Bearer token validation or just trusting the session if passed (but that's insecure).
// Better: Use `supabase.auth.getUser()` with the token from the header.

export async function POST(req: NextRequest) {
    try {
        if (!process.env.MP_ACCESS_TOKEN) {
            console.error("MP_ACCESS_TOKEN is missing in environment variables");
            return NextResponse.json({ error: 'Error de configuración: Falta MP_ACCESS_TOKEN' }, { status: 500 });
        }

        // 1. Validate User
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        // Create a dedicated client for auth verification to avoid RLS issues
        // Use Service Role Key if available (Bypass RLS), otherwise Anon Key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseKey) {
            console.error('SUPABASE_SERVICE_ROLE_KEY missing');
            return NextResponse.json({ error: 'Error de configuración: Falta SUPABASE_SERVICE_ROLE_KEY en Vercel' }, { status: 500 });
        }

        try {
            // Validate that we are using the SERVICE_ROLE key, not the ANON key
            const [, payloadBase64] = supabaseKey.split('.');
            const payloadJson = Buffer.from(payloadBase64, 'base64').toString();
            const payload = JSON.parse(payloadJson);
            if (payload.role !== 'service_role') {
                return NextResponse.json({ error: 'Error de configuración: La clave SUPABASE_SERVICE_ROLE_KEY ingresada no es válida (parece ser Anon/Public). Revisa Vercel.' }, { status: 500 });
            }
        } catch (e) {
            console.error('Error validation key:', e);
            return NextResponse.json({ error: 'Error de configuración: Clave SUPABASE_SERVICE_ROLE_KEY inválida' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // 2. Get Plan Details
        const body = await req.json();
        const { planType } = body;

        const title = 'Suscripción Anual - DocX (Prueba)';
        const unit_price = 1;

        if (planType !== 'yearly') {
            return NextResponse.json({ error: 'Tipo de plan inválido' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const preferenceData = {
            body: {
                items: [
                    {
                        id: 'plan-yearly',
                        title: title,
                        quantity: 1,
                        unit_price: unit_price,
                        currency_id: 'ARS',
                    }
                ],
                // Only send payer info in production. In localhost/sandbox, let MP handle it 
                // to avoid "Seller buying from Seller" or "Verification Code" issues with dummy emails.
                payer: appUrl.includes('localhost') ? undefined : {
                    email: user.email,
                },
                back_urls: {
                    success: `${appUrl}/success`,
                    failure: `${appUrl}/pricing?status=failure`,
                    pending: `${appUrl}/pricing?status=pending`,
                },
                auto_return: appUrl.includes('localhost') ? undefined : 'approved',
                external_reference: user.id,
                notification_url: `${appUrl}/api/webhooks/mercadopago`,
            }
        };

        console.log("MP Preference Payload:", JSON.stringify(preferenceData, null, 2));

        // 3. Create Preference
        const result = await preference.create(preferenceData);

        if (!result.init_point) {
            throw new Error('MercadoPago no devolvió un punto de inicio (init_point)');
        }

        return NextResponse.json({ url: result.init_point });

    } catch (error: any) {
        console.error('Error creating preference:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}
