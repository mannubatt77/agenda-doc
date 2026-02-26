"use client";

import { useMemo } from "react";
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Grade, Student } from "@/context/DataContext";

interface GradeStatsChartsProps {
    students: Student[];
    grades: Grade[];
    courseFilter?: string;
    termStructure?: 'bi' | 'tri';
}

export function GradeStatsCharts({ students, grades, termStructure = 'bi' }: GradeStatsChartsProps) {

    // Helper to calculate stats
    const stats = useMemo(() => {
        let t1Approved = 0; let t1Failed = 0;
        let t2Approved = 0; let t2Failed = 0;
        let t3Approved = 0; let t3Failed = 0;

        students.forEach(student => {
            // Get grades for this student
            const studentGrades = grades.filter(g => g.student_id === student.id && g.value !== null);

            // Term 1
            const t1Grades = studentGrades.filter(g => g.period === 1);
            if (t1Grades.length > 0) {
                const sum = t1Grades.reduce((acc, g) => acc + (g.value || 0), 0);
                const avg = sum / t1Grades.length;
                if (avg >= 7) t1Approved++; else t1Failed++;
            }

            // Term 2
            const t2Grades = studentGrades.filter(g => g.period === 2);
            if (t2Grades.length > 0) {
                const sum = t2Grades.reduce((acc, g) => acc + (g.value || 0), 0);
                const avg = sum / t2Grades.length;
                if (avg >= 7) t2Approved++; else t2Failed++;
            }

            // Term 3
            if (termStructure === 'tri') {
                const t3Grades = studentGrades.filter(g => g.period === 3);
                if (t3Grades.length > 0) {
                    const sum = t3Grades.reduce((acc, g) => acc + (g.value || 0), 0);
                    const avg = sum / t3Grades.length;
                    if (avg >= 7) t3Approved++; else t3Failed++;
                }
            }
        });

        return {
            term1: [{ name: 'Aprobados', value: t1Approved, color: '#22c55e' }, { name: 'Desaprobados', value: t1Failed, color: '#ef4444' }],
            term2: [{ name: 'Aprobados', value: t2Approved, color: '#22c55e' }, { name: 'Desaprobados', value: t2Failed, color: '#ef4444' }],
            term3: [{ name: 'Aprobados', value: t3Approved, color: '#22c55e' }, { name: 'Desaprobados', value: t3Failed, color: '#ef4444' }]
        };
    }, [students, grades, termStructure]);

    const hasDataT1 = stats.term1.some(d => d.value > 0);
    const hasDataT2 = stats.term2.some(d => d.value > 0);
    const hasDataT3 = stats.term3.some(d => d.value > 0);

    const renderPie = (data: { name: string, value: number, color: string }[], title: string, hasData: boolean) => (
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>{title}</h3>
            <div style={{ width: '100%', height: '220px' }}>
                {hasData ? (
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--glass-border)', borderRadius: '8px' }} itemStyle={{ color: 'white' }} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value, entry: any) => {
                                    const total = data.reduce((acc, curr) => acc + curr.value, 0);
                                    const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                                    return `${value} (${entry.payload.value} - ${percent}%)`;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                        Sin datos suficientes
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {renderPie(stats.term1, `Rendimiento 1° ${termStructure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}`, hasDataT1)}
            {renderPie(stats.term2, `Rendimiento 2° ${termStructure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}`, hasDataT2)}
            {termStructure === 'tri' && renderPie(stats.term3, 'Rendimiento 3° Trimestre', hasDataT3)}
        </div>
    );
}
