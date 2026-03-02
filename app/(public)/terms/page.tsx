import { ArrowLeft, Shield, FileText, Server, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-app">
            {/* Header */}
            <header className="border-b border-glass-border bg-panel py-4 px-6 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <Link href="/register" className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-gray-400 transition flex items-center justify-center">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="text-accent-primary" size={24} />
                        Acuerdo de Licencia y Términos de Servicio
                    </h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto p-6 lg:p-12 mb-24">
                <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-8">

                    <p className="text-lg">
                        <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
                    </p>

                    <p>
                        Bienvenido a <strong>Agenda.doc</strong>. Al acceder o utilizar nuestra aplicación web y los servicios relacionados (el &quot;Servicio&quot;), usted (el &quot;Usuario&quot; o &quot;Docente&quot;) acepta regirse por estos Términos de Servicio y Acuerdo de Licencia de Usuario Final (EULA). Si no está de acuerdo con estos términos, le rogamos que no utilice el Servicio.
                    </p>

                    <section>
                        <h2 className="text-white text-2xl font-bold flex items-center gap-2 mb-4">
                            <Shield className="text-emerald-400" /> 1. Uso Aceptable y Responsabilidad
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Agenda.doc se proporciona como una herramienta organizativa para educadores. El Usuario es el único responsable de la exactitud y legalidad de la información (nombres de alumnos, calificaciones, asistencias, adaptaciones) que ingresa en la plataforma.</li>
                            <li>Usted se compromete a utilizar el Servicio de conformidad con las normativas vigentes en su jurisdicción escolar respecto a la privacidad de datos de menores.</li>
                            <li>Agenda.doc no se responsabiliza por la pérdida de datos derivada de un mal uso de la plataforma, eliminación accidental de escuelas o materias por parte del usuario, o problemas derivados de la pérdida de credenciales de acceso.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white text-2xl font-bold flex items-center gap-2 mb-4">
                            <Server className="text-blue-400" /> 2. Privacidad y Manejo de Datos
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Toda la información volcada en el sistema (padrones, promedios, asistencias, PPI) se almacena bajo estándares de seguridad en la nube (Supabase).</li>
                            <li>Agenda.doc actúa como <em>procesador de datos</em> en nombre del docente. No compartimos, vendemos, ni comercializamos listas de estudiantes, notas o información personal cargada en el sistema con terceros con fines publicitarios.</li>
                            <li>Las contraseñas de los usuarios están encriptadas y no son legibles por los administradores de Agenda.doc.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white text-2xl font-bold flex items-center gap-2 mb-4">
                            <AlertCircle className="text-amber-400" /> 3. Suscripción y Pagos (Mercado Pago)
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Agenda.doc se ofrece bajo un modelo Software-as-a-Service (SaaS) con un sistema de suscripción anual automatizada (Premium).</li>
                            <li>El procesamiento exacto de cobros, tarjetas de crédito, débito o dinero en cuenta es manejado de manera segura y exclusiva por <strong>Mercado Pago</strong>. Agenda.doc no retiene ni tiene acceso directo a los números de sus tarjetas bancarias.</li>
                            <li><strong>Renovación Automática:</strong> Al suscribirse a la versión Premium, usted autoriza a Mercado Pago a debitar el monto acordado anualmente.</li>
                            <li><strong>Cancelación:</strong> Puede gestionar la baja de su suscripción en cualquier momento desde el panel de su Perfil en Agenda.doc o directamente desde su app de Mercado Pago. La cancelación detendrá cobros futuros, pero no reembolsará períodos ya iniciados o meses en curso.</li>
                            <li>Precios y tarifas están sujetos a modificaciones con previo aviso por canales oficiales.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white text-2xl font-bold mb-4">4. Propiedad Intelectual</h2>
                        <p>
                            El código fuente, diseño, interfaces gráficas y funcionamiento de Agenda.doc son propiedad intelectual exclusiva de sus creadores humanos. Se concede al Usuario una licencia limitada, no exclusiva, intransferible y revocable para utilizar el software a través de su navegador web. Queda prohibida la ingeniería inversa, reventa o copia del sistema con fines comerciales paralelos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-2xl font-bold mb-4">5. Limitación de Garantías</h2>
                        <p>
                            El Servicio se proporciona &quot;tal cual&quot; (as is) y &quot;según disponibilidad&quot;. Agenda.doc hará todos los esfuerzos razonables para mantener el sistema operativo y seguro 24/7, sin embargo, no garantiza que el servicio será ininterrumpido, oportuno, o libre de errores de software bugs. En ningún caso los desarrolladores de Agenda.doc serán responsables por daños indirectos, incidentales o lucro cesante que surjan del uso o la imposibilidad de uso del Servicio.
                        </p>
                    </section>
                </div>

                <div className="mt-12 text-center text-sm text-text-muted border-t border-glass-border pt-8">
                    Contacte a soporte si tiene dudas sobre este acuerdo. Agenda.doc - Herramientas para Educadores.
                </div>
            </main>
        </div>
    );
}
