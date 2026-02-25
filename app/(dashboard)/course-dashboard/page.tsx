"use client";

import { useData, Student, Grade } from "@/context/DataContext";
import { useState, useMemo, Suspense, useEffect } from "react";
import { ArrowLeft, UserPlus, FileText, Check, Calculator, Clock, Calendar as CalIcon, Trash2, Edit2, Download, Search, Plus, Printer, LayoutDashboard, Settings, LogOut, CheckSquare, XSquare, MinusSquare, AlertCircle, BookOpen, PenLine, FileSignature, AlertTriangle, RotateCw, History, ClipboardList } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AttendanceSection } from "./AttendanceSection";
import { GradeStatsCharts } from "@/components/GradeStatsCharts";
import { PreviasSection } from "./PreviasSection";
import { IntensificationSection } from "./IntensificationSection";

// --- Types ---
type AssignmentKey = string; // format: "period|date|description"

interface AssignmentColumn {
    key: AssignmentKey;
    period: 1 | 2 | 3;
    date: string;
    description: string;
    type: 'exam' | 'tp' | 'informe';
}

function FinalGradeInput({ studentId, period, initialValue, existingId, onChange }: { studentId: string, period: 1 | 2 | 3, initialValue: string | number, existingId?: string, onChange: (sid: string, p: 1 | 2 | 3, val: string, eid?: string) => void }) {
    const [val, setVal] = useState(initialValue);

    useEffect(() => {
        setVal(initialValue);
    }, [initialValue]);

    return (
        <input
            type="number"
            min="1" max="10"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={(e) => {
                if (String(val) !== String(initialValue)) {
                    onChange(studentId, period, String(val), existingId);
                }
            }}
            style={{ width: '45px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', color: 'white', fontWeight: 'bold' }}
        />
    );
}

function FinalInformeInput({ studentId, period, suggestedValue, savedValue, existingId, onChange }: {
    studentId: string, period: 1 | 2 | 3,
    suggestedValue: string, savedValue: string | null,
    existingId?: string,
    onChange: (sid: string, p: 1 | 2 | 3, val: string | null, eid?: string) => void
}) {
    const effectiveVal = savedValue || suggestedValue;
    const isManual = !!savedValue;

    const color = effectiveVal === 'TEA' ? 'var(--content-green)' :
        (effectiveVal === 'TEP' || effectiveVal === 'TED' ? 'var(--content-red)' : 'var(--text-primary)');

    return (
        <select
            value={effectiveVal}
            onChange={(e) => {
                const val = e.target.value;
                if (val === suggestedValue || val === "-") {
                    // Try to clear it if it equals the suggested OR if they selected empty '-' 
                    // (and suggested happens to be different, effectively clearing manual override)
                    onChange(studentId, period, null, existingId);
                } else {
                    onChange(studentId, period, val, existingId);
                }
            }}
            style={{
                color,
                fontWeight: isManual ? '900' : 'bold',
                backgroundColor: 'transparent',
                border: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                textAlign: 'center',
                textAlignLast: 'center',
                cursor: 'pointer',
                width: '100%',
                opacity: isManual ? 1 : 0.8
            }}
            title={isManual ? "Valor editado manualmente" : "Valor calculado automáticamente"}
        >
            <option value="-" style={{ color: 'black' }}>-</option>
            <option value="TEA" style={{ color: 'black' }}>TEA</option>
            <option value="TEP" style={{ color: 'black' }}>TEP</option>
            <option value="TED" style={{ color: 'black' }}>TED</option>
        </select>
    );
}

