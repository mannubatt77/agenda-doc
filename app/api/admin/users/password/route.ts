import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Lista de correos autorizados para acciones de administrador
const ADMIN_ACCOUNTS = [
    'mbattoia.cnsc@gmail.com',
    'mannubatt77@gmail.com',
    'manubatt@gmail.com',
    'admin@agenda.doc'
];

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: "No autorizado. Token faltante." }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verificar firma y validez del token JWT del usuario que hace la petición
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user || !user.email) {
            return NextResponse.json({ error: "Token inválido o expirado." }, { status: 401 });
        }

        // Verificar si es super admin
        const isAdmin = ADMIN_ACCOUNTS.some(email => user.email?.toLowerCase() === email.toLowerCase());
        if (!isAdmin) {
            return NextResponse.json({ error: "Acceso denegado. No eres administrador." }, { status: 403 });
        }

        const body = await req.json();
        const { userId, newPassword } = body;

        if (!userId || !newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "Faltan parámetros o la contraseña es muy corta (mínimo 6 caracteres)." }, { status: 400 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

        // Forzar el cambio de contraseña con Service Role
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (updateError) {
            console.error("Error updating password:", updateError);
            throw new Error("No se pudo cambiar la contraseña del usuario.");
        }

        return NextResponse.json({ success: true, message: "Contraseña cambiada correctamente." });
    } catch (error: any) {
        console.error("Endpoint Admin Password Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
