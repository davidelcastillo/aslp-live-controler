# 🏋️ ASLP Powerlifting Live Controller

> **Aplicación web para controlar gráficos en tiempo real durante transmisiones de powerlifting en OBS.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwind-css)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5-pink)
![Supabase](https://img.shields.io/badge/Supabase-Live%20Realtime-green?logo=supabase)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://powerlifting-controller.vercel.app)

## 🌐 Producción

**URL:** [https://powerlifting-controller.vercel.app](https://powerlifting-controller-6ixiuov3m-davidelcastillos-projects.vercel.app/)

---

## 🎯 ¿Qué es esto?

ASLP Powerlifting Live Controller es una aplicación diseñada para **operadores de transmisiones en vivo** de competencias de powerlifting. Permite:

- **Gestionar atletas**: agregar, eliminar, filtrar por categoría y peso
- **Controlar intentos en tiempo real**: marcar intentos como válidos, nulos o pendientes
- **Emitir datos al instante** a un "Browser Source" de OBS mediante **Supabase Realtime**
- **Panel de control dedicado** para manejar la transmisión mientras el overlay se muestra en OBS

## 🧠 Proyecto 100% desarrollado con IA

Este proyecto fue **desarrollado íntegramente con asistencia de inteligencia artificial**, aplicando las mejores prácticas de desarrollo moderno:

- **Arquitectura limpia** con componentes React separados por responsabilidad
- **TypeScript estricto** con tipos autogenerados de Supabase
- **Testing automatizado** con Vitest + Testing Library
- **CSS-first con Tailwind v4** y DaisyUI v5 para la UI
- **Supabase Realtime** para sincronización en tiempo real sin WebSocket manual

> El desarrollo fue coordinado por un **AI Orchestrator** que delega tareas especializadas a sub-agentes, aplicando metodología **SDD (Spec-Driven Development)** para features grandes y **delegación directa** para cambios menores.

## 🏗️ Tech Stack

| Capa | Tecnología | Uso |
|------|-----------|-----|
| Frontend | **Next.js 16** (App Router) | Framework React con Server Components |
| UI | **React 19** | Componentes interactivos |
| Estilos | **Tailwind CSS v4** + **DaisyUI v5** | CSS utility-first + componentes pre-armados |
| Backend | **Supabase** | Auth, DB PostgreSQL, Realtime |
| Tiempo real | **Supabase Realtime Channels** | Sincronización instantánea OBS ↔ Control Panel |
| Testing | **Vitest** + **Testing Library** | Unit & integration tests |
| Lenguaje | **TypeScript** | Tipado estricto |

## 🚀 Cómo correr el proyecto

### Requisitos previos

- **Node.js** 18+ 
- **npm** o **yarn**
- Una cuenta de **Supabase** con un proyecto creado

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/powerlifting-controller.git
cd powerlifting-controller
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Creá un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aquí
```

### 4. Configurar la base de datos en Supabase

Ejecutá los migrations SQL que se encuentran en `supabase/migrations/` o creá las tablas manualmente:

- `athletes` — datos de cada atleta (nombre, apellido, categoría, peso, etc.)
- `attempts` — intentos por movimiento (SQ, BP, DL) con peso y estado
- `live_state` — fila única que indica qué atleta y movimiento están activos en plataforma

### 5. Correr en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**

### 6. Correr tests

```bash
npm test
```

### 7. Build para producción

```bash
npm run build
npm start
```

## 📂 Estructura del proyecto

```
├── .github/workflows/     # GitHub Actions (CI/CD)
├── src/
│   ├── app/
│   │   ├── page.tsx       # Página principal (panel de control)
│   │   ├── login/         # Página de autenticación
│   │   ├── globals.css    # Estilos globales + Tailwind + DaisyUI
│   │   └── layout.tsx     # Layout raíz (fonts, providers)
│   ├── components/
│   │   ├── AthleteList.tsx      # Lista y gestión de atletas
│   │   ├── AttemptsEditor.tsx   # Editor de intentos (peso, estado)
│   │   ├── LiveController.tsx   # Control de transmisión en vivo
│   │   ├── AuthProvider.tsx     # Contexto de autenticación
│   │   └── SupabaseProvider.tsx # Contexto de Supabase
│   ├── img/               # Imágenes (logo ASLP, etc.)
│   ├── lib/
│   │   └── supabase.ts    # Cliente Supabase configurado
│   └── test/              # Tests de integración y layout
├── types/
│   └── supabase.ts        # Tipos TypeScript autogenerados
├── postcss.config.mjs     # PostCSS (Tailwind v4)
├── vitest.config.ts       # Configuración de tests
└── next.config.ts         # Configuración de Next.js
```

## 🎥 Uso con OBS

1. **Abrí la aplicación** en el navegador como operador
2. **Agregá atletas** con su categoría y peso
3. **Controlá los intentos** desde el panel central (LiveController)
4. **En OBS**, agregá un "Browser Source" apuntando a la URL de tu overlay
5. Los cambios se reflejan **en tiempo real** gracias a Supabase Realtime

## 🔒 Seguridad

- **Row Level Security (RLS)** en Supabase
- El cliente OBS (sin autenticar) solo tiene permisos de **SELECT**
- El panel de control requiere **autenticación** para realizar **UPDATE**

## 📄 Licencia

Proyecto privado de **ASLP Powerlifting** — todos los derechos reservados.

---

*Desarrollado con 🤖 inteligencia artificial aplicada — coordinado por un AI Orchestrator con metodología SDD.*
