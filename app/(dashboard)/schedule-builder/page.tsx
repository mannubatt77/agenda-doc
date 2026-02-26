"use client";

import { useData } from "@/context/DataContext";
import { useState, useEffect } from "react";
import { Printer, Trash2, Clock, CheckCircle } from "lucide-react";

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ROW_COUNT = 15;

export default function ScheduleBuilderPage() {
    const { courses, schools } = useData();

    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [isEraser, setIsEraser] = useState(false);

    // Map "colIndex,rowIndex" to course_id
    const [grid, setGrid] = useState<Record<string, string>>({});
    // Array of string labels for each of the 15 rows (e.g. "07:30 - 08:30")
    const [rowLabels, setRowLabels] = useState<string[]>(Array(ROW_COUNT).fill(""));

    // Load from local storage
    useEffect(() => {
        const savedGrid = localStorage.getItem('teacher_schedule_grid');
        const savedLabels = localStorage.getItem('teacher_schedule_labels');
        if (savedGrid) {
            try { setGrid(JSON.parse(savedGrid)); } catch (e) { console.error(e); }
        }
        if (savedLabels) {
            try { setRowLabels(JSON.parse(savedLabels)); } catch (e) { console.error(e); }
        }
    }, []);

    // Auto-save mechanisms
    useEffect(() => {
        if (Object.keys(grid).length > 0) {
            localStorage.setItem('teacher_schedule_grid', JSON.stringify(grid));
        } else {
            localStorage.removeItem('teacher_schedule_grid');
        }
    }, [grid]);

    useEffect(() => {
        const hasContent = rowLabels.some(label => label.trim() !== "");
        if (hasContent) {
            localStorage.setItem('teacher_schedule_labels', JSON.stringify(rowLabels));
        } else {
            localStorage.removeItem('teacher_schedule_labels');
        }
    }, [rowLabels]);

    const handleRowLabelChange = (index: number, val: string) => {
        const newLabels = [...rowLabels];
        newLabels[index] = val;
        setRowLabels(newLabels);
    };

    const handleCellClick = (colIndex: number, rowIndex: number) => {
        const key = `${colIndex},${rowIndex}`;

        if (isEraser) {
            const newGrid = { ...grid };
            delete newGrid[key];
            setGrid(newGrid);
        } else if (selectedCourseId) {
            setGrid(prev => ({ ...prev, [key]: selectedCourseId }));
        } else {
            // If nothing is selected, click acts as an eraser
            if (grid[key]) {
                const newGrid = { ...grid };
                delete newGrid[key];
                setGrid(newGrid);
            }
        }
    };

    const handleClearAll = () => {
        if (confirm("¿Estás seguro de que deseas limpiar toda la declaración jurada y vaciar los horarios?")) {
            setGrid({});
            setRowLabels(Array(ROW_COUNT).fill(""));
        }
    };

    // Prepare courses with their matching school for the UI sidebar
    const availableCourses = courses.map(course => {
        const school = schools.find(s => s.id === course.school_id);
        return {
            ...course,
            schoolName: school?.name || 'Escuela Desconocida'
        };
    }).sort((a, b) => a.schoolName.localeCompare(b.schoolName));

    // A small color generating function for courses based on their ID character codes
    const getCourseColor = (courseId: string) => {
        if (!courseId) return 'var(--bg-input)';
        let hash = 0;
        for (let i = 0; i < courseId.length; i++) {
            hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        // In print mode we will forcefully rewrite these, but for UI they remain colorful
        return `hsl(${h}, 60%, 25%)`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="selection-header no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Declaración Jurada de Días y Horarios</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Organice su horario general abarcando todas sus escuelas matriculadas.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleClearAll}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            <Trash2 size={18} /> Limpiar Todo
                        </button>
                        <button
                            onClick={() => window.print()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                        >
                            <Printer size={18} /> Imprimir Horario
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                {/* TOOLBOX SIDEBAR (Only visible on screen) */}
                <div className="no-print" style={{ width: '280px', backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Cursos Disponibles</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Seleccione una materia y luego haga clic en la grilla para pintarla. Use la goma para borrar.</p>

                    <button
                        onClick={() => { setIsEraser(true); setSelectedCourseId(null); }}
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: isEraser ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                            backgroundColor: isEraser ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-app)',
                            color: isEraser ? '#ef4444' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <Trash2 size={16} /> Goma de Borrar
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem', marginTop: '0.5rem' }}>
                        {availableCourses.map(course => {
                            const isSelected = selectedCourseId === course.id && !isEraser;
                            const courseColor = getCourseColor(course.id);

                            return (
                                <button
                                    key={course.id}
                                    onClick={() => { setSelectedCourseId(course.id); setIsEraser(false); }}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: isSelected ? '2px solid white' : `1px solid ${courseColor}`,
                                        backgroundColor: isSelected ? courseColor : 'var(--bg-app)',
                                        color: 'white',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column', gap: '0.25rem'
                                    }}
                                >
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{course.name} ({course.year} {course.division})</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{course.schoolName}</span>
                                    {isSelected && <CheckCircle size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                                </button>
                            );
                        })}
                        {availableCourses.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                No has cargado ninguna materia en tus escuelas aún.
                            </div>
                        )}
                    </div>
                </div>

                {/* THE GRID (Visible on Screen + Print Layout) */}
                <div style={{ flex: 1, overflowX: 'auto', paddingBottom: '2rem' }}>
                    <div className="print-document" style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', minWidth: '800px' }}>

                        <div className="hidden print:block" style={{ borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <h1 style={{ fontSize: '20pt', fontWeight: 'bold', textTransform: 'uppercase' }}>Declaración Jurada de Cargos y Módulos</h1>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '12pt', marginTop: '1rem' }}>
                                <p><strong>Ciclo Lectivo:</strong> {new Date().getFullYear()}</p>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }} className="print-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '120px', padding: '1rem 0.5rem', border: '1px solid var(--glass-border)', textAlign: 'center', backgroundColor: 'var(--bg-input)' }} className="print-header-cell">Horario</th>
                                    {DAYS.map(day => (
                                        <th key={day} style={{ padding: '1rem 0.5rem', border: '1px solid var(--glass-border)', textAlign: 'center', fontWeight: 'bold', backgroundColor: 'var(--bg-input)' }} className="print-header-cell">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td style={{ border: '1px solid var(--glass-border)', padding: '0', height: '60px' }} className="print-cell">
                                            {/* We use an input for flexibility in UI but display plain text in print */}
                                            <input
                                                className="no-print"
                                                type="text"
                                                value={rowLabels[rowIndex]}
                                                onChange={(e) => handleRowLabelChange(rowIndex, e.target.value)}
                                                placeholder="Ej: 07:30 a 08:30"
                                                style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--text-secondary)', padding: '0.5rem', outline: 'none', fontSize: '0.85rem' }}
                                            />
                                            <div className="hidden print:block" style={{ textAlign: 'center', fontSize: '10pt', padding: '0.5rem' }}>
                                                {rowLabels[rowIndex]}
                                            </div>
                                        </td>

                                        {DAYS.map((_, colIndex) => {
                                            const key = `${colIndex},${rowIndex}`;
                                            const assignedCourseId = grid[key];
                                            const assignedCourse = assignedCourseId ? availableCourses.find(c => c.id === assignedCourseId) : null;
                                            const cellColor = getCourseColor(assignedCourseId || "");

                                            return (
                                                <td
                                                    key={colIndex}
                                                    onClick={() => handleCellClick(colIndex, rowIndex)}
                                                    style={{
                                                        border: '1px solid var(--glass-border)',
                                                        padding: '0',
                                                        cursor: 'pointer',
                                                        backgroundColor: assignedCourse ? cellColor : 'transparent',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    className="print-cell print-bg-white"
                                                    onMouseEnter={(e) => {
                                                        if (!assignedCourse) {
                                                            e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!assignedCourse) {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }
                                                    }}
                                                >
                                                    {assignedCourse && (
                                                        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0.25rem', textAlign: 'center' }}>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white', lineHeight: '1.1' }} className="print-text-black">
                                                                {assignedCourse.name}
                                                            </div>
                                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }} className="print-text-black print-text-small">
                                                                {assignedCourse.schoolName} ({assignedCourse.year} {assignedCourse.division})
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; size: landscape; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
                    
                    /* Hide everything except document */
                    .no-print { display: none !important; }
                    .print-document { 
                        display: block !important; 
                        padding: 0 !important; 
                        border: none !important; 
                        margin: 0 !important; 
                        width: 100% !important;
                    }
                    
                    .print-table { border-collapse: collapse !important; width: 100% !important; }
                    .print-cell, .print-header-cell { 
                        border: 1px solid black !important; 
                        color: black !important; 
                    }
                    .print-bg-white { background-color: white !important; }
                    .print-text-black { color: black !important; font-weight: bold; }
                    .print-text-small { font-size: 8pt !important; font-weight: normal; margin-top: 2px; }
                }
            `}</style>
        </div>
    );
}
