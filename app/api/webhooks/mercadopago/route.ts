import { NextRequest, NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';
import { supabase } from '@/lib/supabase';

// Helper to add days
const addDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const searchParams = url.searchParams;

        // MercadoPago sends data in query params or body depending on version/config
        const body = await req.json().catch(() => ({}));

        const topic = searchParams.get('topic') || body.type;
        const id = searchParams.get('id') || body.data?.id;

        if (topic === 'payment' && id) {
            const paymentInfo = await payment.get({ id: id });

            if (paymentInfo && paymentInfo.status === 'approved') {
                const userId = paymentInfo.external_reference;

                // Extract plan type (e.g., 'plan-monthly' -> 'monthly')
                const itemId = paymentInfo.additional_info?.items?.[0]?.id || 'plan-monthly';
                const planType = itemId.replace('plan-', '');

                let daysToAdd = 30;
                if (planType === 'quarterly') daysToAdd = 90;
                if (planType === 'biannual') daysToAdd = 180;
                if (planType === 'yearly') daysToAdd = 365;

                if (userId) {
                    const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
                        ? require('@supabase/supabase-js').createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL,
                            process.env.SUPABASE_SERVICE_ROLE_KEY
                        )
                        : supabase;

                    // Fetch the current subscription for this user
                    const { data: currentSub } = await supabaseAdmin
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', userId)
                        .maybeSingle();

                    // Calculate new Start and End Dates based on stacking principle
                    const today = new Date();
                    let newStartDate = today;
                    let newEndDate = addDays(today, daysToAdd);

                    if (currentSub && currentSub.end_date) {
                        const currentEndDate = new Date(currentSub.end_date);
                        // If the subscription is still active (end date in future)
                        if (currentEndDate > today) {
                            newStartDate = new Date(currentSub.start_date || today.toISOString());
                            newEndDate = addDays(currentEndDate, daysToAdd);
                        }
                    }

                    const { error } = await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        status: 'active',
                        plan_type: planType,
                        start_date: newStartDate.toISOString(),
                        end_date: newEndDate.toISOString(),
                        updated_at: today.toISOString()
                    }, { onConflict: 'user_id' });

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
