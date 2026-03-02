"use client";

import { ArrowLeft, BookOpen, Users, BarChart2, CheckCircle, PenTool, Layout, FileText, Calendar, CreditCard, HelpCircle, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ManualPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('introduccion');

    // Smooth scroll and spy functionality could be added here, but for simplicity native anchor links are used.

    const sections = [
        { id: "introduccion", title: "1. Introducción y Configuración", icon: <BookOpen size={18} /> },
        { id: "alumnos", title: "2. Gestión de Alumnos", icon: <Users size={18} /> },
        { id: "asistencia", title: "3. Asistencia Diaria", icon: <CheckCircle size={18} /> },
        { id: "calificaciones", title: "4. Notas y Promedios", icon: <BarChart2 size={18} /> },
        { id: "adaptaciones", title: "5. PPI y Adaptaciones", icon: <UserCog size={18} /> },
        { id: "calendario", title: "6. Calendario de Clases", icon: <Calendar size={18} /> },
        { id: "plano", title: "7. Plano del Aula", icon: <Layout size={18} /> },
        { id: "planificaciones", title: "8. Planificaciones Anuales", icon: <PenTool size={18} /> },
        { id: "informes", title: "9. Documentos e Informes", icon: <FileText size={18} /> },
        { id: "suscripcion", title: "10. Pagos y Suscripción", icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-app">
            {/* Sidebar Navigation (Sticky) */}
            <div className="w-full lg:w-80 border-r border-glass-border bg-panel p-6 lg:h-screen lg:sticky lg:top-0 overflow-y-auto no-print">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Volver atrás</span>
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle className="text-accent-primary" /> Índice del Manual
                </h2>

                <nav className="flex flex-col gap-2">
                    {sections.map(section => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${activeSection === section.id
                                ? 'bg-accent-primary/10 border-accent-primary text-white font-medium'
                                : 'border-transparent text-text-secondary hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={activeSection === section.id ? 'text-accent-primary' : 'text-text-muted'}>
                                {section.icon}
                            </span>
                            <span className="text-sm">{section.title}</span>
                        </a>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 lg:p-12 mb-32 max-w-5xl overflow-y-auto scroll-smooth">
                <div className="mb-12 border-b border-glass-border pb-8">
                    <h1 className="text-4xl font-black mb-4">Manual de Usuario Agenda.doc</h1>
                    <p className="text-xl text-text-secondary">La guía definitiva para exprimir al máximo todas las herramientas del sistema y simplificar tu labor docente cotidiana.</p>
                </div>

                <div className="space-y-16">

                    {/* SECTION 1 */}
                    <section id="introduccion" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-accent-primary">
                            <BookOpen size={32} /> <h2>1. Introducción y Configuración Escolar</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>Para comenzar a utilizar <strong>Agenda.doc</strong> y desbloquear funciones como tomar lista o evaluar, el primer paso obligatorio es estructurar tu entorno de trabajo real.</p>

                            <h3 className="text-white text-lg font-bold mt-6 mb-2">Crear un Establecimiento</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Dirígete a <span className="text-white font-medium">Escuelas y Materias</span> y haz clic en la tarjeta [+ Agregar Escuela].</li>
                                <li>Define el nombre de la institución (Ej: E.E.S N° 12).</li>
                                <li><strong>Formato de Evaluación (CRÍTICO):</strong> Decide si la escuela es <em>Trimestral</em> (3 notas) o <em>Cuatrimestral</em> (2 notas). Esta decisión estructura toda la matriz de promedios para esa escuela de forma permanente.</li>
                                <li>Utiliza el calendario para establecer las fechas exactas de inicio y fin de cada período. Esto le indica al sistema cuándo debe &quot;cortar&quot; y promediar las notas automáticamente.</li>
                            </ul>

                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg my-6">
                                <p className="text-amber-200"><strong>💡 Pro-Tip:</strong> No puedes cambiar el formato Trimestral/Cuatrimestral de una escuela ya creada porque destruiría las bases de datos de promedios. Si te equivocaste, simplemente borra la escuela (ícono de papelera) y créala de nuevo.</p>
                            </div>

                            <h3 className="text-white text-lg font-bold mt-6 mb-2">Crear tus Materias</h3>
                            <p>Ingresa a la escuela recién creada y aprieta <strong>+ Agregar Materia</strong>. Coloca el nombre, año (numérico) y la división (Ej. &quot;A&quot;). Al guardar, podrás entrar al <em>Dashboard Rápido</em> de esa materia específica para comenzar a cargar alumnos.</p>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 2 */}
                    <section id="alumnos" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-emerald-400">
                            <Users size={32} /> <h2>2. Gestión de Alumnos y Trayectorias</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>Dentro del tablero de una materia, navega a la pestaña <strong>Alumnos</strong> para estructurar tu padrón.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Carga manual:</strong> Agrega el Nombre y Apellido de tus estudiantes.</li>
                                <li><strong>Condición:</strong> Puedes marcarlos como <em>Regular</em> o <em>Recursante</em>.</li>
                                <li><strong>Estudiantes Inactivos:</strong> Si un alumno abandona en medio del año, cambia su estado a <em>&quot;No puede cursar&quot;</em>. El sistema lo volverá gris y dejará de tomarlo en cuenta para los cálculos de inasistencias o promedios generales, sin borrar su historial previo.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 3 */}
                    <section id="asistencia" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-purple-400">
                            <CheckCircle size={32} /> <h2>3. Asistencia Diaria Interactiva</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>Tomar lista nunca fue tan ágil. Ve a la pestaña <strong>Asistencia</strong>, elige la fecha en el menú superior y comienza a hacer clic.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong><span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">P (Presente)</span></strong>: Es el estado por defecto de todos los alumnos al abrir un día nuevo.</li>
                                <li><strong><span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">A (Ausente)</span></strong>: Haz un clic en la &apos;P&apos; para marcar la falta.</li>
                                <li><strong><span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">AJ (Ausente Justificado)</span></strong>: Haz un clic adicional sobre la &apos;A&apos;. El sistema no contará esta inasistencia negativamente en el porcentaje final del alumno.</li>
                            </ul>
                            <p>El porcentaje de asistencia que ves junto al nombre del estudiante se actualiza en tiempo real tomando en cuenta el total de clases dictadas.</p>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 4 */}
                    <section id="calificaciones" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-blue-400">
                            <BarChart2 size={32} /> <h2>4. Notas, Promedios e Intensificación</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>La pestaña <strong>Notas</strong> es el corazón matemático de Agenda.doc.</p>

                            <h3 className="text-white text-lg font-bold mt-4 mb-2">Columnas de Calificación</h3>
                            <p>Al crear una nota, debes asignarle una fecha y un título (Ej: <em>Prueba Unidad 1</em>). Dependiendo de la fecha, el sistema automáticamente colocará esa columna en el Primer, Segundo o Tercer período.</p>

                            <h3 className="text-white text-lg font-bold mt-4 mb-2">Tipos de Valoración</h3>
                            <ul className="list-disc pl-6">
                                <li><strong>Numéricas (1 al 10):</strong> El algoritmo redondeará automáticamente usando un sistema estándar (Ej. 6.66 se redondea a 7. Todo cuenta a partir de .50).</li>
                                <li><strong>Cualitativas:</strong> Puedes escribir TEA, TEP o TED según requiera el sistema provincial.</li>
                            </ul>

                            <h3 className="text-white text-lg font-bold mt-4 mb-2">Sobrescribir Promedios Finales</h3>
                            <p>A final de cuatrimestre verás una columna negra que calcula el &quot;Promedio Automático&quot;. Si consideras que la nota matemática no refleja todo el desempeño del chico (esfuerzo, concepto), puedes <strong>hacer clic en la nota sugerida</strong> y escribir manualmente la nota de cierre que desees. La app la resaltará en amarillo para recordar tu intervención.</p>

                            <h3 className="text-white text-lg font-bold mt-4 mb-2">Intensificación (Adelantamiento)</h3>
                            <p>Cuando termina el año, la aplicación revisa quién no alcanzó el objetivo mínimo. Si un estudiante desaprueba el ciclo completo, aparecerá un botón rojo de <strong>A Intensificación</strong> en su tarjeta, abriendo un historial permanente para que registres sus intentos de recuperación (diciembre, marzo, etc.) fuera de la cuadrícula normal de clases.</p>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 5 */}
                    <section id="adaptaciones" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-rose-400">
                            <UserCog size={32} /> <h2>5. Proyectos Curriculares Inclusivos (PPI)</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>La sección <strong>Adaptaciones Curriculares</strong> en el menú lateral principal te permite redactar Proyectos Pedagógicos Individuales (PPI) para estudiantes con necesidades específicas.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Puedes elegir al alumno del listado y escribir qué configuraciones de apoyo y estrategias de evaluación requiere (Ej: Más tiempo de examen, texto macrotipo, etc).</li>
                                <li>El sistema agrupará estos perfiles para que siempre tengas presentes sus modalidades de evaluación sin tener que cargar libretas extras.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 6 */}
                    <section id="calendario" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-indigo-400">
                            <Calendar size={32} /> <h2>6. Calendario Interactivo de Clases</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>Encuentra el <strong>Calendario</strong> en tu menú lateral. Esta poderosa herramienta funciona como una agenda visual de escritorio.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Haz clic en cualquier celda para agregar un <strong>Evento</strong> (Ej. &quot;Reunión de Personal&quot;) o una <strong>Clase planificada</strong> (vinculando la actividad a un curso en específico).</li>
                                <li>Puedes arrastrar los bloques de clases creados de un día al otro fácilmente con el mouse si tus fechas cambian imprevistamente.</li>
                                <li>Los eventos se guardan en el servidor, por lo que no se perderán sin importar en qué dispositivo abras la aplicación.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 7 */}
                    <section id="plano" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-teal-400">
                            <Layout size={32} /> <h2>7. Diagramar el Plano del Aula</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>Si sufres por no recordar nombres o tus alumnos siempre se cambian de lugar, utiliza el <strong>Plano del Aula</strong> (Novedad Visual).</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Entra a la sección Plano del Aula, elige tu Materia.</li>
                                <li>Juega con los parámetros numéricos de <em>Filas, Columnas y Pasillos</em> para recrear físicamente el aula.</li>
                                <li>Haz un <strong>Clic en el panel del alumno (Izquierda)</strong> y luego un <strong>Clic en un asiento vacío de la grilla</strong> para &quot;sentarlo&quot;.</li>
                            </ul>

                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg my-6">
                                <p className="text-indigo-200"><strong>🖨️ Sobre la Impresión Apaisada:</strong> Al cliquear &quot;Imprimir Mapa&quot;, el navegador forzará automáticamente el layout de la hoja a <em>Formato Horizontal (Landscape)</em>. Todo el plano del aula se encogerá proporcionalmente para garantizar que la última fila de escritorios no se vea cortada ni deformada en la hoja física.</p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 8 */}
                    <section id="planificaciones" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-pink-400">
                            <PenTool size={32} /> <h2>8. Planificaciones Anuales a PDF</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>Evita los dolores de cabeza de Microsoft Word. Con el constructor integrado, ve a <strong>Borradores Escolares &gt; Planificaciones</strong>.</p>
                            <p>Utilizando un procesador de texto dinámico y enriquecido (puedes poner negritas, viñetas, cursivas), rellena la Fundamentación, los Propósitos y la Estrategia Didáctica de tu materia. Cuando finalices, un solo clic empaquetará todo en una hoja de estilo formal y lista para exportar nativamente en formato PDF.</p>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 9 */}
                    <section id="informes" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-cyan-400">
                            <FileText size={32} /> <h2>9. Informes de Trayectoria y Excel</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <h3 className="text-white text-lg font-bold mt-4 mb-2">Exportaciones Totales</h3>
                            <p>Si la directiva escolar te pide la famosa &quot;planilla sábana&quot;, dirígete al tablero de tu materia, busca la sección &quot;Sábanas / Exportaciones Excel&quot; (Botón superior) y descarga en un segundo todo el padrón de chicos junto con sus notas de los tres trimestres en un archivo <code>.xlsx</code> hermosamente formateado.</p>

                            <h3 className="text-white text-lg font-bold mt-4 mb-2">Gráficas Visuales</h3>
                            <p>En el panel general <strong>Estadísticas</strong> puedes revisar mediante gráficos de dona (Pie Charts) cuántos desaprobados estadísticos tuviste en un trimestre. Ideal para entender la situación de un curso complicado a simple vista.</p>
                        </div>
                    </section>

                    <hr className="border-glass-border" />

                    {/* SECTION 10 */}
                    <section id="suscripcion" className="scroll-mt-12">
                        <div className="flex items-center gap-4 mb-6 text-2xl font-bold text-emerald-500">
                            <CreditCard size={32} /> <h2>10. Configuración de Pagos y Suscripción</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4">
                            <p>Agenda.doc Premium funciona mediante una suscripción anual procesada de forma segura por <strong>Mercado Pago</strong>.</p>
                            <p>Para revisar hasta qué día tienes activa tu membresía, solucionar pagos pendientes, renovarla o darla de baja, haz clic en <strong>Perfil</strong> (Tu correo electrónico abajo a la izquierda en el menú lateral) y encontrarás las credenciales de abono integradas allí.</p>
                            <p>Nota: Al pagar, el impacto en cuenta suele tardar menos de 5 segundos. Es posible que el sistema te pida refrescar (F5) para habilitar los beneficios.</p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
