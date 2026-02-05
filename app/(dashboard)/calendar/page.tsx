"use client";

import { useData } from "@/context/DataContext";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";

export default function CalendarPage() {
    const { events, courses } = useData();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Filter events for current month
    const monthEvents = events.filter(e => {
        const d = new Date(e.date + 'T00:00:00'); // simple parse
        return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    }).sort((a, b) => a.date.localeCompare(b.date));

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const monthName = currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Calendario General</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Eventos de todas tus materias</p>
            </header>

            <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', padding: '1.5rem', minHeight: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <button onClick={prevMonth} style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}><ChevronLeft size={20} /></button>
                    <h2 style={{ textTransform: 'capitalize', fontSize: '1.25rem', fontWeight: 600 }}>{monthName}</h2>
                    <button onClick={nextMonth} style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-input)' }}><ChevronRight size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {monthEvents.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <CalIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            No hay eventos para este mes.
                        </div>
                    )}

                    {monthEvents.map(event => {
                        const course = courses.find(c => c.id === event.course_id);
                        return (
                            <div key={event.id} style={{ display: 'flex', gap: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center', minWidth: '50px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>{event.date.split('-')[2]}</div>
                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{new Date(event.date + 'T00:00:00').toLocaleString('es-ES', { weekday: 'short' })}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{event.title}</div>
                                    {course && (
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {course.name} {course.year} ({course.division})
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
