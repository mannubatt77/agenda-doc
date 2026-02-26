import Link from 'next/link';
import { Home, User, BookOpen, Calendar, LogOut, X, FileText, BarChart2, LayoutGrid, Users, PenTool } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        if (window.innerWidth < 1024 && onClose) onClose();
    };

    const menuItems = [
        { icon: Home, label: 'Inicio', href: '/dashboard' },
        { icon: User, label: 'Perfil', href: '/profile' },
        { icon: BookOpen, label: 'Escuelas y Materias', href: '/schools' },
        { icon: Calendar, label: 'Calendario', href: '/calendar' },
        { icon: FileText, label: 'Inf. Trayectorias', href: '/informes' },
        { icon: BarChart2, label: 'Estadísticas', href: '/analytics' },
        { icon: LayoutGrid, label: 'Plano del Aula', href: '/seating' },
        { icon: Users, label: 'Grupos Mágicos', href: '/groups' },
        { icon: PenTool, label: 'Planificaciones', href: '/planners' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="mobile-only"
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40
                    }}
                />
            )}

            <aside className={isOpen ? 'sidebar-open' : ''} style={{
                width: '260px',
                backgroundColor: 'var(--bg-panel)',
                borderRight: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                height: '100vh',
                position: 'sticky',
                top: 0,
                // Resposive behavior handled via class or inline media query check if possible, 
                // but simpler to use generic styles + mobile override class
                transition: 'transform 0.3s ease-in-out',
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px' }}></div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Agenda.doc</span>
                    </div>
                    {/* Close Button Mobile */}
                    <button className="mobile-only" onClick={onClose} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => { if (window.innerWidth < 1024 && onClose) onClose() }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-secondary)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <item.icon size={20} />
                            <span style={{ fontWeight: 500 }}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.7 }}>
                        Develop by BATSISTEMAS
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <Link href="/manual" onClick={() => { if (window.innerWidth < 1024 && onClose) onClose() }} style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }} className="hover:underline">
                            📖 Ver Manual de Usuario
                        </Link>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            width: '100%',
                            color: 'var(--text-muted)',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <style jsx global>{`
                @media (max-width: 1024px) {
                    aside {
                        position: fixed !important;
                        left: 0;
                        top: 0;
                        z-index: 50;
                        transform: translateX(-100%);
                    }
                    aside.sidebar-open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
}
