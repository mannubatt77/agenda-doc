"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Plus, Search, Calendar, BookOpen, Trash2, Edit2 } from "lucide-react";
import { LessonPlan } from "@/types";

export default function PlannersPage() {
    const { user } = useAuth();
    const { courses } = useData();
    const router = useRouter();
    const [planners, setPlanners] = useState<LessonPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (user) {
            fetchPlanners();
        }
    }, [user]);

    const fetchPlanners = async () => {
        setIsLoading(true);
        try {
            // Include 'courses(name)' to display the course name easily
            const { data, error } = await supabase
                .from('lesson_plans')
                .select('*, courses(name)')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setPlanners(data as LessonPlan[]);
        } catch (error: any) {
            console.error("Error fetching lesson plans:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("¿Estás seguro que deseas eliminar esta planificación permanentemente?")) {
            try {
                const { error } = await supabase.from('lesson_plans').delete().eq('id', id);
                if (error) throw error;
                setPlanners(prev => prev.filter(p => p.id !== id));
            } catch (error: any) {
                alert("Error al eliminar: " + error.message);
            }
        }
    };

    const handleCreateNew = () => {
        router.push('/planners/new');
    };

    const filteredPlanners = planners.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.courses as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Mis Planificaciones</h1>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Diseña, gestiona y exporta tus planificaciones curriculares.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    className="hover:scale-105 transition-transform"
                >
                    <Plus size={20} />
                    Crear Planificación
                </button>
            </div>

            <div className="mb-6 flex gap-4">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--glass-border)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    flex: 1,
                    maxWidth: '400px'
                }}>
                    <Search size={20} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por título o materia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            width: '100%',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <p style={{ color: 'var(--text-muted)' }}>Cargando planificaciones...</p>
                </div>
            ) : filteredPlanners.length === 0 ? (
                <div style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px dashed var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sin planificaciones</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '1.5rem' }}>No tienes ninguna planificación estructurada creada para este ciclo. Usa el botón de arriba para arrancar la cursada con todo organizado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlanners.map((planner) => (
                        <div
                            key={planner.id}
                            onClick={() => router.push(`/planners/${planner.id}`)}
                            style={{
                                backgroundColor: 'var(--bg-panel)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            className="hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent-primary)] group"
                        >
                            <h3 className="font-bold text-lg mb-2 truncate" style={{ color: 'var(--text-primary)' }}>{planner.title}</h3>

                            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <BookOpen size={16} />
                                <span className="truncate">{(planner.courses as any)?.name || 'Materia no conectada'}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <Calendar size={16} />
                                <span>Ciclo {planner.academic_year}</span>
                            </div>

                            <div className="mt-auto pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--glass-border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Editado: {new Date(planner.updated_at).toLocaleDateString()}
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); router.push(`/planners/${planner.id}`); }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                        className="hover:text-[var(--accent-primary)]"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, planner.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                        className="hover:text-red-500"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
