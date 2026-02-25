"use client";

import { useData, Student } from "@/context/DataContext";
import { useState } from "react";
import { Shuffle, Users as UsersIcon } from "lucide-react";

export default function GroupsPage() {
    const { schools, courses, students, grades } = useData();

    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const [groupSize, setGroupSize] = useState<number>(4);
    const [groupType, setGroupType] = useState<'random' | 'performance'>('random');
    const [generatedGroups, setGeneratedGroups] = useState<Student[][]>([]);

    const filteredCourses = courses.filter(c => c.school_id === selectedSchoolId);
    const courseStudents = students.filter(s => s.course_id === selectedCourseId);

    const handleGenerateGroups = () => {
        if (courseStudents.length === 0) return;

        let targetStudents = [...courseStudents];

        if (groupType === 'performance') {
            const studentAvgs = targetStudents.map(student => {
                const sGrades = grades.filter(g => g.student_id === student.id && g.course_id === selectedCourseId && g.value !== null);
                const avg = sGrades.length ? sGrades.reduce((a, b) => a + (b.value as number), 0) / sGrades.length : 0;
                return { student, avg };
            });

            // Descending sort (best grades first)
            studentAvgs.sort((a, b) => b.avg - a.avg);
            targetStudents = studentAvgs.map(sa => sa.student);

            const groups: Student[][] = [];
            for (let i = 0; i < targetStudents.length; i += groupSize) {
                // Take a tier of students
                const chunk = targetStudents.slice(i, i + groupSize);
                // Shuffle within the performance tier so groups aren't strictly ordered alphabetically or perfectly 1-2-3-4
                for (let j = chunk.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [chunk[j], chunk[k]] = [chunk[k], chunk[j]];
                }
                groups.push(chunk);
            }
            setGeneratedGroups(groups);
            return;
        }

        // Random logic
        const shuffled = [...targetStudents];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const groups: Student[][] = [];
        for (let i = 0; i < shuffled.length; i += groupSize) {
            groups.push(shuffled.slice(i, i + groupSize));
        }

        setGeneratedGroups(groups);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="selection-header">
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Grupos Mágicos</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Seleccione una materia y genere automáticamente grupos de trabajo aleatorios.</p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                    <select
                        value={selectedSchoolId}
                        onChange={(e) => { setSelectedSchoolId(e.target.value); setSelectedCourseId(""); setGeneratedGroups([]); }}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px' }}
                    >
                        <option value="">Seleccione Establecimiento</option>
                        {schools.map(sh => (
                            <option key={sh.id} value={sh.id}>{sh.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCourseId}
                        onChange={(e) => { setSelectedCourseId(e.target.value); setGeneratedGroups([]); }}
                        disabled={!selectedSchoolId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px', opacity: !selectedSchoolId ? 0.5 : 1 }}
                    >
                        <option value="">Seleccione Materia</option>
                        {filteredCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.year}° {c.division}°)</option>
                        ))}
                    </select>

                    <select
                        value={groupType}
                        onChange={(e) => { setGroupType(e.target.value as 'random' | 'performance'); setGeneratedGroups([]); }}
                        disabled={!selectedCourseId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '150px', opacity: !selectedCourseId ? 0.5 : 1 }}
                    >
                        <option value="random">Aleatorio</option>
                        <option value="performance">Por Rendimiento</option>
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', opacity: !selectedCourseId ? 0.5 : 1 }}>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Alumnos por grupo:</label>
                        <input
                            type="number"
                            min="2"
                            max="10"
                            value={groupSize}
                            onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                            disabled={!selectedCourseId}
                            style={{ width: '60px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', textAlign: 'center' }}
                        />
                        <button
                            onClick={handleGenerateGroups}
                            disabled={!selectedCourseId || courseStudents.length === 0}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: !selectedCourseId ? 'not-allowed' : 'pointer' }}
                        >
                            <Shuffle size={18} /> Mezclar
                        </button>
                    </div>
                </div>
            </div>

            {generatedGroups.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {generatedGroups.map((group, index) => (
                        <div key={index} style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                <UsersIcon size={20} />
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Grupo {index + 1}</h2>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {group.map(student => (
                                    <li key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }} />
                                        <span><strong>{student.surname}</strong>, {student.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
