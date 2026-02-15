"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";

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
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }} className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
