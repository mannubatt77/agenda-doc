"use client";

import { useData, Course } from "@/context/DataContext";
import { useState, use } from "react";
import { Plus, ArrowLeft, Trash2, ArrowRight, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SchoolDetailsPage({ params }: { params: Promise<{ schoolId: string }> }) {
    const { schoolId } = use(params);
    const router = useRouter();
    const { schools, getSchoolCourses, addCourse, updateCourse, deleteCourse, deleteSchool } = useData();

    const school = schools.find(s => s.id === schoolId);
    const courses = getSchoolCourses(schoolId);

    const [isAdding, setIsAdding] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const [courseName, setCourseName] = useState("");
    const [courseYear, setCourseYear] = useState("");
    const [courseDivision, setCourseDivision] = useState("");

    if (!school) {
        return <div>Escuela no encontrada</div>;
    }

    const resetForm = () => {
        setCourseName("");
        setCourseYear("");
        setCourseDivision("");
        setIsAdding(false);
        setEditingCourse(null);
    };

    const startAdd = () => {
        resetForm();
        setIsAdding(true);
    };

    const startEdit = (course: Course) => {
        setCourseName(course.name);
        setCourseYear(course.year);
        setCourseDivision(course.division);
        setEditingCourse(course);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (courseName && courseYear && courseDivision) {
            if (editingCourse) {
                updateCourse(editingCourse.id, {
                    name: courseName,
                    year: courseYear,
                    division: courseDivision
                });
            } else {
                addCourse(schoolId, {
                    name: courseName,
                    year: courseYear,
                    division: courseDivision
                });
            }
            resetForm();
        }
    };

    const showModal = isAdding || editingCourse;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}
                >
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{school.name}</h1>
                    <button
                        onClick={() => { if (confirm('¿Eliminar escuela?')) { deleteSchool(schoolId); router.push('/schools'); } }}
                        style={{ color: 'var(--content-red)', opacity: 0.8 }}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Materias Dictadas</h2>
                <button
                    onClick={startAdd}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        fontWeight: 500
                    }}
                >
                    <Plus size={18} /> Nueva Materia
                </button>
            </div>

            {/* Add/Edit Course Modal/Form */}
            {showModal && (
                <div style={{
                    marginBottom: '2rem',
                    backgroundColor: 'var(--bg-panel)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--accent-primary)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Materia (ej. Matemática)</label>
                            <input
                                required
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Año (ej. 5to)</label>
                            <input
                                required
                                value={courseYear}
                                onChange={(e) => setCourseYear(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>División (ej. B)</label>
                            <input
                                required
                                value={courseDivision}
                                onChange={(e) => setCourseDivision(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-input)', border: 'none', color: 'white' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-sm)' }}>{editingCourse ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" onClick={resetForm} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {courses.length === 0 && !showModal && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No hay materias cargadas en esta escuela.
                    </div>
                )}

                {courses.map(course => (
                    <div key={course.id} style={{
                        backgroundColor: 'var(--bg-panel)',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{course.name}</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{course.year} "{course.division}"</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link
                                href={`/courses/${course.id}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: 'var(--accent-primary)',
                                    fontWeight: 500
                                }}
                            >
                                Gestionar <ArrowRight size={16} />
                            </Link>
                            <button
                                onClick={() => startEdit(course)}
                                style={{ color: 'var(--text-secondary)', opacity: 0.8 }}
                                title="Editar Materia"
                            >
                                <Edit size={16} />
                            </button>
                            <button onClick={() => deleteCourse(course.id)} style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
