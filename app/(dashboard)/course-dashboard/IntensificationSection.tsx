"use client";

import { useData } from "@/context/DataContext";
import { useState, useMemo } from "react";
import { Plus, Trash2, CalendarRange, ChevronDown, ChevronRight } from "lucide-react";

interface IntensificationSectionProps {
    courseId: string;
}

export function IntensificationSection({ courseId }: IntensificationSectionProps) {
    const {
        grades, students,
        intensificationInstances, getIntensificationInstances, addIntensificationInstance, deleteIntensificationInstance,
        intensificationResults, addIntensificationResult
    } = useData();

    // 1. Find columns that are EXAMS and have at least one failed student (< 6)
    const courseGrades = grades.filter(g => g.course_id === courseId && g.type === 'exam');
    const courseStudents = students.filter(s => s.course_id === courseId);

    // Group unique exams
    const exams = useMemo(() => {
        const uniqueExams = new Map<string, { period: number, date: string, description: string, failedCount: number }>();

        courseGrades.forEach(g => {
            const key = `${g.period}|${g.date}|${g.description}`;
            if (!uniqueExams.has(key)) {
                // Check failed count
                const failed = courseGrades.filter(cg =>
                    cg.period === g.period &&
                    cg.date === g.date &&
                    cg.description === g.description &&
                    cg.value !== null && cg.value < 7
                ).length;

                if (failed > 0) {
                    uniqueExams.set(key, {
                        period: g.period,
                        date: g.date,
                        description: g.description,
                        failedCount: failed
                    });
                }
            }
        });

        // Convert to array and sort
        return Array.from(uniqueExams.values()).sort((a, b) => {
            if (a.period !== b.period) return a.period - b.period;
            return a.date.localeCompare(b.date);
        });
    }, [courseGrades]);

    // Render logic per Exam Block
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Intensificación</h2>

            {exams.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)' }}>
                    No hay evaluaciones con alumnos desaprobados.
                </div>
            ) : (
                exams.map((exam, idx) => (
                    <ExamIntensificationBlock
                        key={`${exam.period}-${exam.date}-${exam.description}`}
                        exam={exam}
                        courseId={courseId}
                        allStudents={courseStudents}
                        allGrades={courseGrades}
                    />
                ))
            )}
        </div>
    );
}