function CourseDashboardContent() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('id');
    const router = useRouter();

    if (!courseId) return <div>Error: Curso no especificado</div>;
    const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'attendance' | 'grades' | 'homework' | 'sanctions' | 'topic-log' | 'previas' | 'intensification' | 'calendar' | 'boletin'>('dashboard');

    const {
        courses, schools,
        getCourseStudents, addStudent, deleteStudent,
        getAttendance, markAttendance, attendance: allAttendance,
        getStudentGrades, addGrade, updateGrade, deleteGrade, grades: allGrades,
        getCourseEvents, addEvent, deleteEvent,
        homeworks: allHomeworks, addHomework, deleteHomework, toggleHomeworkStatus, getHomeworkStatus,
        sanctions: allSanctions, addSanction, deleteSanction, getCourseSanctions,
        topicLogs: allTopicLogs, addTopicLog, deleteTopicLog, getCourseTopicLogs,
        getPeriodFromDate, intensificationInstances, intensificationResults
    } = useData();

    const course = courses.find(c => c.id === courseId);
    const school = course ? schools.find(s => s.id === course.school_id) : null;

    const rawStudents = getCourseStudents(courseId);

    // Sort Students Alphabetically by Surname
    const students = useMemo(() => {
        return [...rawStudents].sort((a, b) => (a.surname || "").localeCompare(b.surname || ""));
    }, [rawStudents]);

    // Filtered Students (exclude "No puede cursar" from active lists)
    const activeStudents = useMemo(() => {
        return students.filter(s => s.condition !== 'No puede cursar');
    }, [students]);

    const events = getCourseEvents(courseId);
    const courseHomeworks = allHomeworks.filter(h => h.course_id === courseId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const courseSanctions = getCourseSanctions(courseId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

    // --- HOMEWORK METHODS ---
    const handleAddHomework = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHomeworkDesc && newHomeworkDate) {
            addHomework(courseId, {
                description: newHomeworkDesc,
                date: newHomeworkDate,
                period: getPeriodFromDate(newHomeworkDate, course?.school_id || "")
            });
            setIsAddHomeworkOpen(false);
            setNewHomeworkDesc("");
        }
    };

    const handleAddSanction = (e: React.FormEvent) => {
        e.preventDefault();
        if (sanctionStudentId && sanctionDate) {
            addSanction(courseId, {
                student_id: sanctionStudentId,
                date: sanctionDate,
                reason: sanctionReason
            });
            setSanctionStudentId(""); // Reset student selection
            alert("Sanción registrada correctamente");
        } else {
            alert("Por favor selecciona un alumno y fecha");
        }
    };

    const handleAddTopicLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (topicTitle && topicContent && topicDate) {
            addTopicLog(courseId, {
                date: topicDate,
                title: topicTitle,
                content: topicContent
            });
            setTopicTitle(""); setTopicContent(""); // Reset
        } else {
            alert("Por favor completa todos los campos");
        }
    };

    const getHomeworkPercentage = (studentId: string, period: 1 | 2 | 3) => {
        const periodHomeworks = courseHomeworks.filter(h => h.period === period);
        if (periodHomeworks.length === 0) return "-";

        let doneCount = 0;
        periodHomeworks.forEach(h => {
            const status = getHomeworkStatus(h.id, studentId);
            if (status === 'done') doneCount++;
        });

        return Math.round((doneCount / periodHomeworks.length) * 100) + "%";
    };

    // --- Forms State ---
    const [newStudentName, setNewStudentName] = useState("");
    const [newStudentSurname, setNewStudentSurname] = useState("");
    const [newStudentCondition, setNewStudentCondition] = useState<Student['condition']>('Regular');

    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDate, setNewEventDate] = useState("");

    // --- Homework State ---
    const [newHomeworkDate, setNewHomeworkDate] = useState(new Date().toISOString().split('T')[0]);
    const [newHomeworkDesc, setNewHomeworkDesc] = useState("");
    const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState(false);

    // --- Grades Refactor State ---
    // --- Sanctions State ---
    const [sanctionDate, setSanctionDate] = useState(new Date().toISOString().split('T')[0]);
    const [sanctionStudentId, setSanctionStudentId] = useState("");
    const [sanctionReason, setSanctionReason] = useState<'MAL COMPORTAMIENTO' | 'FALTA DE RESPETO' | 'NO ESTA EN CLASES'>('MAL COMPORTAMIENTO');

    // --- Topic Log State ---
    const [topicDate, setTopicDate] = useState(new Date().toISOString().split('T')[0]);
    const [topicTitle, setTopicTitle] = useState("");
    const [topicContent, setTopicContent] = useState("");

    // --- GRADES REFACTOR STATE ---
    const [addAssignmentOpen, setAddAssignmentOpen] = useState(false);
    const [newAssignmentDesc, setNewAssignmentDesc] = useState("");
    const [newAssignmentDate, setNewAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [newAssignmentType, setNewAssignmentType] = useState<'exam' | 'tp' | 'informe'>('exam');

    // Edit Column State
    const [editingColumn, setEditingColumn] = useState<AssignmentColumn | null>(null);
    const [editColDesc, setEditColDesc] = useState("");
    const [editColDate, setEditColDate] = useState("");

    // --- Handlers ---
    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newStudentName.trim() && newStudentSurname.trim()) {
            addStudent(courseId, {
                name: newStudentName.trim(),
                surname: newStudentSurname.trim(),
                condition: newStudentCondition
            });
            setNewStudentName(""); setNewStudentSurname(""); setNewStudentCondition('Regular');
        }
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEventTitle && newEventDate) {
            addEvent(courseId, { title: newEventTitle, date: newEventDate, description: "" });
            setNewEventTitle(""); setNewEventDate("");
        }
    };

    // --- DYNAMIC GRADES LOGIC ---

    // 1. Compute Columns from ALL existing grades in this course
    const courseGrades = allGrades.filter(g => g.course_id === courseId);

    const assignmentColumns = useMemo(() => {
        const map = new Map<AssignmentKey, AssignmentColumn>();

        courseGrades.filter(g => g.type !== 'final').forEach(g => {
            const key = `${g.period}|${g.date}|${g.description}`;
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    period: g.period,
                    date: g.date,
                    description: g.description,
                    type: (g.type as any) || 'exam' // Force type check pass if needed, or ensure g.type exists
                });
            }
        });

        // Convert to array and sort: Period ASC -> Date ASC
        return Array.from(map.values()).sort((a, b) => {
            if (a.period !== b.period) return a.period - b.period;
            return a.date.localeCompare(b.date);
        });
    }, [courseGrades]);

    const term1Cols = assignmentColumns.filter(c => c.period === 1);
    const term2Cols = assignmentColumns.filter(c => c.period === 2);
    const term3Cols = assignmentColumns.filter(c => c.period === 3);

    const getCellGrade = (studentId: string, col: AssignmentColumn) => {
        return courseGrades.find(g =>
            g.student_id === studentId &&
            g.period === col.period &&
            g.date === col.date &&
            g.description === col.description
        );
    };

    // Calculate Average for a student in a term
    const calculateTermAverage = (studentId: string, term: 1 | 2 | 3) => {
        const studentGrades = courseGrades.filter(g =>
            g.student_id === studentId &&
            g.period === term &&
            g.value !== null
        );
        if (studentGrades.length === 0) return "-";

        const sum = studentGrades.reduce((acc, g) => acc + (g.value || 0), 0);
        const avg = sum / studentGrades.length;

        return avg.toFixed(2);
    };

    const calculateGeneralAverage = (studentId: string) => {
        const t1 = calculateTermAverage(studentId, 1);
        const t2 = calculateTermAverage(studentId, 2);
        const t3 = calculateTermAverage(studentId, 3);

        let sum = 0;
        let count = 0;

        if (t1 !== '-') { sum += parseFloat(t1); count++; }
        if (t2 !== '-') { sum += parseFloat(t2); count++; }

        const isTri = school?.term_structure === 'tri';
        if (isTri && t3 !== '-') { sum += parseFloat(t3); count++; }

        if (count === 0) return "-";
        return (sum / count).toFixed(2);
    };

    // --- GRADE HELPERS ---
    const tpScale = [
        { label: 'R', value: 2 },
        { label: 'R+', value: 4 },
        { label: 'B-', value: 6 },
        { label: 'B', value: 7 },
        { label: 'B+', value: 8 },
        { label: 'MB', value: 9 },
        { label: 'EX', value: 10 },
    ];

    // Cell Edit Handler
    const handleGradeChange = (studentId: string, col: AssignmentColumn, value: string | number | null) => {
        let finalValue: number | null = null;

        if (col.type === 'tp') {
            // Value comes from Select (number or empty string)
            finalValue = value === "" ? null : Number(value);
        } else {
            // Exam: Value comes from Input (string)
            if (value === "") finalValue = null;
            else {
                let num = parseFloat(value as string);
                if (isNaN(num)) return;
                // Enforce 0-10
                if (num < 0) num = 0;
                if (num > 10) num = 10;
                finalValue = num;
            }
        }

        const existing = getCellGrade(studentId, col);

        if (existing) {
            updateGrade(existing.id, { value: finalValue });
        } else {
            addGrade(courseId, studentId, {
                description: col.description,
                date: col.date,
                period: col.period,
                type: col.type,
                value: finalValue
            });
        }
    };

    const renderGradeInput = (studentId: string, col: AssignmentColumn) => {
        const grade = getCellGrade(studentId, col);
        // Cast as any because getCellGrade now returns JSX.Element | string | number? 
        // Wait, getCellGrade was returning grade object in the original code I viewed in step 1804.
        // Let's check getCellGrade implementation again from step 1800.
        // It returns the grade OBJECT: return courseGrades.find(...)

        // Wait, my previous plan was to update getCellGrade to return value/render. 
        // But the current implementation returns the OBJECT.
        // Let's stick to the current pattern: renderGradeInput uses the object.

        const val = grade?.value;

        if (col.type === 'informe') {
            const qVal = grade?.qualitative_value || "";
            const handleSelectChange = (newVal: string) => {
                if (grade) {
                    if (newVal === "") {
                        deleteGrade(grade.id);
                    } else {
                        updateGrade(grade.id, { qualitative_value: newVal });
                    }
                } else if (newVal !== "") {
                    addGrade(courseId, studentId, {
                        description: col.description,
                        date: col.date,
                        period: col.period,
                        type: 'informe',
                        value: null,
                        qualitative_value: newVal
                    });
                }
            };

            return (
                <select
                    value={qVal}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    style={{
                        width: '100%', height: '100%', border: 'none', backgroundColor: 'transparent',
                        textAlign: 'center', fontWeight: 'bold', padding: '0.5rem', cursor: 'pointer',
                        appearance: 'none', WebkitAppearance: 'none', textAlignLast: 'center',
                        color: qVal === 'TEA' ? 'var(--accent-primary)' :
                            qVal === 'TEP' ? 'var(--content-red)' :
                                qVal === 'TED' ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                    }}
                >
                    <option value="" style={{ color: 'black' }}>-</option>
                    <option value="TEA" style={{ color: 'var(--accent-primary)' }}>TEA</option>
                    <option value="TEP" style={{ color: 'var(--content-red)' }}>TEP</option>
                    <option value="TED" style={{ color: 'var(--accent-secondary)' }}>TED</option>
                </select>
            );
        }

        if (col.type === 'tp') {
            return (
                <select
                    value={val ?? ""}
                    onChange={(e) => handleGradeChange(studentId, col, e.target.value)}
                    style={{
                        width: '100%', height: '100%', border: 'none', backgroundColor: 'transparent',
                        textAlign: 'center', color: 'white', padding: '0.5rem', cursor: 'pointer',
                        appearance: 'none', WebkitAppearance: 'none', textAlignLast: 'center'
                    }}
                >
                    <option value="" style={{ color: 'black' }}>-</option>
                    {tpScale.map(opt => (
                        <option key={opt.label} value={opt.value} style={{ color: 'black' }}>{opt.label}</option>
                    ))}
                </select>
            );
        }

        // Exam Input
        return (
            <input
                type="number"
                min="0" max="10" step="0.5"
                value={val ?? ""}
                placeholder="-"
                onChange={(e) => handleGradeChange(studentId, col, e.target.value)}
                style={{
                    width: '100%', height: '100%', border: 'none', backgroundColor: 'transparent',
                    textAlign: 'center', padding: '0.75rem',
                    fontWeight: (val !== null && val !== undefined && val < 7) ? 'bold' : 'normal',
                    color: (val !== null && val !== undefined && val < 7) ? 'var(--content-red)' : 'white'
                }}
            />
        );
    };

    const handleAddAssignment = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeStudents.length > 0) {
            addGrade(courseId, activeStudents[0].id, {
                description: newAssignmentDesc,
                date: newAssignmentDate,
                period: getPeriodFromDate(newAssignmentDate, course?.school_id || ""),
                type: newAssignmentType,
                value: 0
            });
            setAddAssignmentOpen(false);
            setNewAssignmentDesc("");
        } else {
            alert("Necesitas al menos un alumno para crear una columna de notas.");
        }
    };

    // Column Management Handlers
    const openEditColumn = (col: AssignmentColumn) => {
        setEditingColumn(col);
        setEditColDesc(col.description);
        setEditColDate(col.date);
    };

    const handleUpdateColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingColumn) return;

        // Find all grades matching the old column
        const gradesToUpdate = courseGrades.filter(g =>
            g.period === editingColumn.period &&
            g.date === editingColumn.date &&
            g.description === editingColumn.description
        );

        // Update them
        gradesToUpdate.forEach(g => {
            updateGrade(g.id, {
                description: editColDesc,
                date: editColDate
            });
        });

        setEditingColumn(null);
    };

    const handleDeleteColumn = () => {
        if (!editingColumn) return;
        if (!confirm(`¿Estás seguro de eliminar la columna "${editingColumn.description}" y TODAS sus notas?`)) return;

        const gradesToDelete = courseGrades.filter(g =>
            g.period === editingColumn.period &&
            g.date === editingColumn.date &&
            g.description === editingColumn.description &&
            g.type !== 'final'
        );

        gradesToDelete.forEach(g => deleteGrade(g.id));
        setEditingColumn(null);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (!course) return;
        const termConfig = school?.term_structure || 'bi';

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Excel UTF-8

        // Headers
        const headers = ["Alumno", "Asistencia (%)", "Tareas (%)", "1° Cuat.", "2° Cuat."];
        if (termConfig === 'tri') headers[4] = "2° Trim.";
        if (termConfig === 'tri') headers.push("3° Trim.");
        headers.push("Sanciones");

        csvContent += headers.join(",") + "\n";

        // Rows
        students.forEach(student => {
            const stats = getStats(student.id);

            // Homework %
            const studentHw = homeworkRecords.filter(r => r.student_id === student.id);
            const totalHw = courseHomework.length;
            const doneHw = studentHw.filter(r => r.status === 'done').length;
            const hwPercent = totalHw > 0 ? Math.round((doneHw / totalHw) * 100) : '-';

            // Attendance %
            const sAtt = allAttendance.filter(a => a.student_id === student.id && a.course_id === courseId);
            const totalAtt = sAtt.length;
            const presentAtt = sAtt.filter(a => a.present).length;
            const attPercent = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : '-';

            // Sanctions
            const sSanctions = courseSanctions.filter(s => s.student_id === student.id).length;

            const row = [
                `"${student.surname}, ${student.name}"`,
                attPercent,
                hwPercent,
                stats.avg1,
                stats.avg2
            ];

            if (termConfig === 'tri') row.push(stats.avg3);
            row.push(sSanctions);

            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Planilla_${course.name}_${course.year}${course.division}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // --- STATS (Legacy used for Students List) ---
    const getStats = (studentId: string) => {
        const studentRecords = allAttendance.filter(r => r.course_id === courseId && r.student_id === studentId);
        const absences = studentRecords.filter(r => !r.present).length;

        // Avg
        const sGrades = courseGrades.filter(g => g.student_id === studentId && g.value !== null);
        const getAvg = (p: 1 | 2 | 3) => {
            const pg = sGrades.filter(g => g.period === p);
            if (!pg.length) return '-';
            return (pg.reduce((a, b) => a + (b.value || 0), 0) / pg.length).toFixed(1);
        };

        const avg1 = getAvg(1);
        const avg2 = getAvg(2);
        const avg3 = getAvg(3);

        // General Average Calculation
        let generalAvg = '-';
        const validAvgs = [];
        if (avg1 !== '-') validAvgs.push(Number(avg1));
        if (avg2 !== '-') validAvgs.push(Number(avg2));
        if (school?.term_structure === 'tri' && avg3 !== '-') validAvgs.push(Number(avg3));

        if (validAvgs.length > 0) {
            generalAvg = (validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(1);
        }

        return { absences, avg1, avg2, avg3, generalAvg };
    };

    const totalStudents = students.length;

    if (!course) return <div>Materia no encontrada</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 100px)' }} className="dashboard-container">
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                <button
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{course.name} <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>{course.year} "{course.division}"</span></h1>
                    <button
                        onClick={handleExportCSV}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                        <Download size={18} /> Exportar Excel
                    </button>
                </div>

                {/* Tabs */}
                <div className="tabs-scroll-container">
                    {[
                        { id: 'dashboard', label: 'Resumen', icon: ClipboardList },
                        { id: 'students', label: 'Alumnos', icon: UserPlus },
                        { id: 'attendance', label: 'Asistencia', icon: Check },
                        { id: 'grades', label: 'Notas', icon: Calculator },
                        { id: 'homework', label: 'Tareas', icon: ClipboardList },
                        { id: 'sanctions', label: 'Sanciones', icon: Trash2 },
                        { id: 'topic-log', label: 'Libro de Temas', icon: PenLine },
                        { id: 'boletin', label: 'Boletín', icon: FileText },
                        { id: 'previas', label: 'Previas', icon: History },
                        { id: 'intensification', label: 'Intensif.', icon: RotateCw },
                        { id: 'calendar', label: 'Calendario', icon: CalIcon },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontWeight: 500
                            }}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>

                {/* ... (DASHBOARD) ... */}
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Alumnos</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalStudents}</div>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Rendimiento de la Materia</h3>
                            <GradeStatsCharts students={activeStudents} grades={allGrades} termStructure={school?.term_structure || 'bi'} />
                        </div>
                    </div>
                )}

                {/* ... (STUDENTS) ... */}
                {activeTab === 'students' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="no-print" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                <Printer size={18} /> Imprimir
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} style={{
                            gap: '1rem', marginBottom: '2rem',
                            backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)'
                        }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Alta de Alumno</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <input type="text" placeholder="Apellido" required value={newStudentSurname} onChange={(e) => setNewStudentSurname(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }} />
                                <input type="text" placeholder="Nombre" required value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }} />
                                <select value={newStudentCondition} onChange={(e) => setNewStudentCondition(e.target.value as any)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}>
                                    <option value="Regular">Regular</option>
                                    <option value="Recursante">Recursante</option>
                                    <option value="No puede cursar">No puede cursar</option>
                                </select>
                                <button type="submit" style={{ padding: '0 1.5rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Agregar</button>
                            </div>
                        </form>


                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', minWidth: '600px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)' }}>Apellido y Nombre</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)' }}>Condición</th>
                                        <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}>Inasistencias</th>
                                        <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}>Prom 1°</th>
                                        <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}>Prom 2°</th>
                                        {school?.term_structure === 'tri' && <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}>Prom 3°</th>}
                                        <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-secondary)' }}>Prom Gral</th>
                                        <th className="no-print" style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => {
                                        const stats = getStats(student.id);
                                        return (
                                            <tr key={student.id}>
                                                <td style={{ padding: '1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}><div style={{ fontWeight: 600 }}>{student.surname}, {student.name}</div></td>
                                                <td style={{ padding: '1rem' }}><span style={{ color: student.condition === 'Regular' ? 'var(--content-green)' : student.condition === 'Recursante' ? 'var(--accent-primary)' : 'var(--content-red)', fontWeight: 500 }}>{student.condition}</span></td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>{stats.absences}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}><span style={{ fontWeight: 'bold', color: stats.avg1 !== '-' && Number(stats.avg1) < 7 ? 'var(--content-red)' : 'var(--content-green)' }}>{stats.avg1}</span></td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}><span style={{ fontWeight: 'bold', color: stats.avg2 !== '-' && Number(stats.avg2) < 7 ? 'var(--content-red)' : 'var(--content-green)' }}>{stats.avg2}</span></td>
                                                {school?.term_structure === 'tri' && (
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}><span style={{ fontWeight: 'bold', color: stats.avg3 !== '-' && Number(stats.avg3) < 7 ? 'var(--content-red)' : 'var(--content-green)' }}>{stats.avg3}</span></td>
                                                )}
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{ fontWeight: 'bold', color: stats.generalAvg !== '-' && Number(stats.generalAvg) < 7 ? 'var(--content-red)' : 'var(--content-green)' }}>
                                                        {stats.generalAvg}
                                                    </span>
                                                </td>
                                                <td className="no-print" style={{ padding: '1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}><button onClick={() => deleteStudent(student.id)} style={{ color: 'var(--content-red)', opacity: 0.6 }}><Trash2 size={16} /></button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ... (ATTENDANCE) ... */}
                {/* ... (ATTENDANCE) ... */}
                {activeTab === 'attendance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="no-print" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-app)' }}>
                                <Printer size={18} /> Imprimir
                            </button>
                        </div>
                        <AttendanceSection
                            courseId={courseId}
                            students={activeStudents}
                            allAttendance={allAttendance}
                            markAttendance={markAttendance}
                            getAttendance={getAttendance}
                        />
                    </div>
                )}

                {/* --- GRADES REFACTOR --- */}
                {activeTab === 'grades' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                            <button className="no-print" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                <Printer size={18} /> Imprimir
                            </button>
                            <button
                                className="no-print"
                                onClick={() => setAddAssignmentOpen(true)}
                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                            >
                                <Plus size={18} /> Nueva Nota
                            </button>
                        </div>

                        {/* ADD ASSIGNMENT MODAL */}
                        {addAssignmentOpen && (
                            <div className="no-print" style={{
                                marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)',
                                display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap'
                            }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem' }}>Fecha</label>
                                    <input type="date" value={newAssignmentDate} onChange={e => setNewAssignmentDate(e.target.value)} style={{ display: 'block', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem' }}>Descripción</label>
                                    <input placeholder="Ej. Parcial" value={newAssignmentDesc} onChange={e => setNewAssignmentDesc(e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem' }}>Cuatrimestre</label>
                                    <div style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-input)', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', height: '36px' }}>
                                        {getPeriodFromDate(newAssignmentDate, course?.school_id || "")}° {school?.term_structure === 'bi' ? 'Cuatrimestre' : 'Trimestre'} (Automático)
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem' }}>Tipo</label>
                                    <select value={newAssignmentType} onChange={e => setNewAssignmentType(e.target.value as 'exam' | 'tp' | 'informe')} style={{ display: 'block', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }}>
                                        <option value="exam">Evaluación (0-10)</option>
                                        <option value="tp">Trabajo Práctico (Letras)</option>
                                        <option value="informe">Inf. Val. (TEA/TEP/TED)</option>
                                    </select>
                                </div>
                                <button onClick={handleAddAssignment} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }}>Guardar Columna</button>
                                <button onClick={() => setAddAssignmentOpen(false)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '4px' }}>Cancelar</button>
                            </div>
                        )}

                        {/* EDIT COLUMN MODAL */}
                        {editingColumn && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <div style={{
                                    backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)',
                                    width: '400px', maxWidth: '90%'
                                }}>
                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Editar Columna de Notas</h3>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Descripción</label>
                                        <input autoFocus value={editColDesc} onChange={e => setEditColDesc(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Fecha</label>
                                        <input type="date" value={editColDate} onChange={e => setEditColDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }} />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={handleDeleteColumn} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginRight: 'auto', padding: '0.75rem', color: 'var(--content-red)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={18} /> Eliminar Todo
                                        </button>
                                        <button onClick={() => setEditingColumn(null)} style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)' }}>Cancelar</button>
                                        <button onClick={handleUpdateColumn} style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-primary)', color: 'white', fontWeight: 600 }}>Guardar Cambios</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    {/* Header Row 1: Terms */}
                                    <tr>
                                        <th rowSpan={2} style={{ textAlign: 'left', padding: '1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-app)', position: 'sticky', left: 0, zIndex: 10 }}>Alumno</th>

                                        {/* Term 1 Header */}
                                        <th colSpan={term1Cols.length + 1} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>1° {school?.term_structure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}</th>

                                        {/* Term 2 Header */}
                                        <th colSpan={term2Cols.length + 1} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>2° {school?.term_structure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}</th>

                                        {/* Term 3 Header */}
                                        {school?.term_structure === 'tri' && (
                                            <th colSpan={term3Cols.length + 1} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>3° Trimestre</th>
                                        )}

                                        <th rowSpan={2} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Prom Gral</th>
                                    </tr>

                                    {/* Header Row 2: Assignments */}
                                    <tr>
                                        {term1Cols.map(col => (
                                            <th key={col.key} onClick={() => openEditColumn(col)} style={{ cursor: 'pointer', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 500, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '80px', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                                                    {col.description} <PenLine size={10} style={{ opacity: 0.5 }} />
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{col.date.split('-').slice(1).reverse().join('/')}</div>
                                            </th>
                                        ))}
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '60px', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>Promedio</th>

                                        {term2Cols.map(col => (
                                            <th key={col.key} onClick={() => openEditColumn(col)} style={{ cursor: 'pointer', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 500, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '80px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                                                    {col.description} <PenLine size={10} style={{ opacity: 0.5 }} />
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{col.date.split('-').slice(1).reverse().join('/')}</div>
                                            </th>
                                        ))}
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '60px', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>Promedio</th>

                                        {school?.term_structure === 'tri' && term3Cols.map(col => (
                                            <th key={col.key} onClick={() => openEditColumn(col)} style={{ cursor: 'pointer', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 500, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '80px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                                                    {col.description} <PenLine size={10} style={{ opacity: 0.5 }} />
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{col.date.split('-').slice(1).reverse().join('/')}</div>
                                            </th>
                                        ))}
                                        {school?.term_structure === 'tri' && (
                                            <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '60px', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>Promedio</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeStudents.map(student => (
                                        <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-panel)', position: 'sticky', left: 0 }}>
                                                {student.surname}, {student.name}
                                            </td>

                                            {/* Term 1 Cells */}
                                            {term1Cols.map(col => (
                                                <td key={col.key} style={{ padding: '0', borderRight: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                                    {renderGradeInput(student.id, col)}
                                                </td>
                                            ))}
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(99, 102, 241, 0.05)', color: (() => { const avg = calculateTermAverage(student.id, 1); return (avg !== '-' && Number(avg) < 6) ? 'var(--content-red)' : 'var(--content-green)' })() }}>{calculateTermAverage(student.id, 1)}</td>

                                            {/* Term 2 Cells */}
                                            {term2Cols.map(col => (
                                                <td key={col.key} style={{ padding: '0', borderRight: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                                    {renderGradeInput(student.id, col)}
                                                </td>
                                            ))}
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(34, 197, 94, 0.05)', color: (() => { const avg = calculateTermAverage(student.id, 2); return (avg !== '-' && Number(avg) < 6) ? 'var(--content-red)' : 'var(--content-green)' })() }}>{calculateTermAverage(student.id, 2)}</td>

                                            {/* Term 3 Cells */}
                                            {school?.term_structure === 'tri' && term3Cols.map(col => (
                                                <td key={col.key} style={{ padding: '0', borderRight: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                                    {renderGradeInput(student.id, col)}
                                                </td>
                                            ))}
                                            {school?.term_structure === 'tri' && (
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(245, 158, 11, 0.05)', color: (() => { const avg = calculateTermAverage(student.id, 3); return (avg !== '-' && Number(avg) < 6) ? 'var(--content-red)' : 'var(--content-green)' })() }}>{calculateTermAverage(student.id, 3)}</td>
                                            )}

                                            {/* General Average */}
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: (() => { const avg = calculateGeneralAverage(student.id); return (avg !== '-' && Number(avg) < 6) ? 'var(--content-red)' : 'var(--content-green)' })() }}>{calculateGeneralAverage(student.id)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {assignmentColumns.length === 0 && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No hay notas cargadas. Haz clic en "Nueva Nota" para crear una columna.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ... (HOMEWORK) ... */}
                {activeTab === 'homework' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                            <button className="no-print" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                <Printer size={18} /> Imprimir
                            </button>
                            <button
                                className="no-print"
                                onClick={() => setIsAddHomeworkOpen(true)}
                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                            >
                                <Plus size={18} /> Nueva Tarea
                            </button>
                        </div>

                        {/* ADD HOMEWORK MODAL */}
                        {isAddHomeworkOpen && (
                            <div className="no-print" style={{
                                marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary)',
                                display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap'
                            }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem' }}>Fecha</label>
                                    <input type="date" value={newHomeworkDate} onChange={e => setNewHomeworkDate(e.target.value)} style={{ display: 'block', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem' }}>Descripción</label>
                                    <input placeholder="Ej. TP integrador" value={newHomeworkDesc} onChange={e => setNewHomeworkDesc(e.target.value)} style={{ display: 'block', width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--bg-input)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem' }}>Cuatrimestre</label>
                                    <div style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-input)', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', height: '36px' }}>
                                        {getPeriodFromDate(newHomeworkDate, course?.school_id || "")}° {school?.term_structure === 'bi' ? 'Cuatrimestre' : 'Trimestre'} (Automático)
                                    </div>
                                </div>
                                <button onClick={handleAddHomework} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }}>Guardar Tarea</button>
                                <button onClick={() => setIsAddHomeworkOpen(false)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '4px' }}>Cancelar</button>
                            </div>
                        )}

                        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={{ textAlign: 'left', padding: '1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-app)', position: 'sticky', left: 0, zIndex: 10 }}>Alumno</th>

                                        {/* Term 1 */}
                                        <th colSpan={courseHomeworks.filter(h => h.period === 1).length + 1} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                            1° {school?.term_structure === 'bi' ? 'Cua' : 'Tri'} (Tareas)
                                        </th>

                                        {/* Term 2 */}
                                        <th colSpan={courseHomeworks.filter(h => h.period === 2).length + 1} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                                            2° {school?.term_structure === 'bi' ? 'Cua' : 'Tri'} (Tareas)
                                        </th>

                                        {/* Term 3 */}
                                        {school?.term_structure === 'tri' && (
                                            <th colSpan={courseHomeworks.filter(h => h.period === 3).length + 1} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                                                3° Tri (Tareas)
                                            </th>
                                        )}
                                    </tr>
                                    <tr>
                                        {/* Term 1 Cols */}
                                        {courseHomeworks.filter(h => h.period === 1).map(h => (
                                            <th key={h.id} style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 500, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '80px', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>{h.description}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.date.split('-').slice(1).reverse().join('/')}</div>
                                                <button onClick={() => { if (confirm("Eliminar tarea?")) deleteHomework(h.id) }} style={{ position: 'absolute', top: 2, right: 2, color: 'var(--content-red)', opacity: 0.5, border: 'none', background: 'transparent', cursor: 'pointer' }}>×</button>
                                            </th>
                                        ))}
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '60px', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>%</th>

                                        {/* Term 2 Cols */}
                                        {courseHomeworks.filter(h => h.period === 2).map(h => (
                                            <th key={h.id} style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 500, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '80px', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>{h.description}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.date.split('-').slice(1).reverse().join('/')}</div>
                                                <button onClick={() => { if (confirm("Eliminar tarea?")) deleteHomework(h.id) }} style={{ position: 'absolute', top: 2, right: 2, color: 'var(--content-red)', opacity: 0.5, border: 'none', background: 'transparent', cursor: 'pointer' }}>×</button>
                                            </th>
                                        ))}
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '60px', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>%</th>

                                        {/* Term 3 Cols */}
                                        {school?.term_structure === 'tri' && courseHomeworks.filter(h => h.period === 3).map(h => (
                                            <th key={h.id} style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 500, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '80px', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>{h.description}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{h.date.split('-').slice(1).reverse().join('/')}</div>
                                                <button onClick={() => { if (confirm("Eliminar tarea?")) deleteHomework(h.id) }} style={{ position: 'absolute', top: 2, right: 2, color: 'var(--content-red)', opacity: 0.5, border: 'none', background: 'transparent', cursor: 'pointer' }}>×</button>
                                            </th>
                                        ))}
                                        {school?.term_structure === 'tri' && (
                                            <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', minWidth: '60px', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>%</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeStudents.map(student => (
                                        <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-panel)', position: 'sticky', left: 0 }}>
                                                {student.surname}, {student.name}
                                            </td>

                                            {/* Term 1 Cells */}
                                            {courseHomeworks.filter(h => h.period === 1).map(h => {
                                                const status = getHomeworkStatus(h.id, student.id);
                                                let bg = 'transparent';
                                                let text = '-';
                                                if (status === 'done') { bg = 'rgba(34, 197, 94, 0.2)'; text = '✔'; }
                                                else if (status === 'missing') { bg = 'rgba(239, 68, 68, 0.2)'; text = '✗'; }
                                                else if (status === 'incomplete') { bg = 'rgba(234, 179, 8, 0.2)'; text = '~'; }
                                                else if (status === 'absent') { bg = 'rgba(107, 114, 128, 0.2)'; text = 'A'; }

                                                return (
                                                    <td key={h.id}
                                                        onClick={() => toggleHomeworkStatus(h.id, student.id)}
                                                        style={{ padding: '0', borderRight: '1px solid var(--glass-border)', textAlign: 'center', cursor: 'pointer', backgroundColor: bg, fontWeight: 'bold' }}
                                                    >
                                                        {text}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>{getHomeworkPercentage(student.id, 1)}</td>

                                            {/* Term 2 Cells */}
                                            {courseHomeworks.filter(h => h.period === 2).map(h => {
                                                const status = getHomeworkStatus(h.id, student.id);
                                                let bg = 'transparent';
                                                let text = '-';
                                                if (status === 'done') { bg = 'rgba(34, 197, 94, 0.2)'; text = '✔'; }
                                                else if (status === 'missing') { bg = 'rgba(239, 68, 68, 0.2)'; text = '✗'; }
                                                else if (status === 'incomplete') { bg = 'rgba(234, 179, 8, 0.2)'; text = '~'; }
                                                else if (status === 'absent') { bg = 'rgba(107, 114, 128, 0.2)'; text = 'A'; }

                                                return (
                                                    <td key={h.id}
                                                        onClick={() => toggleHomeworkStatus(h.id, student.id)}
                                                        style={{ padding: '0', borderRight: '1px solid var(--glass-border)', textAlign: 'center', cursor: 'pointer', backgroundColor: bg, fontWeight: 'bold' }}
                                                    >
                                                        {text}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>{getHomeworkPercentage(student.id, 2)}</td>

                                            {/* Term 3 Cells */}
                                            {school?.term_structure === 'tri' && courseHomeworks.filter(h => h.period === 3).map(h => {
                                                const status = getHomeworkStatus(h.id, student.id);
                                                let bg = 'transparent';
                                                let text = '-';
                                                if (status === 'done') { bg = 'rgba(34, 197, 94, 0.2)'; text = '✔'; }
                                                else if (status === 'missing') { bg = 'rgba(239, 68, 68, 0.2)'; text = '✗'; }
                                                else if (status === 'incomplete') { bg = 'rgba(234, 179, 8, 0.2)'; text = '~'; }
                                                else if (status === 'absent') { bg = 'rgba(107, 114, 128, 0.2)'; text = 'A'; }

                                                return (
                                                    <td key={h.id}
                                                        onClick={() => toggleHomeworkStatus(h.id, student.id)}
                                                        style={{ padding: '0', borderRight: '1px solid var(--glass-border)', textAlign: 'center', cursor: 'pointer', backgroundColor: bg, fontWeight: 'bold' }}
                                                    >
                                                        {text}
                                                    </td>
                                                );
                                            })}
                                            {school?.term_structure === 'tri' && (
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>{getHomeworkPercentage(student.id, 3)}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {courseHomeworks.length === 0 && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No hay tareas creadas. Crea una columna para empezar a trackear.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ... (SANCTIONS) ... */}
                {activeTab === 'sanctions' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="no-print" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                <Printer size={18} /> Imprimir
                            </button>
                        </div>
                        <div className="responsive-grid">
                            {/* FORM */}
                            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Nueva Sanción</h3>
                                <form onSubmit={handleAddSanction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Fecha</label>
                                        <input
                                            type="date"
                                            value={sanctionDate}
                                            onChange={e => setSanctionDate(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Alumno</label>
                                        <select
                                            value={sanctionStudentId}
                                            onChange={e => setSanctionStudentId(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                                        >
                                            <option value="">Seleccionar Alumno...</option>
                                            {activeStudents.map(s => (
                                                <option key={s.id} value={s.id}>{s.surname}, {s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Motivo</label>
                                        <select
                                            value={sanctionReason}
                                            onChange={e => setSanctionReason(e.target.value as any)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                                        >
                                            <option value="MAL COMPORTAMIENTO">MAL COMPORTAMIENTO</option>
                                            <option value="FALTA DE RESPETO">FALTA DE RESPETO</option>
                                            <option value="NO ESTA EN CLASES">NO ESTA EN CLASES</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', color: 'white', cursor: 'pointer' }}
                                    >
                                        Registrar Sanción
                                    </button>
                                </form>
                            </div>

                            {/* LIST */}
                            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Historial de Sanciones</h3>

                                {courseSanctions.length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay sanciones registradas.</div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Fecha</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Alumno</th>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Motivo</th>
                                                <th style={{ width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courseSanctions.map(s => {
                                                return (
                                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                        <td style={{ padding: '0.75rem' }}>{s.date.split('-').reverse().join('/')}</td>
                                                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                                                            {(() => {
                                                                const st = students.find(stu => stu.id === s.student_id);
                                                                return st ? `${st.surname}, ${st.name} ` : 'Desconocido';
                                                            })()}
                                                        </td>
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <span style={{
                                                                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                                backgroundColor: s.reason === 'MAL COMPORTAMIENTO' ? 'rgba(239, 68, 68, 0.2)' :
                                                                    s.reason === 'FALTA DE RESPETO' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                                                color: s.reason === 'MAL COMPORTAMIENTO' ? 'var(--content-red)' :
                                                                    s.reason === 'FALTA DE RESPETO' ? 'var(--accent-secondary)' : 'var(--accent-primary)'
                                                            }}>
                                                                {s.reason}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                            <button onClick={() => deleteSanction(s.id)} style={{ color: 'var(--content-red)', border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ... (TOPIC LOG) ... */}
                {activeTab === 'topic-log' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="no-print" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                <Printer size={18} /> Imprimir
                            </button>
                        </div>
                        <div className="responsive-grid">
                            {/* FORM */}
                            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Nuevo Tema Dado</h3>
                                <form onSubmit={handleAddTopicLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Fecha</label>
                                        <input
                                            type="date"
                                            value={topicDate}
                                            onChange={e => setTopicDate(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Título / Tema</label>
                                        <input
                                            placeholder="Ej. Introducción a Funciones"
                                            value={topicTitle}
                                            onChange={e => setTopicTitle(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Contenido / Observaciones</label>
                                        <textarea
                                            placeholder="Detalle de los contenidos..."
                                            value={topicContent}
                                            onChange={e => setTopicContent(e.target.value)}
                                            rows={5}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white', resize: 'vertical' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', color: 'white', cursor: 'pointer' }}
                                    >
                                        Registrar Tema
                                    </button>
                                </form>
                            </div>

                            {/* LIST */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Historial de Temas</h3>

                                {getCourseTopicLogs(courseId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                                        No hay temas registrados aún.
                                    </div>
                                ) : (
                                    getCourseTopicLogs(courseId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                        <div key={log.id} style={{ backgroundColor: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--accent-primary)', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{log.date.split('-').reverse().join('/')}</span>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>{log.title}</h4>
                                                </div>
                                                <button className="no-print" onClick={() => { if (confirm("Eliminar este registro?")) deleteTopicLog(log.id) }} style={{ color: 'var(--content-red)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                                {log.content}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'intensification' && (
                    <IntensificationSection courseId={courseId} />
                )}

                {activeTab === 'previas' && (
                    <PreviasSection courseId={courseId} />
                )}

                {/* ... (BOLETIN) ... */}
                {activeTab === 'boletin' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="no-print" onClick={handlePrint} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                                <Printer size={18} /> Imprimir
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} style={{ textAlign: 'left', padding: '1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-app)', position: 'sticky', left: 0, zIndex: 10 }}>Alumno</th>

                                        <th colSpan={7} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                            1° {school?.term_structure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}
                                        </th>

                                        <th colSpan={7} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                                            2° {school?.term_structure === 'bi' ? 'Cuatrimestre' : 'Trimestre'}
                                        </th>

                                        {school?.term_structure === 'tri' && (
                                            <th colSpan={7} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                                                3° Trimestre
                                            </th>
                                        )}
                                        <th rowSpan={2} style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Promedio Final</th>
                                    </tr>
                                    <tr>
                                        {/* T1 */}
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Notas</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Asist.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Tareas</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Sanc.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Intens.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>Inf. Val.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>FINAL</th>

                                        {/* T2 */}
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Notas</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Asist.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Tareas</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Sanc.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Intens.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>Inf. Val.</th>
                                        <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>FINAL</th>

                                        {/* T3 */}
                                        {school?.term_structure === 'tri' && (
                                            <>
                                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Notas</th>
                                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Asist.</th>
                                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Tareas</th>
                                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Sanc.</th>
                                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>Intens.</th>
                                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>Inf. Val.</th>
                                                <th style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>FINAL</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeStudents.map(student => {
                                        const getTermStats = (studentId: string, period: 1 | 2 | 3) => {
                                            const termGrades = courseGrades.filter(g => g.student_id === studentId && g.period === period && g.value !== null && g.type !== 'final');
                                            let avg = '-';
                                            if (termGrades.length > 0) {
                                                avg = (termGrades.reduce((a, b) => a + (b.value || 0), 0) / termGrades.length).toFixed(1);
                                            }

                                            const allStudentAtt = allAttendance.filter(a => a.course_id === courseId && a.student_id === studentId);
                                            const termAtt = allStudentAtt.filter(a => getPeriodFromDate(a.date, course?.school_id || "") === period);
                                            let attPercentage = '-';
                                            if (termAtt.length > 0) {
                                                const presents = termAtt.filter(a => a.present).length;
                                                attPercentage = Math.round((presents / termAtt.length) * 100) + '%';
                                            }

                                            const termHomeworks = courseHomeworks.filter(h => h.period === period);
                                            let hwPercentage = '-';
                                            if (termHomeworks.length > 0) {
                                                const doneCount = termHomeworks.filter(h => getHomeworkStatus(h.id, studentId) === 'done').length;
                                                hwPercentage = Math.round((doneCount / termHomeworks.length) * 100) + '%';
                                            }

                                            const termSanctions = courseSanctions.filter(s => s.student_id === studentId && getPeriodFromDate(s.date, course?.school_id || "") === period).length;

                                            const failedExamsInTerm = courseGrades.filter(g => g.student_id === studentId && g.period === period && g.type === 'exam' && g.value !== null && g.value < 7);
                                            let intensifStatus = '-';

                                            if (failedExamsInTerm.length > 0) {
                                                let allFailedCleared = true;
                                                let anyFailedInstance = false;

                                                for (const failedExam of failedExamsInTerm) {
                                                    const instancesForExam = intensificationInstances.filter(inst =>
                                                        inst.course_id === courseId &&
                                                        inst.original_period === period &&
                                                        inst.original_date === failedExam.date &&
                                                        inst.original_description === failedExam.description
                                                    );

                                                    let clearedThisExam = false;
                                                    let failedAnInstance = false;

                                                    for (const inst of instancesForExam) {
                                                        const res = intensificationResults.find(r => r.instance_id === inst.id && r.student_id === studentId);
                                                        if (res) {
                                                            if (res.is_approved) {
                                                                clearedThisExam = true;
                                                                break;
                                                            } else {
                                                                failedAnInstance = true;
                                                            }
                                                        }
                                                    }

                                                    if (!clearedThisExam) {
                                                        allFailedCleared = false;
                                                        if (failedAnInstance) {
                                                            anyFailedInstance = true;
                                                        }
                                                    }
                                                }

                                                if (allFailedCleared) {
                                                    intensifStatus = 'AP';
                                                } else if (anyFailedInstance) {
                                                    intensifStatus = 'DES';
                                                } else {
                                                    intensifStatus = 'Pend.';
                                                }
                                            }

                                            const finalGradeMatch = courseGrades.find(g => g.student_id === studentId && g.period === period && g.type === 'final');
                                            const finalGrade = finalGradeMatch?.value || '';

                                            const finalInformeMatch = courseGrades.find(g => g.student_id === studentId && g.period === period && g.type === 'final_informe');
                                            const savedInforme = finalInformeMatch?.qualitative_value || null;

                                            let suggestedInforme = '-';
                                            const hasAnyData = avg !== '-' || attPercentage !== '-' || hwPercentage !== '-' || intensifStatus !== '-';

                                            if (hasAnyData) {
                                                const attNum = parseInt(attPercentage);
                                                const hwNum = parseInt(hwPercentage);
                                                const safeAtt = isNaN(attNum) ? 100 : attNum;
                                                const safeHw = isNaN(hwNum) ? 100 : hwNum;
                                                const safeAvg = avg === '-' ? 10 : Number(avg);
                                                const allApproved = (safeAvg >= 7 && intensifStatus === '-') || intensifStatus === 'AP';

                                                if (safeAtt < 25) {
                                                    suggestedInforme = 'TED';
                                                } else if (allApproved && safeAtt >= 75 && safeHw >= 50) {
                                                    suggestedInforme = 'TEA';
                                                } else {
                                                    suggestedInforme = 'TEP';
                                                }
                                            }

                                            return { avg, attPercentage, hwPercentage, sanctions: termSanctions || '-', intensifStatus, finalGrade, finalGradeId: finalGradeMatch?.id, suggestedInforme, savedInforme, finalInformeId: finalInformeMatch?.id };
                                        };
                                        const handleFinalGradeChange = (studentId: string, period: 1 | 2 | 3, value: string, existingId?: string) => {
                                            const numValue = value === '' ? null : Number(value);
                                            if (existingId) {
                                                if (numValue === null) {
                                                    deleteGrade(existingId);
                                                } else {
                                                    updateGrade(existingId, { value: numValue });
                                                }
                                            } else if (numValue !== null) {
                                                addGrade(courseId, studentId, {
                                                    description: `Nota Final ${period}°`,
                                                    date: new Date().toISOString().split('T')[0],
                                                    period: period,
                                                    type: 'final',
                                                    value: numValue
                                                });
                                            }
                                        };
                                        const handleFinalInformeChange = (studentId: string, period: 1 | 2 | 3, value: string | null, existingId?: string) => {
                                            if (existingId) {
                                                if (value === null) {
                                                    deleteGrade(existingId);
                                                } else {
                                                    updateGrade(existingId, { qualitative_value: value });
                                                }
                                            } else if (value !== null) {
                                                addGrade(courseId, studentId, {
                                                    description: `Informe Final ${period}°`,
                                                    date: new Date().toISOString().split('T')[0],
                                                    period: period,
                                                    type: 'final_informe',
                                                    value: null,
                                                    qualitative_value: value
                                                });
                                            }
                                        };

                                        const s1 = getTermStats(student.id, 1);
                                        const s2 = getTermStats(student.id, 2);
                                        const s3 = school?.term_structure === 'tri' ? getTermStats(student.id, 3) : null;

                                        let finalAvg = '-';
                                        const finalGrades = [];
                                        if (s1.finalGrade !== '') finalGrades.push(Number(s1.finalGrade));
                                        if (s2.finalGrade !== '') finalGrades.push(Number(s2.finalGrade));
                                        if (s3 && s3.finalGrade !== '') finalGrades.push(Number(s3.finalGrade));

                                        if (finalGrades.length > 0) {
                                            finalAvg = (finalGrades.reduce((a, b) => a + b, 0) / finalGrades.length).toFixed(1);
                                        }

                                        return (
                                            <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-panel)', position: 'sticky', left: 0, fontWeight: 500 }}>
                                                    {student.surname}, {student.name}
                                                </td>

                                                {/* T1 */}
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s1.avg}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s1.attPercentage}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s1.hwPercentage}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s1.sanctions}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', fontWeight: 600, color: s1.intensifStatus === 'AP' ? 'var(--content-green)' : s1.intensifStatus === 'DES' ? 'var(--content-red)' : 'var(--text-muted)' }}>{s1.intensifStatus}</td>
                                                <td style={{ padding: '0 0.25rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                                                    <FinalInformeInput
                                                        studentId={student.id}
                                                        period={1}
                                                        suggestedValue={s1.suggestedInforme}
                                                        savedValue={s1.savedInforme}
                                                        existingId={s1.finalInformeId}
                                                        onChange={handleFinalInformeChange}
                                                    />
                                                </td>
                                                <td style={{ padding: '0 0.25rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                                                    <FinalGradeInput
                                                        studentId={student.id}
                                                        period={1}
                                                        initialValue={s1.finalGrade}
                                                        existingId={s1.finalGradeId}
                                                        onChange={handleFinalGradeChange}
                                                    />
                                                </td>

                                                {/* T2 */}
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s2.avg}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s2.attPercentage}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s2.hwPercentage}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s2.sanctions}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', fontWeight: 600, color: s2.intensifStatus === 'AP' ? 'var(--content-green)' : s2.intensifStatus === 'DES' ? 'var(--content-red)' : 'var(--text-muted)' }}>{s2.intensifStatus}</td>
                                                <td style={{ padding: '0 0.25rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
                                                    <FinalInformeInput
                                                        studentId={student.id}
                                                        period={2}
                                                        suggestedValue={s2.suggestedInforme}
                                                        savedValue={s2.savedInforme}
                                                        existingId={s2.finalInformeId}
                                                        onChange={handleFinalInformeChange}
                                                    />
                                                </td>
                                                <td style={{ padding: '0 0.25rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
                                                    <FinalGradeInput
                                                        studentId={student.id}
                                                        period={2}
                                                        initialValue={s2.finalGrade}
                                                        existingId={s2.finalGradeId}
                                                        onChange={handleFinalGradeChange}
                                                    />
                                                </td>

                                                {/* T3 */}
                                                {school?.term_structure === 'tri' && s3 && (
                                                    <>
                                                        <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s3.avg}</td>
                                                        <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s3.attPercentage}</td>
                                                        <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s3.hwPercentage}</td>
                                                        <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)' }}>{s3.sanctions}</td>
                                                        <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', fontWeight: 600, color: s3.intensifStatus === 'AP' ? 'var(--content-green)' : s3.intensifStatus === 'DES' ? 'var(--content-red)' : 'var(--text-muted)' }}>{s3.intensifStatus}</td>
                                                        <td style={{ padding: '0 0.25rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                                                            <FinalInformeInput
                                                                studentId={student.id}
                                                                period={3}
                                                                suggestedValue={s3.suggestedInforme}
                                                                savedValue={s3.savedInforme}
                                                                existingId={s3.finalInformeId}
                                                                onChange={handleFinalInformeChange}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '0 0.25rem', textAlign: 'center', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                                                            <FinalGradeInput
                                                                studentId={student.id}
                                                                period={3}
                                                                initialValue={s3.finalGrade}
                                                                existingId={s3.finalGradeId}
                                                                onChange={handleFinalGradeChange}
                                                            />
                                                        </td>
                                                    </>
                                                )}

                                                <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid var(--glass-border)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: finalAvg !== '-' && Number(finalAvg) >= 7 ? 'var(--content-green)' : finalAvg !== '-' && Number(finalAvg) < 7 ? 'var(--content-red)' : 'inherit' }}>
                                                    {finalAvg}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {activeStudents.length === 0 && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No hay alumnos en esta materia para mostrar el boletín.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ... (CALENDAR) ... */}
                {activeTab === 'calendar' && (
                    <div>
                        <form onSubmit={handleAddEvent} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <input type="text" placeholder="Evento..." value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }} />
                            <input type="date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }} />
                            <button type="submit" style={{ padding: '0 1.5rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Agregar</button>
                        </form>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {events.map(event => (
                                <div key={event.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)', width: '60px', textAlign: 'center' }}>{event.date.split('-')[2]}<br /><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{event.date.split('-')[1]}</span></div>
                                    <div style={{ flex: 1 }}><div style={{ fontWeight: 'bold' }}>{event.title}</div></div>
                                    <button onClick={() => deleteEvent(event.id)} style={{ color: 'var(--content-red)' }}><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}


export default function CourseDashboardPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <CourseDashboardContent />
        </Suspense>
    );
}
