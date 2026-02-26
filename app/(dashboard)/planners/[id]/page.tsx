"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import RichTextEditor from "@/components/RichTextEditor";
import { ArrowLeft, Save, FileDown, BookOpen, AlertCircle } from "lucide-react";
import { Course, School } from "@/types";

const TABS = [
    { id: 'fundamentacion', label: 'Fundamentación' },
    { id: 'objetivos', label: 'Objetivos' },
    { id: 'contenidos', label: 'Contenidos' },
    { id: 'estrategias', label: 'Estrategias' },
    { id: 'evaluacion', label: 'Evaluación' },
    { id: 'bibliografia', label: 'Bibliografía' },
];

export default function PlannerEditor() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { courses, schools } = useData();
    const isNew = id === 'new';

    const [title, setTitle] = useState("Nueva Planificación");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const [contentBlocks, setContentBlocks] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const { data, error } = await supabase
                    .from('lesson_plans')
                    .select('*')
                    .eq('id', id as string)
                    .single();

                if (error) throw error;
                if (data) {
                    setTitle(data.title);
                    setSelectedCourse(data.course_id);
                    setContentBlocks(data.content_blocks || {});
                    setLastSaved(new Date(data.updated_at));
                }
            } catch (error: Error | any) {
                console.error("Error loading plan:", error.message);
                alert("No se pudo cargar la planificación.");
                router.push('/planners');
            }
        };

        if (!isNew && user) {
            fetchPlan();
        }
    }, [id, user, isNew, router]);

    const handleSave = async (silent = false) => {
        if (!title.trim() || !selectedCourse) {
            if (!silent) alert("Por favor, ingresa un título y selecciona una materia.");
            return;
        }

        if (!silent) setIsSaving(true);

        try {
            const payload = {
                user_id: user?.id,
                course_id: selectedCourse,
                title: title,
                academic_year: new Date().getFullYear(),
                content_blocks: contentBlocks,
                updated_at: new Date().toISOString()
            };

            if (isNew) {
                const { data, error } = await supabase.from('lesson_plans').insert([payload]).select().single();
                if (error) throw error;
                if (data) {
                    setLastSaved(new Date());
                    router.replace(`/planners/${data.id}`);
                }
            } else {
                const { error } = await supabase.from('lesson_plans').update(payload).eq('id', id as string);
                if (error) throw error;
                setLastSaved(new Date());
            }

        } catch (error: Error | any) {
            console.error("Error saving:", error);
            if (!silent) alert("Error al guardar: " + error.message);
        } finally {
            if (!silent) setIsSaving(false);
        }
    };

    const handleContentChange = (tabId: string, html: string) => {
        setContentBlocks(prev => ({
            ...prev,
            [tabId]: html
        }));
    };

    // Identify related data for printing
    const currentCourse = courses.find((c: Course) => c.id === selectedCourse);
    const currentSchool = schools.find((s: School) => s.id === currentCourse?.school_id);

    return (
        <>
            {/* SCREEN VIEW */}
            <div className="p-6 max-w-5xl mx-auto pb-32 no-print">
                <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <button
                            onClick={() => router.push('/planners')}
                            style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}
                            className="hover:bg-[rgba(255,255,255,0.05)]"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título de la planificación..."
                            style={{
                                flex: 1,
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px dashed var(--glass-border)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                padding: '0.25rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {lastSaved && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Guardado: {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)', color: 'var(--text-primary)',
                                cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap'
                            }}
                            className="hover:bg-[rgba(255,255,255,0.1)]"
                        >
                            {isSaving ? "Guardando..." : <><Save size={18} /> Guardar</>}
                        </button>
                        <button
                            onClick={() => window.print()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                backgroundColor: 'var(--accent-primary)',
                                padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                                border: 'none', color: 'white',
                                cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap'
                            }}
                            className="hover:shadow-lg hover:shadow-indigo-500/20"
                        >
                            <FileDown size={18} /> PDF
                        </button>
                    </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="flex-1 min-w-[200px]">
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Materia Vinculada</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
                            <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
                            >
                                <option value="">-- Seleccionar Materia --</option>
                                {courses.map((c: Course) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!selectedCourse && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--content-orange)', fontSize: '0.85rem' }}>
                            <AlertCircle size={16} /> Selecciona una materia para guardar
                        </div>
                    )}
                </div>

                {/* TAB EDITOR SYSTEM */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem', overflowX: 'auto' }} className="scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                background: 'transparent',
                                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                fontWeight: activeTab === tab.id ? 600 : 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* RENDER ACTIVE TAB CONTENT */}
                {TABS.map(tab => (
                    <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none' }}>
                        <div className="mb-4">
                            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{tab.label}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Escribe o pega el contenido correspondiente al diseño curricular.</p>
                        </div>

                        <RichTextEditor
                            content={contentBlocks[tab.id] || ''}
                            onChange={(html) => handleContentChange(tab.id, html)}
                            placeholder={`Comienza a escribir la ${tab.label.toLowerCase()} aquí...`}
                        />
                    </div>
                ))}
            </div>

            {/* PRINT VIEW (Formal Document) */}
            <div className="hidden print:block bg-white text-black print-document" style={{ fontFamily: 'Georgia, serif', padding: '10mm 15mm' }}>
                {/* Cabezal Formal */}
                <div style={{ borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Planificación Anual</h1>
                    <h2 style={{ fontSize: '16pt', fontWeight: 'normal', marginBottom: '0.5rem' }}>{title || "Sin Título"}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '12pt', marginTop: '1rem' }}>
                        <p><strong>Materia:</strong> {currentCourse?.name || 'No especificada'}</p>
                        <p><strong>Establecimiento:</strong> {currentSchool?.name || 'No especificada'}</p>
                        <p><strong>Ciclo Lectivo:</strong> {new Date().getFullYear()}</p>
                    </div>
                </div>

                {/* Contenido Modular */}
                {TABS.map(tab => {
                    if (!contentBlocks[tab.id] || contentBlocks[tab.id] === '<p></p>') return null;
                    return (
                        <div key={tab.id} style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
                            <h3 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase', color: '#000' }}>
                                {tab.label}
                            </h3>
                            <div
                                className="print-richtext tiptap-editor-content"
                                style={{ fontSize: '11pt', lineHeight: '1.6', color: '#000' }}
                                dangerouslySetInnerHTML={{ __html: contentBlocks[tab.id] }}
                            />
                        </div>
                    );
                })}

                <style>{`
                @media print {
                    @page { margin: 1.5cm; size: portrait !important; }
                    body { background: white !important; -webkit-print-color-adjust: exact; color: black !important; }
                    .print-document { display: block !important; }
                    .print-richtext ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 1rem; }
                    .print-richtext ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 1rem; }
                    .print-richtext p { margin-bottom: 1rem; }
                    .print-richtext h2 { font-size: 13pt; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; }
                    .print-richtext blockquote { border-left: 3px solid #666; padding-left: 1rem; font-style: italic; color: #444; }
                }
            `}</style>
            </div>
        </>
    );
}
