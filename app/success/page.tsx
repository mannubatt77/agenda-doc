import Link from 'next/link';

export default function SuccessPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const status = searchParams.status;
    const paymentId = searchParams.payment_id;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'var(--bg-app)' }}>
            <div style={{
                backgroundColor: 'var(--bg-panel)',
                padding: '3rem 2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--glass-border)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: 'var(--content-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    ¡Pago Exitoso!
                </h1>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Tu suscripción ha sido procesada correctamente.
                </p>

                {paymentId && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        ID de transacción: {paymentId}
                    </p>
                )}

                <Link
                    href="/profile"
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.875rem',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        transition: 'opacity 0.2s'
                    }}
                >
                    Ir a mi perfil
                </Link>
            </div>
        </div>
    );
}
