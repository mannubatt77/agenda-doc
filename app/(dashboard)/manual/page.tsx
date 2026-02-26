"use client";

import { ArrowLeft, BookOpen, Settings, Users, BarChart2, CheckCircle, PenTool, Layout, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManualPage() {
    const router = useRouter();

    const sections = [
        {
            title: "1. Escuelas y Materias (El primer paso)",
            icon: <BookOpen className="text-blue-400" size={24} />,
            description: "Para comenzar a usar Agenda.doc, lo primero que necesitas es cargar tus espacios de trabajo.",
            steps: [
                "Ve a la sección 'Escuelas y Materias' desde el menú lateral.",
                "Haz clic en el botón '+' para crear un Establecimiento (ej: E.E.S N° 1). Selecciona si es trimestral o cuatrimestral y graba las fechas de cada período.",
                "Una vez creada la escuela, entra en ella y agrega tus Materias (ej: Prácticas del Lenguaje, 3°A).",
                "Puedes configurar los horarios de cada materia para verlos más tarde en tu calendario."
            ]
        },
        {
            title: "2. Cargar tus Alumnos y Curso",
            icon: <Users className="text-green-400" size={24} />,
            description: "Después de crear tus materias, necesitas llenarlas con tus alumnos para poder evaluarlos o tomar asistencia.",
            steps: [
                "En 'Escuelas y Materias', haz clic sobre el nombre de una materia para entrar a su 'Tablero Rápido'.",
                "En la pestaña 'Alumnos', puedes agregar a tus estudiantes uno por uno ingresando su Nombre, Apellido y Condición (Regular o Recursante).",
                "Si un alumno deja de ir, puedes cambiar su condición a 'No puede cursar' para no tenerlo en cuenta en los promedios ni asistencias.",
            ]
        },
        {
            title: "3. Tomar Asistencia Diaria",
            icon: <CheckCircle className="text-purple-400" size={24} />,
            description: "Una de las funciones principales es llevar un control riguroso de presentismo para el cierre de libretas.",
            steps: [
                "Dentro del tablero de una materia, ve a la pestaña 'Asistencia'.",
                "Elige la fecha haciendo clic en los botones de 'Día Anterior' o 'Día Siguiente'.",
                "Haz clic rápidamente sobre el botón verde 'P' (Presente) al lado de un alumno para marcarlo ausente (se volverá rojo 'A').",
                "Si el alumno justificó su falta, presiona el botón 'A' nuevamente y permite convertirlo en 'AJ' (Ausente Justificado)."
            ]
        },
        {
            title: "4. Evaluaciones y Notas",
            icon: <BarChart2 className="text-amber-400" size={24} />,
            description: "Registra evaluaciones numéricas y cualitativas de forma instantánea.",
            steps: [
                "Para notas del día a día o exámenes, ve a la pestaña 'Notas' dentro de la Materia.",
                "Selecciona en qué Trimestre/Cuatrimestre estás evaluando, la fecha, y escribe de qué se trata la nota (ej: Evaluación Unidad 1).",
                "Puedes ingresar notas numéricas del 1 al 10, o cualitativas (TEA, TEP, TED).",
                "La app calculará un 'Promedio Final' matemáticamente por cada período a medida que vayas llenando sus notas."
            ]
        },
        {
            title: "5. Planificaciones Anuales",
            icon: <PenTool className="text-indigo-400" size={24} />,
            description: "Crea y exporta en PDF tus diseños curriculares anuales directamente desde la app.",
            steps: [
                "Ve al menú lateral 'Planificaciones' y haz clic en 'Nueva Planificación'.",
                "Escribe un título (Ej: Planificación Anual Prácticas del Lenguaje) y vinculá la planificación a una de tus Materias con el menú desplegable.",
                "Escribe utilizando el editor de texto en las distintas pestañas (Fundamentación, Objetivos, etc) y aprieta Guardar.",
                "Haz clic en el botón 'PDF' para abrir la ventana de impresión, asegúrate de tener la opción 'Guardar como PDF' y el programa te escupirá la estructura formal rellenada por ti."
            ]
        },
        {
            title: "6. Plano del Aula Visual",
            icon: <Layout className="text-teal-400" size={24} />,
            description: "Guarda la ubicación exacta de los chicos en el salón con el sistema visual.",
            steps: [
                "En el menú lateral, dirígete a 'Plano del Aula'.",
                "Selecciona la Institución y la Materia de la que quieras armar el plano.",
                "Utiliza los controles numéricos para elegir cuántas Filas, Columnas y Pasillos tiene el aula de forma física.",
                "Arrastra y suelta (o haz clic) en los alumnos del panel derecho hacia los bancos libres de la cuadrícula para dejarlos asignados.",
                "Haz clic en 'Imprimir Mapa' para exportar una versión de hoja de papel con los nombres ya grabados en sus asientos."
            ]
        },
        {
            title: "7. Informes de Trayectoria e Intensificaciones",
            icon: <FileText className="text-rose-400" size={24} />,
            description: "Gestión avanzada de burocracia escolar.",
            steps: [
                "Puedes exportar toda la base de datos completa de un curso en formato 'Excel con Pestañas' presionando en 'Exportaciones' dentro de su Tablero.",
                "En la sección 'Inf. Trayectorias' puedes ver estadísticas comparativas de notas por alumno por trimestre.",
                "Si un chico desaprobó la materia (promedio menor a 7), aparecerá automáticamente un botón para enviarlo a 'Previas' o 'Intensificación', que dejará un registro por fuera en el sistema sin importar que pase el año."
            ]
        }
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto pb-32">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-gray-400 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Manual de Usuario</h1>
                    <p className="text-gray-400 mt-1">Guía paso a paso para configurar y entender Agenda.doc</p>
                </div>
            </div>

            <div className="space-y-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                                {section.icon}
                            </div>
                            <h2 className="text-xl font-bold">{section.title}</h2>
                        </div>
                        <p className="text-gray-300 mb-6 text-lg">{section.description}</p>

                        <div className="pl-4 border-l-2 border-indigo-500/30">
                            {section.steps.map((step, stepIdx) => (
                                <div key={stepIdx} className="flex gap-4 mb-4 last:mb-0 items-start">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold mt-0.5">
                                        {stepIdx + 1}
                                    </span>
                                    <p className="text-gray-300 leading-relaxed max-w-3xl">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl text-center">
                <Settings className="mx-auto mb-4 text-indigo-400" size={32} />
                <h3 className="text-lg font-bold mb-2">¿Necesitas ayuda adicional o quieres cancelar?</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Recuerda que puedes gestionar todos los detalles sobre tu suscripción, actualizar pagos recurrentes de MercadoPago, o cerrar tu sesión ingresando a la rueda de configuración de &quot;Perfil&quot; (botón superior derecho o en el menú).
                </p>
                <div className="mt-6 text-sm text-gray-500">
                    Sistema Agenda.doc — v1.0.0
                </div>
            </div>
        </div>
    );
}
