"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Camera, Plus, Trash2, Save } from "lucide-react";

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

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
        </div>
    );
}
