"use client";

import { useData, School } from "@/context/DataContext";
import { useState } from "react";
import { Plus, ArrowRight, Trash2, CalendarRange, Edit } from "lucide-react";
import Link from "next/link";

export default function SchoolsPage() {
    const { schools, addSchool, updateSchool, deleteSchool, getSchoolCourses } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);

    // Form State (Shared for Add and Edit)
    const [name, setName] = useState("");
    const [t1Start, setT1Start] = useState("");
    const [t1End, setT1End] = useState("");
    const [t2Start, setT2Start] = useState("");
    const [t2End, setT2End] = useState("");
    const [t3Start, setT3Start] = useState("");
    const [t3End, setT3End] = useState("");
    const [termStructure, setTermStructure] = useState<'bi' | 'tri'>('bi');

    const resetForm = () => {
        setName("");
        setT1Start(""); setT1End(""); setT2Start(""); setT2End("");
        setT3Start(""); setT3End("");
        setTermStructure('bi');
        setIsAdding(false);
        setEditingSchool(null);
    };

    const startAdd = () => {
        resetForm();
        // Enforce global structure if a school already exists
        if (schools.length > 0 && schools[0].term_structure) {
            setTermStructure(schools[0].term_structure as 'bi' | 'tri');
        }
        setIsAdding(true);
    };

    const startEdit = (school: School) => {
        setName(school.name);
        setT1Start(school.term1_start || "");
        setT1End(school.term1_end || "");
        setT2Start(school.term2_start || "");
        setT2End(school.term2_end || "");
        setT3Start(school.term3_start || "");
        setT3End(school.term3_end || "");
        setTermStructure(school.term_structure || 'bi');
        setEditingSchool(school);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            const datesValid = (termStructure === 'bi')
                ? (t1Start && t1End && t2Start && t2End)
                : (t1Start && t1End && t2Start && t2End && t3Start && t3End);

            if (editingSchool) {
                updateSchool(editingSchool.id, {
                    name: name.trim(),
                    term1_start: t1Start, term1_end: t1End,
                    term2_start: t2Start, term2_end: t2End,
                    term3_start: t3Start, term3_end: t3End,
                    term_structure: termStructure
                });
            } else {
                addSchool(
                    name.trim(),
                    datesValid ? { t1s: t1Start, t1e: t1End, t2s: t2Start, t2e: t2End, t3s: t3Start, t3e: t3End } : undefined,
                    termStructure
                );
            }
            resetForm();
        }
    };

    const showModal = isAdding || editingSchool;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Mis Escuelas</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gestiona tus instituciones y añade nuevas.</p>
                </div>
                <button
                    onClick={startAdd}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        fontWeight: 600
                    }}
                >
                    <Plus size={20} /> Nueva Escuela
                </button>
            </header>

            {showModal && (
                <div style={{
                    marginBottom: '2rem',
                    backgroundColor: 'var(--bg-panel)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--accent-primary)'
                }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>{editingSchool ? 'Editar Escuela' : 'Agregar Nueva Escuela'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Name */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Nombre de la Escuela</label>
                            <input
                                autoFocus
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej. Escuela Normal N°1"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-input)',
                                    border: 'none',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Term Structure */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Régimen</label>
                            <select
                                value={termStructure}
                                onChange={(e) => setTermStructure(e.target.value as 'bi' | 'tri')}
                                disabled={schools.length > 0 && (!editingSchool || schools.length > 1)}
                                title={schools.length > 0 ? "Todas las escuelas deben tener el mismo régimen." : ""}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-input)', border: 'none', color: schools.length > 0 && (!editingSchool || schools.length > 1) ? 'var(--text-muted)' : 'white',
                                    cursor: schools.length > 0 && (!editingSchool || schools.length > 1) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <option value="bi">Cuatrimestral (2 Períodos)</option>
                                <option value="tri">Trimestral (3 Períodos)</option>
                            </select>
                        </div>

                        {/* Dates Grid: Fixed 2 columns to ensure T3 and Buttons sit on the second row for 'tri' */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>1° {termStructure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inicio</label>
                                        <input required type="date" value={t1Start} onChange={e => setT1Start(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fin</label>
                                        <input required type="date" value={t1End} onChange={e => setT1End(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>2° {termStructure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inicio</label>
                                        <input required type="date" value={t2Start} onChange={e => setT2Start(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fin</label>
                                        <input required type="date" value={t2End} onChange={e => setT2End(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                    </div>
                                </div>
                            </div>

                            {termStructure === 'tri' && (
                                <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>3° Trimestre</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inicio</label>
                                            <input required type="date" value={t3Start} onChange={e => setT3Start(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fin</label>
                                            <input required type="date" value={t3End} onChange={e => setT3End(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Buttons: In 'tri' mode, they sit in the 4th slot (bottom right). In 'bi' mode, they span full width (or just sit nicely) */}
                            <div style={{
                                display: 'flex', gap: '0.5rem', alignItems: 'end', justifyContent: 'flex-start', minHeight: '82px',
                                gridColumn: termStructure === 'bi' ? 'span 2' : 'auto'
                            }}>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: 'var(--accent-primary)',
                                        color: 'white',
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                >
                                    {editingSchool ? 'Guardar Cambios' : 'Guardar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: 'transparent',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 500,
                                        border: '1px solid var(--glass-border)',
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {schools.map(school => {
                    const courseCount = getSchoolCourses(school.id).length;
                    return (
                        <div key={school.id} style={{
                            backgroundColor: 'var(--bg-panel)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--glass-border)',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: 1.2 }}>{school.name}</h2>
                                    {school.term1_start && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <CalendarRange size={12} /> Calendario Configurado
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: 'var(--bg-app)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--accent-primary)'
                                }}>
                                    {school.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {courseCount} {courseCount === 1 ? 'Materia' : 'Materias'}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                <Link
                                    href={`/school-details?id=${school.id}`}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--accent-primary)',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Ver Materias <ArrowRight size={16} />
                                </Link>
                                <button
                                    onClick={() => startEdit(school)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-secondary)',
                                        opacity: 0.8
                                    }}
                                    title="Editar Escuela"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => { if (confirm('¿Eliminar esta escuela y sus cursos?')) deleteSchool(school.id) }}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: 'transparent',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--content-red)',
                                        opacity: 0.7
                                    }}
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {schools.length === 0 && !showModal && (
                    <div style={{
                        gridColumn: '1/-1',
                        textAlign: 'center',
                        padding: '4rem',
                        color: 'var(--text-muted)',
                        border: '2px dashed var(--glass-border)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        No tienes escuelas registradas. ¡Crea una para comenzar!
                    </div>
                )}
            </div>
        </div>
    );
}
