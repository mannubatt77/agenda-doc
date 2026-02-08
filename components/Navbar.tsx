import { Bell, Search, Menu, Calendar, Info, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useAuth();
    const { events, students, courses, selectedYear, setSelectedYear } = useData();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Search Logic
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        return students
            .filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.surname.toLowerCase().includes(query)
            )
            .slice(0, 10) // Limit results
            .map(s => {
                const course = courses.find(c => c.id === s.course_id);
                return {
                    student: s,
                    courseId: s.course_id,
                    courseName: course ? `${course.name} ${course.year}° ${course.division}` : 'Curso desconocido'
                };
            });
    }, [searchQuery, students, courses]);

    // Close search results when clicking outside (reusing logic if possible but simplified)
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // quick fix: we rely on blur/focus mostly or strict click handling, 
            // but checking if click is outside input container is better.
            // For now, let's rely on onFocus and selection logic, or add a wrapper ref if needed.
            // Adding a simple timeout to allow click to register before hiding
        };
        // We handle click selection directly. Hiding on outside click would need a ref for the search container.
    }, []);

    // Effect to show results when query changes
    useEffect(() => {
        if (searchQuery) setShowSearchResults(true);
        else setShowSearchResults(false);
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const initials = useMemo(() => {
        if (!user || (!user.name && !user.surname)) return "U";

        const first = user.name ? user.name[0].toUpperCase() : "";
        const last = user.surname ? user.surname[0].toUpperCase() : "";

        // If only one is present, use first two chars or just one
        if (first && !last) return user.name.substring(0, 2).toUpperCase();
        if (!first && last) return user.surname!.substring(0, 2).toUpperCase();

        return `${first}${last}`;
    }, [user]);

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        return events.filter(e => {
            // Fix timezone offset issue for simple date comparison if needed, 
            // but assuming ISO string YYYY-MM-DD usually works fine with new Date() for comparison
            // Append T00:00:00 to ensure local time if it's just a date string
            const dateStr = e.date.includes('T') ? e.date : `${e.date}T00:00:00`;
            const d = new Date(dateStr);
            return d >= now && d <= nextWeek;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events]);

    const hasNotifications = upcomingEvents.length > 0;

    return (
        <header style={{
            height: '64px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            backgroundColor: 'var(--bg-app)',
            position: 'relative',
            zIndex: 40
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="mobile-only" onClick={onMenuClick} style={{ color: 'var(--text-primary)', background: 'none', border: 'none' }}>
                    <Menu size={24} />
                </button>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                    Dashboard
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Year Selector */}
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-input)', // Slightly different bg to stand out
                        border: '1px solid var(--glass-border)',
                        color: 'var(--accent-primary)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {[selectedYear - 1, selectedYear, selectedYear + 1].sort().map(y => (
                        <option key={y} value={y} style={{ backgroundColor: 'var(--bg-panel)', color: 'white' }}>
                            {y}
                        </option>
                    ))}
                    {/* Add more generic range if needed */}
                </select>

                <div className="desktop-only" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar alumno..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchQuery) setShowSearchResults(true); }}
                        style={{
                            background: 'var(--bg-input)',
                            border: 'none',
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: 'var(--radius-full)',
                            color: 'white',
                            fontSize: '0.875rem',
                            outline: 'none',
                            width: '240px'
                        }}
                    />

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '0.5rem',
                            backgroundColor: 'var(--bg-panel)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            zIndex: 100,
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            {searchResults.map((result) => (
                                <div
                                    key={result.student.id}
                                    onClick={() => {
                                        router.push(`/courses/${result.courseId}`);
                                        setShowSearchResults(false);
                                        setSearchQuery('');
                                    }}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--glass-border)'
                                    }}
                                    className="hover:bg-white/5"
                                >
                                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                        {result.student.surname}, {result.student.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {result.courseName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showSearchResults && searchQuery && searchResults.length === 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '0.5rem',
                            backgroundColor: 'var(--bg-panel)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            zIndex: 100,
                            padding: '1rem',
                            textAlign: 'center',
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            No se encontraron alumnos
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div ref={notificationRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            position: 'relative',
                            padding: '0.5rem',
                            color: showNotifications ? 'var(--text-primary)' : 'var(--text-secondary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <Bell size={20} />
                        {hasNotifications && (
                            <span style={{
                                position: 'absolute',
                                top: '4px',
                                right: '6px',
                                width: '8px',
                                height: '8px',
                                background: 'var(--content-red)',
                                borderRadius: '50%'
                            }}></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: '-10px', // Align slightly to the right
                            width: '320px',
                            backgroundColor: 'var(--bg-panel)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            padding: '1rem',
                            zIndex: 100,
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Notificaciones</h3>
                                <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* System Welcome Message */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div style={{ color: 'var(--accent-primary)', marginTop: '2px' }}>
                                        <Info size={18} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>¡Bienvenido a Agenda.doc!</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            Gestiona tus cursos y alumnos de forma eficiente.
                                        </p>
                                    </div>
                                </div>

                                {upcomingEvents.length > 0 ? (
                                    <>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>
                                            PRÓXIMOS EVENTOS
                                        </div>
                                        {upcomingEvents.map(event => (
                                            <div
                                                key={event.id}
                                                style={{
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    // Make it clickable to go to calendar roughly
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    transition: 'background 0.2s'
                                                }}
                                                className="hover:bg-white/5" // Use tailwind hover if possible, else inline style hover is tricky without CSS class
                                                onClick={() => {
                                                    router.push('/calendar');
                                                    setShowNotifications(false);
                                                }}
                                            >
                                                <div style={{ color: 'var(--content-yellow)', marginTop: '2px' }}>
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{event.title}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {new Date(event.date).toLocaleDateString()} - {event.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        No hay eventos próximos
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                }}>
                    {initials}
                </div>
            </div>
        </header>
    );
}
