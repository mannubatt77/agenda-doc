"use client";

import { useData } from "@/context/DataContext";
import { useState, useEffect } from "react";
import { Trash2, Printer } from "lucide-react";

export default function SeatingPage() {
    const { schools, courses, students } = useData();

    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const filteredCourses = courses.filter(c => c.school_id === selectedSchoolId);
    const courseStudents = students.filter(s => s.course_id === selectedCourseId).sort((a, b) => a.surname.localeCompare(b.surname));

    // Desks mapped by coordinates "x,y" to a Student ID
    const [seatingState, setSeatingState] = useState<Record<string, string>>({});
    const [selectedStudentToAssign, setSelectedStudentToAssign] = useState<string | null>(null);

    // Grid Dimensions
    const [columns, setColumns] = useState(6);
    const [rows, setRows] = useState(5);
    const [aisles, setAisles] = useState(1);

    // Initial load handled via select onChange.

    // Save to local storage whenever it changes
    useEffect(() => {
        if (selectedCourseId && Object.keys(seatingState).length > 0) {
            localStorage.setItem(`seating_${selectedCourseId}`, JSON.stringify(seatingState));
        } else if (selectedCourseId && Object.keys(seatingState).length === 0) {
            localStorage.removeItem(`seating_${selectedCourseId}`);
        }
    }, [seatingState, selectedCourseId]);

    const handleCellClick = (x: number, y: number) => {
        const key = `${x},${y}`;
        const existingStudentId = seatingState[key];

        if (selectedStudentToAssign) {
            // Check if the student is already seated elsewhere, if so, remove them from previous desk
            const currentDesk = Object.keys(seatingState).find(k => seatingState[k] === selectedStudentToAssign);

            const newState = { ...seatingState };
            if (currentDesk) delete newState[currentDesk];

            // If there's someone at the target desk, unseat them (or we can swap, but unseat is easier)
            newState[key] = selectedStudentToAssign;

            setSeatingState(newState);
            setSelectedStudentToAssign(null); // deselect
        } else {
            // If we click an occupied cell without having a student selected, we can unseat them
            if (existingStudentId) {
                const newState = { ...seatingState };
                delete newState[key];
                setSeatingState(newState);
            }
        }
    };

    const handleClearAll = () => {
        if (confirm("¿Estás seguro de que quieres borrar todo el plano de este curso?")) {
            setSeatingState({});
        }
    };

    // Calculate unassigned students
    const assignedIds = Object.values(seatingState);
    const unassignedStudents = courseStudents.filter(s => !assignedIds.includes(s.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="selection-header no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Plano del Aula</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Organice visualmente a los alumnos arrastrándolos a sus pupitres.</p>
                    </div>
                    {selectedCourseId && (
                        <button
                            onClick={() => window.print()}
                            className="no-print"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                        >
                            <Printer size={18} /> Imprimir Mapa
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                    <select
                        value={selectedSchoolId}
                        onChange={(e) => { setSelectedSchoolId(e.target.value); setSelectedCourseId(""); setSeatingState({}); }}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px' }}
                    >
                        <option value="">Seleccione Establecimiento</option>
                        {schools.map(sh => (
                            <option key={sh.id} value={sh.id}>{sh.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCourseId}
                        onChange={(e) => {
                            const newCourseId = e.target.value;
                            setSelectedCourseId(newCourseId);
                            if (newCourseId) {
                                const saved = localStorage.getItem(`seating_${newCourseId}`);
                                setSeatingState(saved ? JSON.parse(saved) : {});
                            } else {
                                setSeatingState({});
                            }
                        }}
                        disabled={!selectedSchoolId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px', opacity: !selectedSchoolId ? 0.5 : 1 }}
                    >
                        <option value="">Seleccione Materia</option>
                        {filteredCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.year}° {c.division}°)</option>
                        ))}
                    </select>

                    {selectedCourseId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Columnas:</label>
                            <input
                                type="number"
                                min="2" max="15"
                                value={columns}
                                onChange={(e) => setColumns(Number(e.target.value) || 6)}
                                style={{ width: '60px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', textAlign: 'center' }}
                            />
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>Filas:</label>
                            <input
                                type="number"
                                min="2" max="15"
                                value={rows}
                                onChange={(e) => setRows(Number(e.target.value) || 5)}
                                style={{ width: '60px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', textAlign: 'center' }}
                            />
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>Pasillos:</label>
                            <input
                                type="number"
                                min="0" max="5"
                                value={aisles}
                                onChange={(e) => setAisles(Number(e.target.value) || 0)}
                                style={{ width: '60px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', textAlign: 'center' }}
                            />
                            <button
                                onClick={handleClearAll}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', marginLeft: '1rem' }}
                            >
                                <Trash2 size={16} /> Vaciar Aula
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {selectedCourseId && (
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                    {/* Unassigned Students Sidebar */}
                    <div className="no-print" style={{ width: '280px', backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Alumnos Sin Asignar ({unassignedStudents.length})</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Haga clic en un alumno y luego en un asiento vacío para ubicarlo.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {unassignedStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudentToAssign(selectedStudentToAssign === student.id ? null : student.id)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: selectedStudentToAssign === student.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                        backgroundColor: selectedStudentToAssign === student.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-app)',
                                        color: 'white',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: 500
                                    }}
                                >
                                    {student.surname}, {student.name}
                                </button>
                            ))}
                            {unassignedStudents.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                    Todos los alumnos han sido ubicados.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Classroom Grid */}
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', minWidth: '500px', overflowX: 'auto' }}>

                        {/* Pizarra representation */}
                        <div style={{ width: '60%', height: '40px', backgroundColor: '#334155', border: '2px solid #1e293b', borderRadius: '8px', margin: '0 auto 3rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '2px' }} className="print-pizarra print-exact">
                            PIZARRA
                        </div>

                        {/* The Grid (Desks) */}
                        <div className="print-exact" style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${columns}, 1fr)`,
                            gap: '1rem',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            {Array.from({ length: rows }).map((_, y) => (
                                Array.from({ length: columns }).map((_, x) => {
                                    const key = `${x},${y}`;
                                    const studentId = seatingState[key];
                                    const student = studentId ? courseStudents.find(s => s.id === studentId) : null;

                                    // Dynamic Aisle Logic
                                    const groupSize = Math.max(1, Math.floor(columns / (aisles + 1)));
                                    const isAisleRight = aisles > 0 && (x + 1) % groupSize === 0 && (x + 1) < columns;

                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleCellClick(x, y)}
                                            style={{
                                                aspectRatio: '5/4',
                                                border: student ? '2px solid var(--accent-primary)' : '2px dashed var(--glass-border)',
                                                borderRadius: '8px',
                                                backgroundColor: student ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                textAlign: 'center',
                                                marginRight: isAisleRight ? '2rem' : '0', // Central Aisle
                                                transition: 'all 0.2s',
                                                boxShadow: student ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedStudentToAssign && !student) {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                                    e.currentTarget.style.borderColor = 'var(--text-secondary)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!student) {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                                }
                                            }}
                                        >
                                            {student ? (
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', lineHeight: '1.2' }}>
                                                    {student.surname}, {student.name.charAt(0)}.
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--glass-border)', fontSize: '1.5rem', display: selectedStudentToAssign ? 'block' : 'none' }}>+</span>
                                            )}
                                        </div>
                                    );
                                })
                            ))}
                        </div>

                        <div className="no-print" style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Para desasignar un pupitre, simplemente haga clic en él.
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

