import { NextRequest, NextResponse } from 'next/server';
import { preference } from '@/lib/mercadopago';
import { supabase } from '@/lib/supabase';
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
        // 1. Validate User
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Plan Details
        const body = await req.json();
        const { planType } = body;

        let title = 'Suscripción Anual - DocX (Prueba)';
        let price = 1;
        let unit_price = 1;

        if (planType !== 'yearly') {
            return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
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
            throw new Error('No init_point returned from MercadoPago');
        }

        return NextResponse.json({ url: result.init_point });

    } catch (error: any) {
        console.error('Error creating preference:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
