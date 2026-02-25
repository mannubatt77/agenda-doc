"use client";

import { useData } from "@/context/DataContext";
import { useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { GradeStatsCharts } from "@/components/GradeStatsCharts";

export default function AnalyticsPage() {
    const { schools, courses, students, attendance, homeworks, homeworkRecords, grades } = useData();

    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const filteredCourses = courses.filter(c => c.school_id === selectedSchoolId);
    const activeCourse = courses.find(c => c.id === selectedCourseId);
    const courseStudents = students.filter(s => s.course_id === selectedCourseId);

    // 1. Attendance Data (Line Chart over time)
    // Group attendance by date
    const attendanceStats = () => {
        if (!activeCourse) return [];
        const courseAtt = attendance.filter(a => a.course_id === activeCourse.id);
        const dates = Array.from(new Set(courseAtt.map(a => a.date))).sort();

        return dates.map(date => {
            const recordsOnDate = courseAtt.filter(a => a.date === date);
            const present = recordsOnDate.filter(a => a.present).length;
            const absent = recordsOnDate.filter(a => !a.present).length;
            const total = present + absent;
            return {
                name: date,
                Presentes: present,
                Ausentes: absent,
                Porcentaje: total > 0 ? Math.round((present / total) * 100) : 0
            };
        });
    };

    // 2. Homework Data (Pie Chart)
    const homeworkStats = () => {
        if (!activeCourse) return [];
        const courseHw = homeworks.filter(h => h.course_id === activeCourse.id);
        let done = 0; let pending = 0;

        courseHw.forEach(hw => {
            courseStudents.forEach(st => {
                const record = homeworkRecords.find(r => r.homework_id === hw.id && r.student_id === st.id);
                if (record && record.status === 'done') done++;
                else pending++; // missing, incomplete, absent or no record
            });
        });

        return [
            { name: 'Entregadas', value: done, color: '#3b82f6' },
            { name: 'No entregadas / Incompletas', value: pending, color: '#f59e0b' }
        ];
    };

    const attData = attendanceStats();
    const hwData = homeworkStats();
    const hasHwData = hwData.reduce((acc, val) => acc + val.value, 0) > 0;
    const hasAttData = attData.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="selection-header">
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Estadísticas del Curso</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Seleccione el establecimiento y la materia para visualizar sus analíticas.</p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                    <select
                        value={selectedSchoolId}
                        onChange={(e) => { setSelectedSchoolId(e.target.value); setSelectedCourseId(""); }}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px' }}
                    >
                        <option value="">Seleccione Establecimiento</option>
                        {schools.map(sh => (
                            <option key={sh.id} value={sh.id}>{sh.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        disabled={!selectedSchoolId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px', opacity: !selectedSchoolId ? 0.5 : 1 }}
                    >
                        <option value="">Seleccione Materia</option>
                        {filteredCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.year}° {c.division}°)</option>
                        ))}
                    </select>
                </div>
            </div>

            {activeCourse && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Grades Block (Reusing Component) */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                            Rendimiento en Evaluaciones
                        </h2>
                        <GradeStatsCharts
                            students={courseStudents}
                            grades={grades.filter(g => g.course_id === activeCourse.id)}
                            termStructure={schools.find(s => s.id === activeCourse.school_id)?.term_structure || 'bi'}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                        {/* Attendance Block */}
                        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Evolución de Asistencia (%)</h2>
                            <div style={{ width: '100%', height: '300px' }}>
                                {hasAttData ? (
                                    <ResponsiveContainer>
                                        <LineChart data={attData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                            <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} tickFormatter={(val) => val.split("-").slice(1).join("/")} />
                                            <YAxis stroke="#ffffff80" fontSize={12} domain={[0, 100]} />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--glass-border)', borderRadius: '8px', color: 'white' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="Porcentaje" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="% Presentes" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        Sin datos de asistencia registrados
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Homework Block */}
                        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Cumplimiento de Tareas</h2>
                            <div style={{ width: '100%', height: '300px' }}>
                                {hasHwData ? (
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={hwData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                                {hwData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--glass-border)', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        Sin tareas asignadas
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
