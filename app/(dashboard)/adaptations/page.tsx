"use client";

import { useData } from "@/context/DataContext";
import { useState, useEffect } from "react";
import { HeartPulse, CheckCircle, Save, Loader2, AlertCircle, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const COMMON_DIAGNOSES = [
    "TDAH (Trastorno por Déficit de Atención)",
    "TEA (Trastorno del Espectro Autista)",
    "Dislexia",
    "Disgrafía",
    "Discalculia",
    "TEL (Trastorno Específico del Lenguaje)",
    "Discapacidad Visual",
    "Discapacidad Auditiva",
    "Discapacidad Intelectual Leve",
    "Altas Capacidades"
];

const COMMON_ADAPTATIONS = [
    "Tiempo extra en evaluaciones parciales y finales.",
    "Exámenes orales en lugar de escritos.",
    "Evaluación segmentada o fraccionada en módulos.",
    "Ubicación preferencial en primera fila.",
    "Ubicación lejos de ventanas o estímulos distractores.",
    "Material en letra macrotipo (Agrandada).",
    "Uso de material concreto de apoyo (calculadora, tablas).",
    "Reducción de opciones en formato múltiple choice.",
    "Apoyo visual constante para consignas complejas.",
    "Permitir pausas activas o salidas breves del aula."
];

export default function AdaptationsPage() {
    const { schools, courses, students } = useData();

    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");

    const [diagnosis, setDiagnosis] = useState("");
    const [adaptationsText, setAdaptationsText] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [allAdaptations, setAllAdaptations] = useState<any[]>([]);

    const filteredCourses = courses.filter(c => c.school_id === selectedSchoolId);
    const courseStudents = students.filter(s => s.course_id === selectedCourseId);
    const activeStudent = students.find(s => s.id === selectedStudentId);

    // Fetch existing adaptations when a student is selected
    useEffect(() => {
        if (!selectedStudentId) {
            setDiagnosis("");
            setAdaptationsText("");
            return;
        }

        const fetchAdaptations = async () => {
            setIsLoadingData(true);
            try {
                const { data, error } = await supabase
                    .from('student_adaptations')
                    .select('diagnosis, adaptations')
                    .eq('student_id', selectedStudentId)
                    .maybeSingle();

                if (error) throw error;
                if (data) {
                    setDiagnosis(data.diagnosis || "");
                    setAdaptationsText(data.adaptations || "");
                } else {
                    setDiagnosis("");
                    setAdaptationsText("");
                }
            } catch (error) {
                console.error("Error fetching adaptations:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAdaptations();
    }, [selectedStudentId]);

    const fetchAllAdaptations = async () => {
        try {
            const { data, error } = await supabase
                .from('student_adaptations')
                .select('student_id, diagnosis, adaptations');
            if (data && !error) {
                setAllAdaptations(data);
            }
        } catch (e) {
            console.error("Error fetching all adaptations:", e);
        }
    };

    useEffect(() => {
        fetchAllAdaptations();
    }, []);

    const handleSave = async () => {
        if (!selectedStudentId) return;
        setIsSaving(true);
        setSaveStatus("idle");

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("No user found");

            const { error } = await supabase
                .from('student_adaptations')
                .upsert({
                    user_id: userData.user.id,
                    student_id: selectedStudentId,
                    diagnosis: diagnosis,
                    adaptations: adaptationsText,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, student_id' });

            if (error) throw error;
            setSaveStatus("success");
            fetchAllAdaptations();
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (error) {
            console.error("Error saving adaptations:", error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleDiagnosis = (dText: string) => {
        const shortD = dText.split(' (')[0];
        if (diagnosis.includes(shortD)) {
            // Remove it, cleaning up possible double commas
            const newDiag = diagnosis.replace(shortD, "").split(',').map(s => s.trim()).filter(Boolean).join(', ');
            setDiagnosis(newDiag);
        } else {
            // Add it
            setDiagnosis(prev => prev ? prev + ", " + shortD : shortD);
        }
    };

    const toggleAdaptation = (text: string) => {
        if (adaptationsText.includes(text)) {
            setAdaptationsText(adaptationsText.replace(text + "\n", "").replace(text, "").trim());
        } else {
            setAdaptationsText(prev => prev ? prev + "\n" + text : text);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div className="selection-header" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <HeartPulse style={{ color: '#ec4899' }} size={28} />
                            Alumnos con Adaptaciones
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Registre y consulte diagnósticos y pautas de adaptación curricular para sus estudiantes.
                        </p>
                    </div>
                </div>

                {/* Selectors */}
                <div className="print-hide" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                    <select
                        value={selectedSchoolId}
                        onChange={(e) => { setSelectedSchoolId(e.target.value); setSelectedCourseId(""); setSelectedStudentId(""); }}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px', flex: 1 }}
                    >
                        <option value="">1. Escuela</option>
                        {schools.map(sh => <option key={sh.id} value={sh.id}>{sh.name}</option>)}
                    </select>

                    <select
                        value={selectedCourseId}
                        onChange={(e) => { setSelectedCourseId(e.target.value); setSelectedStudentId(""); }}
                        disabled={!selectedSchoolId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px', opacity: !selectedSchoolId ? 0.5 : 1, flex: 1 }}
                    >
                        <option value="">2. Curso</option>
                        {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.year}° {c.division}°)</option>)}
                    </select>

                    <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        disabled={!selectedCourseId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px', opacity: !selectedCourseId ? 0.5 : 1, flex: 1 }}
                    >
                        <option value="">3. Alumno</option>
                        {courseStudents.map(s => <option key={s.id} value={s.id}>{s.surname}, {s.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {activeStudent ? (
                isLoadingData ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin relative mx-auto mb-2" size={32} />
                        Cargando ficha psicopedagógica...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>

                        {/* Editor Form */}
                        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                                    Ficha de Adaptación Curricular
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {activeStudent.surname}, {activeStudent.name}
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Diagnóstico Principal</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Trastorno del Espectro Autista..."
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white' }}
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {COMMON_DIAGNOSES.map(d => {
                                        const shortD = d.split(' (')[0];
                                        const isSelected = diagnosis.includes(shortD);
                                        return (
                                            <button
                                                key={d}
                                                onClick={() => toggleDiagnosis(d)}
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)', color: isSelected ? '#ec4899' : 'var(--text-muted)', border: `1px solid ${isSelected ? '#ec4899' : 'var(--glass-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                {shortD}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Detalle de Adaptaciones y Pautas</label>
                                <textarea
                                    rows={6}
                                    placeholder="Detalle aquí las modificaciones metodológicas, de tiempo, de acceso o de evaluación..."
                                    value={adaptationsText}
                                    onChange={(e) => setAdaptationsText(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', color: 'white', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                {saveStatus === 'success' && <span style={{ color: '#22c55e', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={16} /> Guardado</span>}
                                {saveStatus === 'error' && <span style={{ color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={16} /> Error al guardar</span>}

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || (!diagnosis && !adaptationsText)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Guardar Ficha
                                </button>
                            </div>
                        </div>

                        {/* Suggestions Panel */}
                        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sugerencias de Adaptaciones</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Haga click en las pautas para agregarlas o quitarlas rápidamente de la ficha del alumno.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {COMMON_ADAPTATIONS.map((ad, i) => {
                                    const isSelected = adaptationsText.includes(ad);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => toggleAdaptation(ad)}
                                            style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: isSelected ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isSelected ? 'rgba(236, 72, 153, 0.3)' : 'var(--glass-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ marginTop: '0.125rem' }}>
                                                {isSelected ? <CheckCircle size={16} color="#ec4899" /> : <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--text-muted)' }} />}
                                            </div>
                                            <span style={{ fontSize: '0.875rem', color: isSelected ? 'white' : 'var(--text-muted)' }}>{ad}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)' }}>
                    <HeartPulse size={48} style={{ color: 'var(--glass-border)', margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'white', marginBottom: '0.5rem' }}>Seleccione un estudiante</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                        Elija una escuela, un curso y un alumno de los menús superiores para cargar o visualizar sus adaptaciones curriculares.
                    </p>
                </div>
            )}

            {/* List of active adaptations for current course */}
            {selectedCourseId && allAdaptations.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        Fichas cargadas en este curso
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {courseStudents.filter(s => allAdaptations.some(a => a.student_id === s.id)).map(student => {
                            const adaptation = allAdaptations.find(a => a.student_id === student.id);
                            return (
                                <div key={student.id} style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'white' }}>{student.surname}, {student.name}</h4>
                                            <p style={{ fontSize: '0.875rem', color: '#ec4899', fontWeight: 500 }}>{adaptation?.diagnosis || 'Sin diagnóstico'}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedStudentId(student.id)}
                                            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Ver / Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {adaptation?.adaptations || 'Sin especificaciones detalladas.'}
                                    </p>
                                </div>
                            );
                        })}
                        {courseStudents.filter(s => allAdaptations.some(a => a.student_id === s.id)).length === 0 && (
                            <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
                                No hay alumnos con adaptaciones en este curso.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
