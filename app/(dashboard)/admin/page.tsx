"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, Activity, DollarSign, Search, ShieldAlert, ArrowLeft, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
    const ADMIN_ACCOUNTS = ['mbattoia.cnsc@gmail.com', 'mannubatt77@gmail.com', 'manubatt@gmail.com', 'admin@agenda.doc'];

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
        <div style={{ padding: '1.5rem', maxWidth: '80rem', margin: '0 auto', paddingBottom: '8rem' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem',
                backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--accent-primary)', boxShadow: '0 0 40px rgba(99,102,241,0.15)',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '2rem', opacity: 0.1 }}>
                    <ShieldAlert size={150} />
                </div>
                <div style={{ zIndex: 10, position: 'relative' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={16} /> Volver al Inicio
                    </button>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                        Panel de Administración
                    </h1>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', maxWidth: '42rem' }}>
                        Vista global en tiempo real de todos los usuarios registrados, sus suscripciones (Mercado Pago / Trial) y desempeño comercial de la plataforma Agenda.doc
                    </p>
                </div>
            </div>

            {/* Tarjetas KPI de Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {/* Total Users */}
                <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9ca3af', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Cuentas Registradas</span>
                        <Users size={18} />
                    </div>
                    <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>{stats.summary.totalUsers}</span>
                </div>

                {/* Subscripciones Activas Premium */}
                <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(99,102,241,0.5)', boxShadow: '0 0 15px rgba(99,102,241,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#818cf8', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Suscripciones (Premium)</span>
                        <CreditCard size={18} />
                    </div>
                    <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#818cf8' }}>{stats.summary.totalActiveSubs}</span>
                </div>

                {/* En Prueba / Trial */}
                <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4ade80', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>En Prueba Gratuita (Trial)</span>
                        <Activity size={18} />
                    </div>
                    <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#4ade80' }}>{stats.summary.totalTrialSubs}</span>
                </div>

                {/* Ingreso Esperado (MRR) - Sólo demostrativo */}
                <div style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(49,46,129,0.5), rgba(88,28,135,0.5))', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid #6366f1', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#c7d2fe', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>MRR Estimado (ARS)</span>
                        <DollarSign size={18} />
                    </div>
                    <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white' }}>${stats.summary.estimatedMRR.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                    <span style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '0.25rem' }}>Suscripciones activas prorrateadas mensual</span>
                </div>
            </div>

            {/* Performance Chart */}
            {stats.chartData && stats.chartData.length > 0 && (
                <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <TrendingUp style={{ color: '#818cf8' }} size={20} />
                        <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'white', margin: 0 }}>Crecimiento Anual (2026)</h2>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--glass-border)', color: 'white', borderRadius: '8px' }}
                                    itemStyle={{ color: 'white' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" name="Registros (Gratis)" dataKey="usuarios" stroke="#9ca3af" strokeWidth={3} dot={{ r: 4, fill: '#9ca3af' }} />
                                <Line type="monotone" name="Suscripciones (Premium)" dataKey="suscripciones" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Control Tabla y Búsquedas */}
            <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'white', margin: 0 }}>Directorio de Usuarios ({filteredUsers.length})</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-input)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                            <Search size={16} style={{ color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder="Buscar email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ backgroundColor: 'transparent', border: 'none', color: 'white', outline: 'none', width: '200px', fontSize: '0.875rem' }}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.875rem', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', outline: 'none' }}
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="active">Premium (Active)</option>
                            <option value="trial">Prueba (Trial)</option>
                            <option value="expired">Expirado/Sin Plan</option>
                        </select>
                    </div>
                </div>

                {/* La Tabla gigante clásica de admin */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', fontSize: '0.875rem', color: '#d1d5db', borderCollapse: 'collapse' }}>
                        <thead style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            <tr>
                                <th scope="col" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>Usuario (Email)</th>
                                <th scope="col" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>Fecha de Registro</th>
                                <th scope="col" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>Último Inicio de Sesión</th>
                                <th scope="col" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>Estado Suscripción</th>
                                <th scope="col" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>Plan Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((u: any, index: number) => {
                                const st = u.subscription?.status;
                                let statusBg = "rgba(107,114,128,0.2)";
                                let statusColor = "#9ca3af";
                                let statusBorder = "1px solid rgba(107,114,128,0.3)";
                                let fontWeight = "normal";

                                if (st === 'active') {
                                    statusBg = "rgba(99,102,241,0.2)";
                                    statusColor = "#818cf8";
                                    statusBorder = "1px solid rgba(99,102,241,0.3)";
                                    fontWeight = "600";
                                } else if (st === 'trial') {
                                    statusBg = "rgba(34,197,94,0.2)";
                                    statusColor = "#4ade80";
                                    statusBorder = "1px solid rgba(34,197,94,0.3)";
                                }

                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'white' }}>
                                            {u.email}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {new Date(u.createdAt).toLocaleDateString('es-AR')}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {u.lastSignIn ? new Date(u.lastSignIn).toLocaleString('es-AR') : 'Nunca ingresó'}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', backgroundColor: statusBg, color: statusColor, border: statusBorder, textTransform: 'capitalize', userSelect: 'none', fontWeight: fontWeight }}>
                                                {st || 'Sin Cuenta MP'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                                            {u.subscription?.plan || '-'}
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#6b7280' }}>
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
