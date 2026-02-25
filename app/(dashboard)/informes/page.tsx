"use client";

import { useData } from "@/context/DataContext";
import { useState, useEffect } from "react";
import { Printer } from "lucide-react";

export default function InformesPage() {
    const { schools, courses, students, grades, intensificationResults, attendance, homeworks, homeworkRecords, sanctions } = useData();

    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");

    const [generatedText, setGeneratedText] = useState("");
    const [editedText, setEditedText] = useState("");

    // Reset dependents when antecedents change
    // Using onChange instead of useEffect helps prevent cascading updates, but for simplicity we remove the use effects.
    // However, if we remove useEffects we need to handle resets in the select onChange.
    // Let's remove these useEffects entirely, and handle it in the onChange below.

    // Derived states
    const filteredCourses = courses.filter(c => c.school_id === selectedSchoolId);

    // Sort students alphabetically
    const filteredStudents = students
        .filter(s => s.course_id === selectedCourseId)
        .sort((a, b) => {
            const nameA = `${a.surname} ${a.name}`.toLowerCase();
            const nameB = `${b.surname} ${b.name}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });

    const activeSchool = schools.find(s => s.id === selectedSchoolId);
    const activeCourse = courses.find(c => c.id === selectedCourseId);
    const activeStudent = students.find(s => s.id === selectedStudentId);

    // Generate Text Logic whenever a student is fully selected
    useEffect(() => {
        if (!activeStudent || !activeCourse) {
            return;
        }

        // 1. Gather Attendance
        const studentAtt = attendance.filter(a => a.student_id === activeStudent.id && a.course_id === activeCourse.id);
        const presentCount = studentAtt.filter(a => a.present).length;
        const absentCount = studentAtt.filter(a => !a.present).length;
        const totalClasses = presentCount + absentCount;
        const attPercent = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : null;

        // 2. Gather Homework
        const studentHw = homeworks.filter(h => h.course_id === activeCourse.id);
        let hwDelivered = 0;
        for (const hw of studentHw) {
            const record = homeworkRecords.find(r => r.homework_id === hw.id && r.student_id === activeStudent.id);
            if (record && record.status === 'done') {
                hwDelivered++;
            }
        }
        const hwTotal = studentHw.length;
        const hwPercent = hwTotal > 0 ? Math.round((hwDelivered / hwTotal) * 100) : null;

        // 3. Gather Sanctions
        const studentSanctions = sanctions.filter(s => s.student_id === activeStudent.id && s.course_id === activeCourse.id).length;
        const studentGrades = grades.filter(g => g.student_id === activeStudent.id && g.course_id === activeCourse.id);
        const exams = studentGrades.filter(g => g.type === 'exam' && g.value !== null) as { value: number }[];

        const failedExamsCount = exams.filter(e => e.value < 7).length;
        const passedExamsCount = exams.filter(e => e.value >= 7).length;

        // Intensification instances
        const studentIntensifications = intensificationResults.filter(r => r.student_id === activeStudent.id);
        const passedIntensifications = studentIntensifications.filter(i => i.is_approved).length;

        // 5. Build Narrative
        const sections: string[] = [];

        sections.push(`El alumno/a ${activeStudent.name} ${activeStudent.surname}, perteneciente a ${activeCourse.year}° ${activeCourse.division}° de la institución ${activeSchool?.name}, presenta el siguiente estado académico a la fecha.`);

        if (attPercent !== null) {
            if (attPercent >= 75) {
                sections.push(`En cuanto a asistencia, mantiene niveles adecuados con un ${attPercent}% de presentismo.`);
            } else if (attPercent < 25) {
                sections.push(`Se advierte una situación crítica de inasistencias, registrando apenas un ${attPercent}% de presentismo a lo largo del dictado, lo cual interfiere directamente con la continuidad pedagógica.`);
            } else {
                sections.push(`Registra un ${attPercent}% de presentismo, por lo que requiere una mejora en su regularidad a clases.`);
            }
        } else {
            sections.push(`Aún no cuenta con registros de asistencia cargados en la plataforma.`);
        }

        if (hwPercent !== null) {
            if (hwPercent >= 80) {
                sections.push(`Demuestra un gran compromiso y responsabilidad, habiendo entregado el ${hwPercent}% de las tareas solicitadas satisfactoriamente.`);
            } else if (hwPercent < 75) {
                sections.push(`Evidencia dificultades en el cumplimiento de actividades, habiendo realizado únicamente el ${hwPercent}% de las tareas asignadas. Es importante recordar la necesidad de sostener mayor responsabilidad y compromiso con la asignatura.`);
            } else {
                sections.push(`Entregó el ${hwPercent}% de las tareas correspondientes, mostrando un nivel aceptable de elaboración.`);
            }
        }

        if (exams.length > 0) {
            if (failedExamsCount === 0) {
                sections.push(`En las instancias de evaluación formales, ha logrado acreditar satisfactoriamente todos los contenidos estipulados en primera instancia.`);
            } else {
                sections.push(`A lo largo de las instancias de evaluación de contenidos, ha desaprobado ${failedExamsCount} evaluaciones/TP y ha aprobado ${passedExamsCount} en primera instancia sin necesidad de intensificar.`);

                if (passedIntensifications > 0) {
                    sections.push(`No obstante, transitó instancias de recuperación (intensificación) logrando acreditar saberes pendientes en ${passedIntensifications} oportunidades, demostrando progreso.`);
                } else {
                    sections.push(`Al momento no ha logrado recuperar satisfactoriamente los contenidos desaprobados en instancias de intensificación.`);
                }
            }
        }

        if (studentSanctions > 0) {
            sections.push(`En relación a las pautas de convivencia institucionales, se ha asentado ${studentSanctions} registro/s de amonestaciones o sanciones.`);
        } else {
            sections.push(`Mantiene un buen comportamiento en clase respetando los acuerdos de convivencia, sin registrar llamados de atención formales.`);
        }

        // Conclusion Assembly
        let conclusion = "En conclusión, ";
        const isFailingExams = exams.length > 0 && failedExamsCount > passedExamsCount && passedIntensifications === 0;
        const isIrresponsible = hwPercent !== null && hwPercent < 75;
        const isAbsentee = attPercent !== null && attPercent < 75;

        if (isFailingExams || isIrresponsible || isAbsentee) {
            conclusion += `se observa que el alumno/a transita un proceso de aprendizaje que requiere mayor acompañamiento y esfuerzo personal. `;
            const advices = [];
            if (isAbsentee) advices.push("mejorar la asistencia a clases para no perder el hilo conductor de los temas");
            if (isIrresponsible) advices.push("asumir un rol más activo y responsable en la entrega de tareas en tiempo y forma");
            if (isFailingExams) advices.push("reforzar el estudio en el hogar y consultar las dudas al docente para prepararse mejor de cara a las próximas evaluaciones");

            if (advices.length > 0) {
                conclusion += `Se le sugiere principalmente ${advices.join(", e ")}. `;
            }
            conclusion += "¡Con constancia y dedicación, estamos seguros de que podrá revertir esta situación y alcanzar los objetivos propuestos!";
        } else {
            conclusion += `se destaca el compromiso y la responsabilidad asumida por el alumno/a frente a la propuesta pedagógica de la materia. Ha evidenciado una trayectoria educativa favorable, cumpliendo con las pautas de trabajo y demostrando interés en superarse. ¡Lo animamos a continuar trabajando de esta excelente manera para seguir alcanzando nuevos logros!`;
        }

        sections.push(conclusion);

        const finalTxt = sections.join("\n\n");
        setGeneratedText(finalTxt);
        setEditedText(finalTxt);

    }, [activeStudent, activeCourse, attendance, homeworks, homeworkRecords, sanctions, grades, intensificationResults, activeSchool?.name]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="informes-container">
            <style jsx global>{`
                @media print {
                    /* Hide UI outside the printable area */
                    .sidebar, .navbar, .selection-header, .print-btn-container, .edit-controls, .mobile-only, nav, aside {
                        display: none !important;
                    }

                    /* Expand main container to use full page */
                    .main-content {
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                    }

                    .informes-container {
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .printable-a4 {
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 2cm !important;
                        background-color: white !important;
                        color: black !important;
                    }

                    /* Override dark mode for printing */
                    body {
                        background-color: white !important;
                        color: black !important;
                    }

                    .print-table th, .print-table td {
                        border-color: #ddd !important;
                        color: black !important;
                    }
                    .print-table th {
                        background-color: #f3f4f6 !important;
                    }

                    @page {
                        size: A4;
                        margin: 0;
                    }
                }

                .printable-a4 {
                    background-color: white; /* Always white inside browser too to simulate paper */
                    color: black;
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 2cm;
                    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.5);
                    border-radius: 4px;
                    font-family: 'Times New Roman', Times, serif; /* Formal font */
                    line-height: 1.6;
                }
            `}</style>


            <div className="selection-header" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Inf. Trayectorias</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Seleccione escuela, materia y alumno para generar automáticamente un informe de trayectoria.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-panel)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                    {/* Schools */}
                    <select
                        value={selectedSchoolId}
                        onChange={(e) => {
                            setSelectedSchoolId(e.target.value);
                            setSelectedCourseId("");
                            setSelectedStudentId("");
                            setGeneratedText("");
                            setEditedText("");
                        }}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px' }}
                    >
                        <option value="">Seleccione Establecimiento</option>
                        {schools.map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>

                    {/* Courses */}
                    <select
                        value={selectedCourseId}
                        onChange={(e) => {
                            setSelectedCourseId(e.target.value);
                            setSelectedStudentId("");
                            setGeneratedText("");
                            setEditedText("");
                        }}
                        disabled={!selectedSchoolId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '200px', opacity: !selectedSchoolId ? 0.5 : 1 }}
                    >
                        <option value="">Seleccione Materia</option>
                        {filteredCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.year}° {c.division}°)</option>
                        ))}
                    </select>

                    {/* Students */}
                    <select
                        value={selectedStudentId}
                        onChange={(e) => {
                            setSelectedStudentId(e.target.value);
                            setGeneratedText("");
                            setEditedText("");
                        }}
                        disabled={!selectedCourseId}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-input)', color: 'white', minWidth: '250px', opacity: !selectedCourseId ? 0.5 : 1 }}
                    >
                        <option value="">Seleccione Alumno</option>
                        {filteredStudents.map(s => (
                            <option key={s.id} value={s.id}>{s.surname}, {s.name}</option>
                        ))}
                    </select>
                </div>
            </div>


            {activeStudent && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

                    {/* Controls */}
                    <div className="print-btn-container" style={{ display: 'flex', gap: '1rem', width: '210mm', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handlePrint}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}
                        >
                            <Printer size={18} /> Imprimir PDF / Guardar
                        </button>
                    </div>

                    <div className="edit-controls" style={{ width: '210mm', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Editar Cuerpo del Informe (Antes de Imprimir)</label>
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            style={{
                                width: '100%',
                                height: '200px',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)',
                                backgroundColor: 'var(--bg-input)',
                                color: 'white',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                        <button
                            onClick={() => setEditedText(generatedText)}
                            style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}
                        >
                            Restaurar Texto Automático
                        </button>
                    </div>

                    {/* PRINTABLE PAGE (A4) */}
                    <div className="printable-a4">

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{activeSchool?.name}</h2>
                                <div style={{ fontSize: '1rem' }}>Materia: {activeCourse?.name} ({activeCourse?.year}° {activeCourse?.division}°)</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                <div>Fecha: {new Date().toLocaleDateString('es-AR')}</div>
                                <div>Ciclo Lectivo: {new Date().getFullYear()}</div>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 style={{ textAlign: 'center', fontSize: '1.75rem', marginBottom: '2rem', textTransform: 'uppercase' }}>
                            Informe de Trayectoria Escolar
                        </h1>

                        <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            <strong>Alumno/a:</strong> {activeStudent.surname}, {activeStudent.name}
                        </div>

                        {/* Auto Generated/Edited Text */}
                        <div style={{ textAlign: 'justify', marginBottom: '3rem', whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>
                            {editedText}
                        </div>

                        {/* Signatures Area - absolute positioning at bottom or flex pushed to bottom */}
                        <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-around', paddingTop: '2rem' }}>
                            <div style={{ textAlign: 'center', width: '200px' }}>
                                <div style={{ borderTop: '1px solid black', paddingTop: '0.5rem' }}>
                                    Firma del Docente
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', width: '200px' }}>
                                <div style={{ borderTop: '1px solid black', paddingTop: '0.5rem' }}>
                                    Firma de Dirección / Tutoría
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* End Printable A4 */}

                </div>
            )}

        </div>
    );
}
