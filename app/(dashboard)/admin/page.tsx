"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, Activity, DollarSign, Search, ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'trial', 'expired'
    const [error, setError] = useState<string | null>(null);

    // Emails con privilegios de ver este panel. Si estás testeando, asegúrate de que tu mail coincida aquí
    // o elimine temporalmente este chequeo de seguridad
    const ADMIN_ACCOUNTS = ['mannubatt77@gmail.com', 'manubatt@gmail.com', 'admin@agenda.doc'];

    useEffect(() => {
        if (!user) return;

        // Verificación de seguridad rápida del Frontend
        const emailCrt = user.email?.toLowerCase() || '';
        const isAuthorized = ADMIN_ACCOUNTS.some(dom => emailCrt.includes(dom.split('@')[0]));

        if (!isAuthorized) {
            router.push('/dashboard');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setStats(data);
            } catch (e: any) {
                console.error(e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [user, router]);

    if (!user || isLoading) {
        return (
            <div className="flex justify-center items-center py-40">
                <p className="text-gray-400 animate-pulse font-medium">Cargando Panel de Control...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg inline-block max-w-xl">
                    <h3 className="font-bold mb-2 flex items-center justify-center gap-2"><ShieldAlert /> Acceso Bloqueado o Fallido</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Filtrar los usuarios
    let filteredUsers = stats?.users || [];
    if (searchTerm) {
        filteredUsers = filteredUsers.filter((u: any) =>
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (filterStatus !== "all") {
        filteredUsers = filteredUsers.filter((u: any) =>
            u.subscription?.status === filterStatus || (!u.subscription && filterStatus === "expired")
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-32">
            <div className="flex justify-between items-center mb-8 bg-[var(--bg-panel)] p-6 rounded-xl border border-[var(--accent-primary)] shadow-[0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldAlert size={150} />
                </div>
                <div className="z-10 relative">
                    <button
                        onClick={() => router.back()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        className="hover:text-white"
                    >
                        <ArrowLeft size={16} /> Volver al Inicio
                    </button>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        Panel de Administración
                    </h1>
                    <p className="mt-2 text-[var(--text-secondary)] max-w-2xl">
                        Vista global en tiempo real de todos los usuarios registrados, sus suscripciones (Mercado Pago / Trial) y desempeño comercial de la plataforma Agenda.doc
                    </p>
                </div>
            </div>

            {/* Tarjetas KPI de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* Total Users */}
                <div className="bg-[var(--bg-panel)] p-5 rounded-xl border border-[var(--glass-border)] flex flex-col">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                        <span className="font-medium text-sm">Cuentas Registradas</span>
                        <Users size={18} />
                    </div>
                    <span className="text-3xl font-bold text-white">{stats.summary.totalUsers}</span>
                </div>

                {/* Subscripciones Activas Premium */}
                <div className="bg-[var(--bg-panel)] p-5 rounded-xl border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)] flex flex-col">
                    <div className="flex items-center justify-between text-indigo-400 mb-2">
                        <span className="font-medium text-sm">Suscripciones (Premium)</span>
                        <CreditCard size={18} />
                    </div>
                    <span className="text-3xl font-bold text-indigo-400">{stats.summary.totalActiveSubs}</span>
                </div>

                {/* En Prueba / Trial */}
                <div className="bg-[var(--bg-panel)] p-5 rounded-xl border border-green-500/30 flex flex-col">
                    <div className="flex items-center justify-between text-green-400 mb-2">
                        <span className="font-medium text-sm">En Prueba Gratuita (Trial)</span>
                        <Activity size={18} />
                    </div>
                    <span className="text-3xl font-bold text-green-400">{stats.summary.totalTrialSubs}</span>
                </div>

                {/* Ingreso Esperado (MRR) - Sólo demostrativo */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-5 rounded-xl border border-indigo-500 flex flex-col">
                    <div className="flex items-center justify-between text-indigo-200 mb-2">
                        <span className="font-medium text-sm">MRR Estimado (ARS)</span>
                        <DollarSign size={18} />
                    </div>
                    <span className="text-3xl font-bold text-white">${stats.summary.estimatedMRR.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                    <span className="text-xs text-indigo-300 mt-1">Suscripciones activas prorrateadas mensual</span>
                </div>
            </div>

            {/* Control Tabla y Búsquedas */}
            <div className="bg-[var(--bg-panel)] border border-[var(--glass-border)] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[var(--glass-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-lg text-white">Directorio de Usuarios ({filteredUsers.length})</h2>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-[var(--bg-input)] px-3 py-2 rounded-lg flex-1 sm:w-64 border border-[var(--glass-border)]">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none text-white outline-none w-full text-sm"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-[var(--bg-input)] border border-[var(--glass-border)] text-white text-sm rounded-lg px-3 py-2 outline-none"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="active">Premium (Active)</option>
                            <option value="trial">Prueba (Trial)</option>
                            <option value="expired">Expirado/Sin Plan</option>
                        </select>
                    </div>
                </div>

                {/* La Tabla gigante clásica de admin */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-[rgba(255,255,255,0.02)] border-b border-[var(--glass-border)]">
                            <tr>
                                <th scope="col" className="px-6 py-4">Usuario (Email)</th>
                                <th scope="col" className="px-6 py-4">Fecha de Registro</th>
                                <th scope="col" className="px-6 py-4">Último Inicio de Sesión</th>
                                <th scope="col" className="px-6 py-4">Estado Suscripción</th>
                                <th scope="col" className="px-6 py-4">Plan Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((u: any, index: number) => {
                                const st = u.subscription?.status;
                                let statusColor = "bg-gray-500/20 text-gray-400 border-gray-500/30"; // expired/none
                                if (st === 'active') statusColor = "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-semibold";
                                if (st === 'trial') statusColor = "bg-green-500/20 text-green-400 border-green-500/30";

                                return (
                                    <tr key={u.id} className={`border-b border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.02)] transition-colors ${index % 2 === 0 ? 'bg-[rgba(255,255,255,0.01)]' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-white">
                                            {u.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(u.createdAt).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.lastSignIn ? new Date(u.lastSignIn).toLocaleString('es-AR') : 'Nunca ingresó'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs border ${statusColor} capitalize select-none`}>
                                                {st || 'Sin Cuenta MP'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 capitalize">
                                            {u.subscription?.plan || '-'}
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron usuarios bajo este filtro.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
