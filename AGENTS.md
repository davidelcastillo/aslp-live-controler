# Project Overview

Nombre: ASLP Powerlifting Live Controller (Supabase Edition)
Descripción: Aplicación web para controlar gráficos en tiempo real en OBS. Permite a un operador gestionar datos de atletas e intentos y emitirlos instantáneamente a un "Browser Source" de OBS utilizando las capacidades de Supabase Realtime.
Entorno: Cloud/Híbrido (Next.js alojado/local + Supabase alojado).

# Tech Stack

- Framework: Next.js (App Router).
- Backend & Real-time: Supabase (PostgreSQL + Supabase Realtime Channels).
- Database ORM/Client: Supabase JS Client (`@supabase/supabase-js`).
- Lenguaje: TypeScript.
- Estilos UI Control: Tailwind CSS.
- Estilos OBS Overlay: CSS Puro (referenciado en Skills).

# Skills (Mapas de Conocimiento)

El agente debe consultar obligatoriamente los archivos en estas rutas antes de implementar la funcionalidad correspondiente:

- **Estética Overlay OBS:** `.agents/skills/overlay/overlay_design.md` (Contiene el HTML/CSS original con variables como `--aslp-red-dark` y la estructura exacta del DOM que NO debe ser alterada, solo adaptada para inyectar datos).
- **Next.js Best Practices:** `.agents/skills/next-best-practices/suspense-boundaries.md` (Contiene las mejores prácticas para el uso de Suspense en Next.js).
- **Supabase Best Practices:** `.agents/skills/supabase-postgres-best-practices/` (Contiene las mejores prácticas para el uso de Supabase en Next.js).
- **Frontend Design:** `.agents/skills/frontend-design/SKILL.md` (Contiene las mejores prácticas para el diseño de interfaces en Next.js).
- **Vercel React Best Practices:** `.agents/skills/vercel-react-best-practices/` (Contiene las mejores prácticas para el diseño de interfaces en Next.js).
- **Webapp Testing:** `.agents/skills/webapp-testing/` (Contiene las mejores prácticas para el diseño de interfaces en Next.js).
- **Next.js Plugin:** `.agents/skills/nextjs/` (Contiene las mejores prácticas para el diseño de interfaces en Next.js).
- **Tailwind CSS Best Practices:** `.agents/skills/tailwind-css-best-practices/` (Contiene las mejores prácticas para el diseño de interfaces en Next.js).

# Data Structure Requirements

El esquema de PostgreSQL en Supabase debe contemplar:

- Perfil: Nombre, Apellido, Club, Categoría, CatPeso, Altura Rack.
- Movimientos (Peso e ID de Estado [Nulo, Válido, Fallo, Pendiente]):
  - Squat (SQ): Intentos 1, 2, 3.
  - Bench Press (BP): Intentos 1, 2, 3.
  - Deadlift (DL): Intentos 1, 2, 3.
- Estado Global: Fila única para gestionar qué atleta y qué movimiento están activos "en plataforma" en este instante.

# Build and Test Commands

- Instalar: `npm install`
- Configuración: Crear archivo `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Generar tipos TS de Supabase: `npx supabase gen types typescript --project-id tu-proyecto > types/supabase.ts`
- Desarrollo: `npm run dev`

# Code Style Guidelines

- TypeScript estricto con los tipos autogenerados de Supabase.
- Suscripción a cambios del lado del cliente usando canales: `supabase.channel('custom-all-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'atletas' }, payload => { ... }).subscribe()`

# Security Considerations

- RLS (Row Level Security): Configurar políticas en Supabase para que el cliente OBS (sin autenticar) solo tenga permisos de `SELECT`, mientras que el panel de control requiere estar autenticado para realizar `UPDATE`.
