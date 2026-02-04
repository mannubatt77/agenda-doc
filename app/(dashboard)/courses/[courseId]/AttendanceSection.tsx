"use client";

import { useMemo, useState } from "react";
import { Student, AttendanceRecord } from "@/context/DataContext";
import { Check, X, Plus, Trash2, PenLine } from "lucide-react";

interface AttendanceSectionProps {
    courseId: string;
    students: Student[];
    allAttendance: AttendanceRecord[];
    markAttendance: (courseId: string, date: string, records: { studentId: string; present: boolean; justification?: string }[]) => void;
    getAttendance: (courseId: string, date: string) => AttendanceRecord[];
}

export function AttendanceSection({ courseId, students, allAttendance, markAttendance, getAttendance }: AttendanceSectionProps) {
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAddingDate, setIsAddingDate] = useState(false);

    // Edit Date State
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [newEditDateVal, setNewEditDateVal] = useState("");

    // 1. Compute Columns (Unique Dates)
    const attendanceDates = useMemo(() => {
        const dates = new Set<string>();
        allAttendance.filter(r => r.course_id === courseId).forEach(r => dates.add(r.date));
        return Array.from(dates).sort((a, b) => a.localeCompare(b));
    }, [allAttendance, courseId]);

    // Helpers
    const getRecord = (studentId: string, date: string) => {
        return allAttendance.find(r => r.course_id === courseId && r.date === date && r.student_id === studentId);
    };

    const handleAddDate = () => {
        // Initialize all students as Present for the new date
        // Check if date already exists to avoid overwriting? 
        // Logic: allow it, effectively "initializing" it.
        const records = students.map(s => ({
            studentId: s.id,
            present: true,
            justification: ""
        }));
        markAttendance(courseId, newDate, records);
        setIsAddingDate(false);
    };

    const toggleStatus = (studentId: string, date: string) => {
        const currentRec = getRecord(studentId, date);
        const isPresent = currentRec ? currentRec.present : true; // Default to present if missing record logic? 
        // Wait, if column exists, records should exist. If not, we create them?
        // Let's assume full column exists.

        // Get all current column records to preserve them
        const colRecords = getAttendance(courseId, date);
        const fullRecords = students.map(s => {
            const rec = colRecords.find(r => r.student_id === s.id);
            if (s.id === studentId) {
                return {
                    studentId: s.id,
                    present: !isPresent,
                    justification: !isPresent ? "" : (rec?.justification || "") // Clear justif if becoming Present? Optional. Let's keep it clear for consistency.
                };
            }
            return {
                studentId: s.id,
                present: rec ? rec.present : true,
                justification: rec?.justification
            };
        });

        markAttendance(courseId, date, fullRecords);
    };

    const toggleJustification = (studentId: string, date: string) => {
        const colRecords = getAttendance(courseId, date);
        const fullRecords = students.map(s => {
            const rec = colRecords.find(r => r.student_id === s.id);
            if (s.id === studentId) {
                const currentJustification = rec?.justification || "";
                return {
                    studentId: s.id,
                    present: rec ? rec.present : false,
                    justification: currentJustification ? "" : "Justificada" // Toggle logic
                };
            }
            return {
                studentId: s.id,
                present: rec ? rec.present : true,
                justification: rec?.justification
            };
        });
        markAttendance(courseId, date, fullRecords);
    };

    // Date Management
    const openEditDate = (date: string) => {
        setEditingDate(date);
        setNewEditDateVal(date);
    };

    const handleUpdateDate = () => {
        if (!editingDate || !newEditDateVal) return;
        if (editingDate === newEditDateVal) { setEditingDate(null); return; }

        // Get all records for old date
        const oldRecords = getAttendance(courseId, editingDate);

        // Save as new date
        const newRecords = oldRecords.map(r => ({ ...r, studentId: r.studentId, present: r.present, justification: r.justification })); // map is same structure
        markAttendance(courseId, newEditDateVal, newRecords);

        // Delete old date (by sending empty array? No, markAttendance expects records to *set* for that date. 
        // DataContext markAttendance replaces records for that date. It DOES NOT delete the date key if we don't call anything.
        // We actually need a delete function or pass empty to clear?
        // Looking at DataContext: 
        // setAttendance(prev => { const other = prev.filter(r => !(courseId && date)); ... })
        // So calling markAttendance(id, date, []) removes records for that date!
        markAttendance(courseId, editingDate, []);

        setEditingDate(null);
    };

    const handleDeleteDate = () => {
        if (!editingDate) return;
        if (confirm("¿Borrar toda la asistencia de esta fecha?")) {
            markAttendance(courseId, editingDate, []); // Clear records
            setEditingDate(null);
        }
    };


    return (
        <div>
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={() => setIsAddingDate(true)}
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                    <Plus size={18} /> Nueva Asistencia
                </button>
            </div>

            {isAddingDate && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)', display: 'flex', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem' }}>Fecha</label>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ display: 'block', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                    </div>
                    <button onClick={handleAddDate} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }}>Crear Columna</button>
                    <button onClick={() => setIsAddingDate(false)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '4px' }}>Cancelar</button>
                </div>
            )}

            {/* Edit Date Modal */}
            {editingDate && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)',
                        width: '400px', maxWidth: '90%'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Editar Fecha</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Fecha</label>
                            <input type="date" value={newEditDateVal} onChange={e => setNewEditDateVal(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={handleDeleteDate} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginRight: 'auto', padding: '0.75rem', color: 'var(--content-red)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={18} /> Eliminar
                            </button>
                            <button onClick={() => setEditingDate(null)} style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}>Cancelar</button>
                            <button onClick={handleUpdateDate} style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-primary)', color: 'white', fontWeight: 600 }}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* GRID TABLE */}
            <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-app)', position: 'sticky', left: 0, zIndex: 10 }}>Alumno</th>
                            {attendanceDates.map(date => (
                                <th key={date} onClick={() => openEditDate(date)} style={{ cursor: 'pointer', textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', minWidth: '60px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                                        {date.split('-').slice(1).reverse().join('/')}
                                        <PenLine size={10} style={{ opacity: 0.5 }} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-panel)', position: 'sticky', left: 0 }}>
                                    {student.surname}, {student.name}
                                </td>
                                {attendanceDates.map(date => {
                                    const rec = getRecord(student.id, date);
                                    const isPresent = rec ? rec.present : true;
                                    const isJustified = !!rec?.justification;

                                    return (
                                        <td key={date} style={{ textAlign: 'center', borderRight: '1px solid var(--glass-border)', padding: '0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '40px', gap: '0.5rem' }}>
                                                {/* Present/Absent Toggle */}
                                                <button
                                                    onClick={() => toggleStatus(student.id, date)}
                                                    style={{
                                                        color: isPresent ? 'var(--content-green)' : 'var(--content-red)',
                                                        opacity: isPresent ? 0.5 : 1
                                                    }}
                                                >
                                                    {isPresent ? <Check size={20} /> : <X size={20} />}
                                                </button>

                                                {/* Justification Checkbox (Only if absent) */}
                                                {!isPresent && (
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isJustified}
                                                            onChange={() => toggleJustification(student.id, date)}
                                                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                                                            title="Justificada"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {attendanceDates.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hay asistencias tomadas. Haz clic en "Nueva Asistencia".
                    </div>
                )}
            </div>
        </div>
    );
}