function ExamIntensificationBlock({ exam, courseId, allStudents, allGrades }: {
    exam: { period: number, date: string, description: string },
    courseId: string,
    allStudents: any[],
    allGrades: any[]
}) {
    const {
        intensificationInstances, addIntensificationInstance, deleteIntensificationInstance,
        intensificationResults, addIntensificationResult
    } = useData();

    // Get instances for THIS exam
    const instances = intensificationInstances
        .filter(i =>
            i.course_id === courseId &&
            i.original_period === exam.period &&
            i.original_date === exam.date &&
            i.original_description === exam.description
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get FAILED students for this exam
    const failedStudents = allStudents.filter(s => {
        const g = allGrades.find(gr =>
            gr.student_id === s.id &&
            gr.period === exam.period &&
            gr.date === exam.date &&
            gr.description === exam.description
        );
        return g && g.value !== null && g.value < 7;
    }).sort((a, b) => a.surname.localeCompare(b.surname));

    const [isAddInstanceOpen, setIsAddInstanceOpen] = useState(false);
    const [newInstanceDate, setNewInstanceDate] = useState("");
    const [newInstanceTitle, setNewInstanceTitle] = useState("");

    const handleAddInstance = async () => {
        if (!newInstanceDate || !newInstanceTitle.trim()) return;
        await addIntensificationInstance(courseId, {
            original_period: exam.period,
            original_date: exam.date,
            original_description: exam.description,
            date: newInstanceDate,
            title: newInstanceTitle.trim()
        });
        setNewInstanceDate("");
        setNewInstanceTitle("");
        setIsAddInstanceOpen(false);
    };

    const isStudentApprovedAlready = (studentId: string, currentInstanceIdx: number) => {
        // Check if student approved in any PREVIOUS instance
        // Or if they approved the original exam? No, we filtered for failed.

        for (let i = 0; i < currentInstanceIdx; i++) {
            const inst = instances[i];
            const res = intensificationResults.find(r => r.instance_id === inst.id && r.student_id === studentId);
            if (res && res.is_approved) return true;
        }
        return false;
    };

    const getResult = (instanceId: string, studentId: string) => {
        return intensificationResults.find(r => r.instance_id === instanceId && r.student_id === studentId);
    };

    const handleResultChange = async (instanceId: string, studentId: string, val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) {
            // Check if empty -> maybe delete? or ignore
            return;
        }
        const approved = num >= 6;
        await addIntensificationResult(instanceId, studentId, num, approved);
    };

    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {exam.description} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({new Date(exam.date).toLocaleDateString()} - {exam.period}° Cuat/Tri)</span>
                    </h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--content-red)', fontWeight: 600 }}>
                    {failedStudents.length} Desaprobados
                </div>
            </div>

            {isExpanded && (
                <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        {!isAddInstanceOpen ? (
                            <button
                                onClick={() => setIsAddInstanceOpen(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                            >
                                <Plus size={16} /> Agregar Instancia
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--bg-input)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                                <input
                                    type="text"
                                    placeholder="Título (ej: Recu 1)"
                                    value={newInstanceTitle}
                                    onChange={e => setNewInstanceTitle(e.target.value)}
                                    style={{ padding: '0.25rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-app)', color: 'white', width: '120px' }}
                                />
                                <input
                                    type="date"
                                    value={newInstanceDate}
                                    onChange={e => setNewInstanceDate(e.target.value)}
                                    style={{ padding: '0.25rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-app)', color: 'white' }}
                                />
                                <button onClick={handleAddInstance} style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }}>OK</button>
                                <button onClick={() => setIsAddInstanceOpen(false)} style={{ padding: '0.25rem 0.5rem' }}>x</button>
                            </div>
                        )}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.75rem', position: 'sticky', left: 0, background: 'var(--bg-panel)', zIndex: 10, borderBottom: '1px solid var(--glass-border)' }}>Alumno</th>
                                {instances.map(inst => (
                                    <th key={inst.id} style={{ textAlign: 'center', padding: '0.75rem', minWidth: '120px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontSize: '0.865rem', fontWeight: 600 }}>{inst.title || 'Recuperatorio'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(inst.date).toLocaleDateString()}</div>
                                        <button onClick={() => { if (confirm('Borrar instancia?')) deleteIntensificationInstance(inst.id) }} style={{ color: 'var(--content-red)', opacity: 0.5, marginLeft: '0.25rem' }}>x</button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {failedStudents.map(student => (
                                <tr key={student.id}>
                                    <td style={{ padding: '0.75rem', position: 'sticky', left: 0, background: 'var(--bg-panel)', borderBottom: '1px solid var(--glass-border)' }}>
                                        {student.surname}, {student.name}
                                    </td>
                                    {instances.map((inst, idx) => {
                                        const alreadyApproved = isStudentApprovedAlready(student.id, idx);
                                        const res = getResult(inst.id, student.id);

                                        if (alreadyApproved) {
                                            return <td key={inst.id} style={{ textAlign: 'center', color: 'var(--content-green)', borderBottom: '1px solid var(--glass-border)' }}>-</td>;
                                        }

                                        return (
                                            <td key={inst.id} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                                <IntensificationCell
                                                    instanceId={inst.id}
                                                    studentId={student.id}
                                                    initialResult={res}
                                                    onUpdate={addIntensificationResult}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function IntensificationCell({ instanceId, studentId, initialResult, onUpdate }: {
    instanceId: string,
    studentId: string,
    initialResult: any,
    onUpdate: (iid: string, sid: string, g: number | null, app: boolean) => Promise<void>
}) {
    // Determine initial dropdown value
    // If no result -> "-"
    // If result exists and is_approved -> "AP."
    // If result exists and !is_approved -> "DES."
    // If result exists and we are editing, we show the controls.

    // We can use a simple state: status "AP." | "DES." | "-"

    const [status, setStatus] = useState<"AP." | "DES." | "-">(() => {
        if (!initialResult) return "-";
        return initialResult.is_approved ? "AP." : "DES.";
    });

    // If AP., we also need the grade
    const [grade, setGrade] = useState<string>(initialResult?.grade?.toString() ?? "");

    // Handle Dropdown Change
    const handleStatusChange = async (newStatus: "AP." | "DES." | "-") => {
        setStatus(newStatus);

        if (newStatus === "DES.") {
            // Immediately save as disapproved, grade null
            await onUpdate(instanceId, studentId, null, false);
            setGrade("");
        } else if (newStatus === "-") {
            // Delete? or set to null? Maybe just ignore or set unapproved/null
            // The user probably wants to clear it. We don't have a clear "delete" result function yet, 
            // but upserting nulls might work if we allow it, or just set to false/null.
            // For now, let's treat "-" as un-setting (maybe sending null/false but conceptually 'empty')
            // Implementing as "not approved" with null grade is safe.
            await onUpdate(instanceId, studentId, null, false);
            setGrade("");
        }
        // If AP., we wait for grade input.
    };

    const handleGradeBlur = async () => {
        if (status === "AP." && grade) {
            const num = parseFloat(grade);
            if (!isNaN(num) && num >= 4) {
                await onUpdate(instanceId, studentId, num, true);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                style={{
                    padding: '0.25rem',
                    borderRadius: '4px',
                    backgroundColor: status === 'AP.' ? 'var(--content-green)' : (status === 'DES.' ? 'var(--content-red)' : 'var(--bg-input)'),
                    color: 'white',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center',
                    cursor: 'pointer'
                }}
            >
                <option value="-" style={{ backgroundColor: 'var(--bg-panel)', color: 'white' }}>-</option>
                <option value="AP." style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--content-green)' }}>AP.</option>
                <option value="DES." style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--content-red)' }}>DES.</option>
            </select>

            {status === "AP." && (
                <input
                    autoFocus
                    type="number"
                    min="4" max="10" step="0.5"
                    placeholder="Nota"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    onBlur={handleGradeBlur}
                    style={{
                        width: '50px',
                        padding: '0.25rem',
                        textAlign: 'center',
                        borderRadius: '4px',
                        border: '1px solid var(--accent-primary)',
                        backgroundColor: 'var(--bg-app)',
                        color: 'white',
                        fontSize: '0.9rem'
                    }}
                />
            )}
        </div>
    );
}
