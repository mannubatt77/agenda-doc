"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useData } from "@/context/DataContext";
import { useState } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const { subscription } = useData();
    const router = useRouter();
    const pathname = usePathname();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Subscription Renewal Warning Logic (3 days or less)
    let daysRemaining: number | null = null;
    if (subscription?.end_date && subscription.status === 'active') {
        const endDate = new Date(subscription.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays > 0) {
            daysRemaining = diffDays;
        }
    }

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Cargando...
            </div>
        );
    }

    if (!user) return null;

    // Subscription Gate
    // If subscription is expired or cancelled, redirect to pricing
    // Allow access to /pricing and /profile (to logout or manage sub)
    if (subscription && (subscription.status === 'expired' || subscription.status === 'cancelled')) {
        if (pathname !== '/pricing' && pathname !== '/profile') {
            router.push('/pricing');
            return null; // Don't render content while redirecting
        }
    }



    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Renewal Reminder Banner */}
                {daysRemaining !== null && (
                    <div className="no-print" style={{
                        backgroundColor: 'rgba(234, 179, 8, 0.15)',
                        borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
                        padding: '0.75rem 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        color: '#facc15'
                    }}>
                        <span style={{ fontWeight: 500 }}>
                            {daysRemaining === 1
                                ? '¡Tu suscripción vence mañana!'
                                : `¡Tu suscripción vence en ${daysRemaining} días!`
                            } Renová ahora para no perder acceso ni información.
                        </span>
                        <button
                            onClick={() => router.push('/pricing')}
                            style={{
                                backgroundColor: '#facc15',
                                color: '#422006',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Renovar
                        </button>
                    </div>
                )}

                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }} className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
