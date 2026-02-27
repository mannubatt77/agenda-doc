import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos las claves de Service Role para bypassear RLS en este endopint de uso exclusivo admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: "Faltan credenciales maestras (Service Role) en el servidor." }, { status: 500 });
        }

        // 1. Obtiene la lista completa de usuarios del módulo de Autenticación
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        // 2. Obtiene todas las suscripciones de mercadopago/sistema (Bypasseando RLS porque es cliente Service Role)
        const { data: subsData, error: subsError } = await supabase.from('subscriptions').select('*');
        if (subsError) throw subsError;

        // 3. Procesaremos los datos
        const users = authData.users;
        const totalUsers = users.length;
        const activeSubs = subsData.filter(s => s.status === 'active');
        const trialSubsNum = users.length - activeSubs.length; // Los que no son premium están en modo gratuito
        const expiredSubs = subsData.filter(s => s.status === 'expired' || s.status === 'cancelled');

        // Unimos los usuarios con su membresía actual
        const userDetails = users.map(u => {
            const sub = subsData.find(s => s.user_id === u.id);
            return {
                id: u.id,
                email: u.email,
                lastSignIn: u.last_sign_in_at,
                createdAt: u.created_at,
                subscription: sub ? {
                    status: sub.status,
                    plan: sub.plan_type,
                    endDate: sub.end_date
                } : null
            };
        }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        // Calculamos un estimado súper básico de Ingresos tomando la suscripción en Argentina como ejemplo 
        // Asumiendo: ARS $45,000 por Año (o sea 45000 por usuario activo anual) y $4,500 mensual.
        const arpuYearly = activeSubs.filter(s => s.plan_type === 'yearly').length * 45000;
        const arpuMonthly = activeSubs.filter(s => s.plan_type === 'monthly').length * 4500;
        const estimatedMRR = arpuMonthly + (arpuYearly / 12); // Estimated Monthly Recurring Revenue

        // 4. Generamos datos para Gráficos
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentYear = new Date().getFullYear();
        const chartData = months.map(m => ({ name: m, usuarios: 0, suscripciones: 0 }));

        users.forEach(u => {
            const date = new Date(u.created_at || 0);
            if (date.getFullYear() === currentYear) {
                // Verificamos si este usuario tiene una suscripción activa
                const tieneSubActiva = activeSubs.some(s => s.user_id === u.id);
                if (!tieneSubActiva) {
                    chartData[date.getMonth()].usuarios++;
                }
            }
        });

        activeSubs.forEach(s => {
            const date = new Date(s.start_date || s.created_at || 0);
            if (date.getFullYear() === currentYear) {
                chartData[date.getMonth()].suscripciones++;
            }
        });

        return NextResponse.json({
            summary: {
                totalUsers,
                totalActiveSubs: activeSubs.length,
                totalTrialSubs: trialSubsNum,
                totalExpired: expiredSubs.length,
                estimatedMRR: estimatedMRR
            },
            chartData,
            users: userDetails
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
