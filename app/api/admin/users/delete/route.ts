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
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "Falta userId." }, { status: 400 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

        // Eliminar definitivamente usuario (y datos en cascada si DB está bien configurada)
        const { data, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            throw new Error("No se pudo eliminar al usuario desde Supabase.");
        }

        return NextResponse.json({ success: true, message: "Usuario eliminado correctamente." });
    } catch (error: any) {
        console.error("Endpoint Admin Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
