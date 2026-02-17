"use client";

import { useData } from "@/context/DataContext";
import { Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PricingPage() {
    const { subscription } = useData();

    const isPremium = subscription?.status === 'active';

    const handleSubscribe = async (plan: 'yearly' | 'monthly') => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Debes iniciar sesión para suscribirte.");
                return;
            }

            const response = await fetch('/api/checkout-new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ planType: plan })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", response.status, errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    alert("Error del servidor: " + (errorJson.error || errorText));
                } catch {
                    alert("Error del servidor (" + response.status + "): " + errorText.substring(0, 100));
                }
                return;
            }

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error al iniciar el pago: " + (data.error || "Desconocido"));
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error al procesar el pago: ${error.message || 'Error desconocido'}`);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Planes y Precios (v2.3)</h1>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Elige el plan que mejor se adapte a tus necesidades.</p>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Free / Trial Plan */}
                <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Prueba Gratuita</h2>
                    <p className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>$0 <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/ mes</span></p>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Ideal para probar la plataforma.</p>

                    <ul className="space-y-3 mb-8 flex-1">
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                            <div style={{ color: 'var(--content-green)' }}><Check size={20} /></div>
                            <span>Acceso a todas las funciones</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                            <div style={{ color: 'var(--content-green)' }}><Check size={20} /></div>
                            <span>Hasta 50 alumnos</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                            <div style={{ color: 'var(--text-muted)' }}><X size={20} /></div>
                            <span>Soporte prioritario</span>
                        </li>
                    </ul>

                    {subscription?.status === 'trial' && (
                        <div className="w-full py-2 px-4 rounded-lg text-center font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                            Plan Actual (Prueba)
                        </div>
                    )}
                </div>

                {/* PRO Plan */}
                <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: isPremium ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isPremium ? '0 0 0 1px var(--accent-primary)' : 'none',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {isPremium && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-primary)'
                        }} />
                    )}

                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profesional</h2>
                        </div>
                        <span style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Recomendado
                        </span>
                    </div>

                    <p className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>$20.000 <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/ año</span></p>
                    <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Para docentes organizados.</p>

                    <ul className="space-y-3 mb-8 flex-1">
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                            <div style={{ color: 'var(--content-green)' }}><Check size={20} /></div>
                            <span>Alumnos ilimitados</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                            <div style={{ color: 'var(--content-green)' }}><Check size={20} /></div>
                            <span>Cursos y escuelas ilimitadas</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                            <div style={{ color: 'var(--content-green)' }}><Check size={20} /></div>
                            <span>Generación de informes PDF</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                            <div style={{ color: 'var(--content-green)' }}><Check size={20} /></div>
                            <span>Soporte prioritario</span>
                        </li>
                    </ul>

                    {isPremium ? (
                        <div className="w-full py-2 px-4 rounded-lg text-center font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--content-green)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            Plan Activo
                        </div>
                    ) : (
                        <button
                            onClick={() => handleSubscribe('yearly')}
                            className="w-full py-3 px-4 rounded-lg transition-all font-medium shadow-lg hover:shadow-indigo-500/25"
                            style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                        >
                            Suscribirse Ahora
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-12 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)' }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>¿Cómo funciona la licencia?</h3>
                <p style={{ color: 'var(--text-secondary)' }}>La licencia es anual y personal. Te permite gestionar todas tus escuelas y cursos sin límites. Al finalizar el año, podrás renovar para mantener el acceso y guardar tu historial.</p>
            </div>
        </div>
    );
}
