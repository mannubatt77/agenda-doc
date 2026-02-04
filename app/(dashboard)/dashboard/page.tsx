"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Calendar } from "lucide-react";

import { GradeStatsCharts } from "@/components/GradeStatsCharts";

export default function DashboardPage() {
    const { user } = useAuth();
    const { courses, students, events, grades } = useData();

    // 2. Get upcoming events (Including Today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    const upcomingEvents = events
        .filter(e => {
            const eventDate = new Date(e.date);
            // Fix timezone offset issue if date string is YYYY-MM-DD (parsed as UTC) vs local today
            // Simple string comparison for 'today' matches, or date obj comparison
            // Best approach for YYYY-MM-DD strings:
            const eventDateStr = e.date; // already YYYY-MM-DD
            const todayStr = today.toISOString().split('T')[0];

            return eventDateStr >= todayStr;
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3); // Show top 3

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Hola, {user?.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
                Bienvenido a tu panel de control. Selecciona una opción del menú para comenzar.
            </p>

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
            }}>

                <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={16} /> Cursos Activos
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{courses.length}</div>
                    <Link href="/schools" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Gestionar <ArrowRight size={14} />
                    </Link>
                </div>

                <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> Alumnos Total
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{students.length}</div>
                </div>

                <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex', flexDirection: 'column', gap: '1rem' // increased gap
                }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} /> Próximos Eventos
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {upcomingEvents.length === 0 && <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sin eventos próximos</span>}
                        {upcomingEvents.map(e => (
                            <div key={e.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '0.9rem', width: '35px', textAlign: 'center', lineHeight: 1 }}>
                                    {e.date.split('-')[2]} <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-secondary)' }}>{e.date.split('-')[1]}</span>
                                </div>
                                <div style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {e.title}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link href="/calendar" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Ver Calendario Completo <ArrowRight size={14} />
                    </Link>
                </div>

            </div>



            {/* Global Charts */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '3rem', marginBottom: '1rem' }}>Rendimiento General</h2>
            <GradeStatsCharts students={students} grades={grades} />
        </div >
    );
}
