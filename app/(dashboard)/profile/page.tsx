"use client";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import { Camera, Plus, Trash2, Save, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const { createAcademicYear, subscription } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [newYearInput, setNewYearInput] = useState((new Date().getFullYear() + 1).toString());

    // Local state for form
    const [name, setName] = useState(user?.name || "");
    const [studies, setStudies] = useState<string[]>(user?.studies || []);
    const [newStudy, setNewStudy] = useState("");

    const handleSave = async () => {
        await updateProfile({ name, studies });
        setIsEditing(false);
    };

    const handlePhotoClick = () => {
        if (isEditing) {
            // In a real app, this would trigger file input
            // For MVP, we'll just alert or simulate a URL
            const mockUrl = "https://ui-avatars.com/api/?name=" + name.replace(" ", "+") + "&background=random";
            updateProfile({ photoUrl: mockUrl });
        }
    };

    const addStudy = () => {
        if (newStudy.trim()) {
            setStudies([...studies, newStudy.trim()]);
            setNewStudy("");
        }
    };

    const removeStudy = (index: number) => {
        setStudies(studies.filter((_, i) => i !== index));
    };

    const avatarUrl = user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name?.replace(" ", "+") || "User"}`;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Mi Perfil</h1>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isEditing ? 'var(--content-green)' : 'var(--accent-primary)',
                        color: 'white',
                        fontWeight: 600
                    }}
                >
                    {isEditing ? <><Save size={18} /> Guardar</> : 'Editar Perfil'}
                </button>
            </header>

            <div style={{
                backgroundColor: 'var(--bg-panel)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--glass-border)',
                overflow: 'hidden'
            }}>
                {/* Banner/Header of Card */}
                <div style={{ height: '120px', backgroundColor: 'var(--bg-input)' }}></div>

                <div style={{ padding: '0 2rem 2rem', position: 'relative' }}>
                    {/* Avatar */}
                    <div style={{ marginTop: '-60px', marginBottom: '1.5rem', position: 'relative', width: '120px' }}>
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid var(--bg-panel)',
                                objectFit: 'cover',
                                backgroundColor: 'var(--bg-app)'
                            }}
                        />
                        {isEditing && (
                            <button
                                onClick={handlePhotoClick}
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    backgroundColor: 'var(--accent-primary)',
                                    borderRadius: '50%',
                                    padding: '0.5rem',
                                    color: 'white',
                                    border: '2px solid var(--bg-panel)',
                                    cursor: 'pointer'
                                }}
                                title="Cambiar foto (Simulado)"
                            >
                                <Camera size={18} />
                            </button>
                        )}
                    </div>

                    {/* Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Basic Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Nombre Completo
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'var(--bg-app)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--text-primary)',
                                            outline: 'none'
                                        }}
                                    />
                                ) : (
                                    <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>{user?.name}</div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                    Email
                                </label>
                                <div style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                            </div>
                        </div>

                        {/* Studies / Titles */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                Títulos y Estudios
                            </label>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: isEditing ? '1rem' : 0 }}>
                                {studies.length === 0 && !isEditing && (
                                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin estudios registrados</span>
                                )}
                                {studies.map((study, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--accent-primary)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        border: '1px solid rgba(99, 102, 241, 0.2)'
                                    }}>
                                        {study}
                                        {isEditing && (
                                            <button onClick={() => removeStudy(idx)} style={{ color: 'var(--accent-primary)', opacity: 0.7 }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isEditing && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={newStudy}
                                        onChange={(e) => setNewStudy(e.target.value)}
                                        placeholder="Agregar título (ej. Licenciatura en...)"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'var(--bg-app)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--text-primary)',
                                            outline: 'none'
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && addStudy()}
                                    />
                                    <button
                                        onClick={addStudy}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'var(--bg-input)',
                                            color: 'white',
                                            border: '1px solid var(--glass-border)'
                                        }}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Subscription Info */}
            <div style={{
                marginTop: '2rem',
                backgroundColor: 'var(--bg-panel)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--glass-border)',
                padding: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: 'var(--accent-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Suscripción</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Plan Actual</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: subscription?.status === 'active' ? 'var(--content-green)' : 'var(--text-primary)'
                            }}>
                                {subscription?.status === 'active' ? 'Profesional (Anual)' : 'Prueba Gratuita'}
                            </span>
                            {subscription?.status === 'active' && (
                                <span style={{
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    color: 'var(--content-green)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(34, 197, 94, 0.2)'
                                }}>
                                    ACTIVO
                                </span>
                            )}
                        </div>
                        {subscription?.end_date && (
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Renueva el: {new Date(subscription.end_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {subscription?.status !== 'active' && (
                        <a
                            href="/pricing"
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                        >
                            Actualizar a PRO
                        </a>
                    )}
                </div>
            </div>

            {/* Academic Year Management */}
            <div style={{
                marginTop: '2rem',
                backgroundColor: 'var(--bg-panel)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--glass-border)',
                padding: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Calendar size={24} style={{ color: 'var(--accent-primary)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Administrar Ciclos Lectivos</h2>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    Al crear un nuevo ciclo lectivo, se copiarán todas las escuelas y cursos del año actual al nuevo año.
                    Los alumnos y notas <strong>NO</strong> se copiarán, permitiendo iniciar un nuevo año limpio conservando la estructura.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                        type="number"
                        value={newYearInput}
                        onChange={(e) => setNewYearInput(e.target.value)}
                        placeholder="Año (ej. 2027)"
                        style={{
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            width: '120px'
                        }}
                    />
                    <button
                        onClick={() => {
                            const y = parseInt(newYearInput);
                            if (isNaN(y) || y < 2020 || y > 2100) {
                                alert("Ingrese un año válido");
                                return;
                            }
                            if (confirm(`¿Estás seguro de crear el ciclo lectivo ${y}? Esto duplicará tus escuelas y cursos.`)) {
                                createAcademicYear(y);
                            }
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-input)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--accent-primary)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Crear Ciclo Lectivo
                    </button>
                </div>
            </div>

        </div>
    );
}
