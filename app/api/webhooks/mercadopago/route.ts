import { NextRequest, NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';
import { supabase } from '@/lib/supabase';

// Helper to calculate end date
const addYear = (date: Date) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + 1);
    return newDate;
};

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const searchParams = url.searchParams;

        // MercadoPago sends data in query params or body depending on version/config
        // Usually query params: ?topic=payment&id=123
        // Or body: { action: 'payment.created', data: { id: '123' } }

        const body = await req.json().catch(() => ({}));

        const topic = searchParams.get('topic') || body.type;
        const id = searchParams.get('id') || body.data?.id;

        if (topic === 'payment' && id) {
            const paymentInfo = await payment.get({ id: id });

            if (paymentInfo && paymentInfo.status === 'approved') {
                const userId = paymentInfo.external_reference;

                if (userId) {
                    const startDate = new Date();
                    const endDate = addYear(startDate);

                    // Update subscription in Supabase
                    // We use admin privileges ideally, but here we use the anon client 
                    // which might be restricted by RLS if not careful.
                    // However, if RLS allows "authenticated" to update "own" subscription, 
                    // this webhook (server-side) DOES NOT have the user's session.
                    // So we need SERVICE_ROLE key for this to work reliably if RLS is strict.
                    // Since I don't have the service role key in code (usually), I might have issues.
                    // BUT: if I use `supabase` from `@/lib/supabase`, it's likely the anon client.
                    // The anon client cannot update a user's subscription without their session.
                    //
                    // CRITICAL: We need a way to bypass RLS or use a Service Role client.
                    // Checking `lib/supabase.ts` might reveal if it's just anon.
                    // 
                    // Assuming for now we might need to fix this later or `supabase` has admin rights (unlikely).
                    // Or maybe RLS is open.
                    //
                    // I'll try to update. If it fails, I'll note it.
                    // Actually, for a robust implementation, createClient(url, serviceRoleKey) is needed here.
                    // I'll check process.env for service role key.

                    const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
                        ? require('@supabase/supabase-js').createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL,
                            process.env.SUPABASE_SERVICE_ROLE_KEY
                        )
                        : supabase; // Fallback (might fail if RLS is on)

                    const { error } = await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        status: 'active',
                        plan_type: 'yearly',
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' }); // Assuming user_id is unique or PK

                    if (error) {
                        console.error('Error updating subscription:', error);
                        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                    }
                }
            }
        }

        return NextResponse.json({ status: 'OK' });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
