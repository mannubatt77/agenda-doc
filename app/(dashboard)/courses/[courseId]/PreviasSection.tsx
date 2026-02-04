"use client";

import { useData } from "@/context/DataContext";
import { useState } from "react";
import { Plus, Trash2, CalendarRange, UserPlus } from "lucide-react";

interface PreviasSectionProps {
    courseId: string;
}

export function PreviasSection({ courseId }: PreviasSectionProps) {
    const {
        getCoursePendingStudents, addPendingStudent, deletePendingStudent,
        getCoursePendingExams, addPendingExam, deletePendingExam,
        pendingGrades, addPendingGrade
    } = useData();

    const students = getCoursePendingStudents(courseId);
    const exams = getCoursePendingExams(courseId);

    // States for Modals/Forms
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [newStudentName, setNewStudentName] = useState("");
    const [newStudentSurname, setNewStudentSurname] = useState("");
    const [newStudentYear, setNewStudentYear] = useState("");

    const [isAddExamOpen, setIsAddExamOpen] = useState(false);
    const [newExamDate, setNewExamDate] = useState("");
    const [newExamDesc, setNewExamDesc] = useState("");

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newStudentName && newStudentSurname && newStudentYear) {
            await addPendingStudent(courseId, {
                name: newStudentName,
                surname: newStudentSurname,
                original_year: newStudentYear
            });
            setNewStudentName(""); setNewStudentSurname(""); setNewStudentYear("");
            setIsAddStudentOpen(false);
        }
    };

    const handleAddExam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newExamDate && newExamDesc) {
            await addPendingExam(courseId, {
                date: newExamDate,
                description: newExamDesc
            });
            setNewExamDate(""); setNewExamDesc("");
            setIsAddExamOpen(false);
        }
    };

    const handleGradeChange = async (examId: string, studentId: string, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
            await addPendingGrade(examId, studentId, numValue);
        }
    };

    const getGradeValue = (examId: string, studentId: string) => {
        const g = pendingGrades.find(pg => pg.exam_id === examId && pg.student_id === studentId);
        return g ? g.grade : "";
    };



    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* STUDENTS SECTION */}
            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Alumnos con Previa</h3>
                    <button
                        onClick={() => setIsAddStudentOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'white' }}
                    >
                        <UserPlus size={18} /> Agregar Alumno
                    </button>
                </div>

                {isAddStudentOpen && (
                    <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)' }}>
                        <input placeholder="Apellido" value={newStudentSurname} onChange={e => setNewStudentSurname(e.target.value)} required style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                        <input placeholder="Nombre" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                        <input placeholder="Año Origen (ej. 2023)" value={newStudentYear} onChange={e => setNewStudentYear(e.target.value)} required style={{ width: '150px', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                        <button type="submit" style={{ padding: '0 1rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '4px' }}>Guardar</button>
                        <button type="button" onClick={() => setIsAddStudentOpen(false)} style={{ padding: '0 1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '4px' }}>Cancelar</button>
                    </form>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Apellido y Nombre</th>
                            <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Año Origen</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No hay alumnos cargados.</td></tr>
                        ) : (
                            students.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '0.75rem' }}>{s.surname}, {s.name}</td>
                                    <td style={{ textAlign: 'center', padding: '0.75rem' }}>{s.original_year}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => deletePendingStudent(s.id)} style={{ color: 'var(--content-red)', opacity: 0.7 }}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* EXAMS & GRADES SECTION */}
            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mesas de Examen</h3>
                    <button
                        onClick={() => setIsAddExamOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'white' }}
                    >
                        <CalendarRange size={18} /> Nueva Mesa
                    </button>
                </div>

                {isAddExamOpen && (
                    <form onSubmit={handleAddExam} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)' }}>
                        <input type="date" value={newExamDate} onChange={e => setNewExamDate(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                        <input placeholder="Descripción (ej. Mesa Julio)" value={newExamDesc} onChange={e => setNewExamDesc(e.target.value)} required style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                        <button type="submit" style={{ padding: '0 1rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '4px' }}>Guardar</button>
                        <button type="button" onClick={() => setIsAddExamOpen(false)} style={{ padding: '0 1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '4px' }}>Cancelar</button>
                    </form>
                )}

                {exams.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--glass-border)', position: 'sticky', left: 0, background: 'var(--bg-panel)', zIndex: 10 }}>Alumno</th>
                                    {exams.map(exam => (
                                        <th key={exam.id} style={{ textAlign: 'center', padding: '0.75rem', borderBottom: '2px solid var(--glass-border)', minWidth: '120px' }}>
                                            <div style={{ fontSize: '0.875rem' }}>{exam.description}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(exam.date).toLocaleDateString()}</div>
                                            <button onClick={() => { if (confirm('Eliminar esta mesa y sus notas?')) deletePendingExam(exam.id) }} style={{ marginLeft: '0.5rem', color: 'var(--content-red)', fontSize: '0.75rem', opacity: 0.5 }}>x</button>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--glass-border)', position: 'sticky', left: 0, background: 'var(--bg-panel)', fontWeight: 500 }}>
                                            {student.surname}, {student.name}
                                        </td>
                                        {exams.map(exam => (
                                            <td key={exam.id} style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    min="1" max="10" step="0.5"
                                                    defaultValue={getGradeValue(exam.id, student.id)}
                                                    onBlur={(e) => handleGradeChange(exam.id, student.id, e.target.value)}
                                                    style={{
                                                        width: '60px',
                                                        textAlign: 'center',
                                                        padding: '0.25rem',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--glass-border)',
                                                        backgroundColor: 'var(--bg-input)',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No hay mesas de examen creadas.
                    </div>
                )}
            </div>
        </div>
    );
}
