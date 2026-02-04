import Link from "next/link";
// Using inline styles for the landing page for simplicity, 
// as the main app will use the Dashboard layout.

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '2rem',
      textAlign: 'center',
      padding: '1rem'
    }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Agenda<span style={{ color: 'var(--accent-primary)' }}>.doc</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px' }}>
        La plataforma integral para gestionar tus cursos, asistencias y calificaciones de manera simple y moderna.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link
          href="/login"
          style={{
            padding: '0.875rem 2rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'opacity 0.2s'
          }}
        >
          Ingresar
        </Link>
        <Link
          href="/register"
          style={{
            padding: '0.875rem 2rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '1rem',
            border: '1px solid var(--glass-border)'
          }}
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
