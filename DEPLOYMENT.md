# Guía de Publicación y Escalabilidad

## 1. Escalabilidad de la Aplicación
Actualmente, tu aplicación utiliza **Supabase (PostgreSQL)** como base de datos y **Next.js** para el frontend.

- **Base de Datos**: PostgreSQL puede manejar **millones de registros** y miles de usuarios concurrentes sin problemas. La infraestructura de data es muy sólida.
- **Frontend (Interfaz)**: La aplicación carga todos los datos del usuario al iniciar (`DataContext`).
    - **Capacidad Actual**: Funciona perfectamente para uso individual docente o institucional moderado (cientos de alumnos, decenas de cursos).
    - **Límite Teórico**: Si un solo usuario tuviera accedeso a **miles de alumnos** simultáneamente, la carga inicial podría volverse lenta.
    - **Solución Futura**: Si la app crece masivamente, se puede implementar "paginación" (cargar datos por partes) para soportar almacenamiento ilimitado sin afectar la velocidad.

**Resumen**: Para el uso previsto (docentes y escuelas), la capacidad es **virtualmente ilimitada** en cuanto a almacenamiento, y muy alta en concurrencia.

---

## 2. Pasos para Publicar (Deploy)
La forma más sencilla y profesional de publicar tu app Next.js es usando **Vercel** (los creadores de Next.js).

### Requisitos Previos
1.  **Código en GitHub**: Asegúrate de que tu código esté subido a un repositorio de GitHub.
2.  **Cuenta en Vercel**: Crea una cuenta gratuita en [vercel.com](https://vercel.com).

### Pasos de Configuración en Vercel
1.  **Nuevo Proyecto**: En Vercel, haz clic en "Add New..." -> "Project".
2.  **Importar Git**: Selecciona tu repositorio de GitHub `Agenda.doc`.
3.  **Configurar Build**: Vercel detectará automáticamente que es Next.js.
    - Framework Preset: `Next.js`
    - Root Directory: `./` (déjalo como está)
4.  **Variables de Entorno (Environment Variables)**:
    Esto es **CRÍTICO**. Debes copiar las claves de tu archivo `.env.local` a Vercel.
    Despliega la sección "Environment Variables" y agrega:
    
    | Key | Value |
    |-----|-------|
    | `NEXT_PUBLIC_SUPABASE_URL` | *Tu URL de Supabase (ej: https://xyz.supabase.co)* |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Tu clave pública de Supabase* |

5.  **Deploy**: Haz clic en "Deploy". Vercel construirá tu sitio y te dará una URL (ej: `agenda-doc.vercel.app`).

### Pasos Finales en Supabase
1.  **Autenticación**: Ve a tu panel de Supabase -> Authentication -> URL Configuration.
2.  **Site URL**: Cambia `http://localhost:3000` por tu nueva URL de Vercel (ej: `https://agenda-doc.vercel.app`).
3.  **Redirect URLs**: Asegúrate de agregar también `https://agenda-doc.vercel.app/**` para que funcionen los redireccionamientos de login.

¡Listo! Tu aplicación estará accesible desde cualquier lugar del mundo.
