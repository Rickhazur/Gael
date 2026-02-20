# 🚀 Nova Schola Elementary

<div align="center">

![Nova Schola Logo](public/logo.png)

**Plataforma Educativa con IA de Próxima Generación**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/tests-vitest-8B5CF6)](docs/PARA_EVALUADORES.md#2-tests-automatizados)

[Demo en Vivo](https://novaschola.com) • [Documentación](docs/) • [Reportar Bug](https://github.com/novaschola/issues)

**Para evaluadores:** [docs/PARA_EVALUADORES.md](docs/PARA_EVALUADORES.md) · [Checklist 9+](docs/SCORE_9_CHECKLIST.md) — Cómo probar, tests, estado de integraciones.

</div>

---

## 📖 Índice

- [Para evaluadores](docs/PARA_EVALUADORES.md)
- [Acerca de](#-acerca-de)
- [Características Únicas](#-características-únicas)
- [Tecnologías](#️-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🌟 Acerca de

**Nova Schola Elementary** es una plataforma educativa revolucionaria que utiliza Inteligencia Artificial para transformar la experiencia de aprendizaje de estudiantes de primaria. Con tutoras virtuales personalizadas, generación automática de contenido visual, y un sistema de gamificación completo, Nova Schola hace que aprender sea divertido, efectivo y personalizado.

### 🎯 Misión

Democratizar el acceso a educación de calidad mundial mediante tecnología de punta, haciendo que cada estudiante tenga su propio tutor personal disponible 24/7.

### 🏆 Diferenciadores Clave

- **🎨 Asistente Visual Inteligente**: ÚNICO en el mercado - detecta automáticamente conceptos en las notas del estudiante y genera imágenes educativas contextuales
- **👩‍🏫 Tutoras Personalizadas**: Lina (Matemáticas/Ciencias) y Rachelle (Inglés) con voces naturales y personalidades únicas
- **📚 Biblioteca 3D de Cuadernos**: Organización visual de notas con cuadernos personalizables por materia
- **🎮 Gamificación Completa**: Sistema de misiones, recompensas, avatares y progreso

---

## ✨ Características Únicas

### 🎨 Asistente Visual Inteligente

```
Estudiante escribe: "La célula tiene núcleo, citoplasma..."
    ↓
IA detecta concepto visualizable
    ↓
Lina aparece: "¿Quieres que genere una imagen?"
    ↓
Genera diagrama educativo con labels
    ↓
Imagen insertada automáticamente en nota
```

**Ninguna otra plataforma educativa tiene esto.**

### 👩‍🏫 Tutoras con IA

#### Lina - Matemáticas y Ciencias
- Voz natural en español (ElevenLabs)
- Explicaciones paso a paso
- Detección de errores comunes
- Ayudas visuales para conceptos abstractos

#### Rachelle - Inglés
- Voz natural en inglés
- Práctica de conversación
- Corrección de pronunciación
- Construcción de vocabulario

### 📚 Biblioteca de Cuadernos

- **Cuadernos 3D**: Portadas personalizables con colores y emojis
- **Organización Automática**: Por materia, fecha, tema
- **Búsqueda Inteligente**: Encuentra notas al instante
- **Galería de Imágenes**: Todas las imágenes generadas organizadas

### 🎮 Sistema de Gamificación

- **Misiones Diarias**: Tareas adaptadas al nivel del estudiante
- **Sistema de Recompensas**: Monedas Nova, experiencia, logros
- **Avatar Personalizable**: Accesorios desbloqueables
- **Tabla de Clasificación**: Competencia amistosa

### 🔬 Módulos Educativos

#### Math Maestro
- Práctica interactiva de operaciones
- Explicaciones visuales de llevadas/préstamos
- Problemas adaptativos
- Retroalimentación inmediata

#### English Tutor
- Práctica de conversación con IA
- Story Builder para creatividad
- Puzzle Timeline para comprensión
- Reconocimiento de voz

#### Centro de Investigación (Research Lab)
- **Todas las materias**: Matemáticas, Ciencias, Historia, Geografía, Arte
- Búsqueda con IA sobre cualquier tema
- Generación de reportes completos
- Exportación a PDF
- Integración con cuadernos
- Fuentes verificadas y apropiadas para primaria

#### Tarjetas Mágicas
- Generación automática de flashcards
- Algoritmo de repetición espaciada
- Seguimiento de progreso
- Modo de estudio

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication

### IA & APIs
- **Google Gemini 1.5** - Motor principal: tutoría, Research Center, detección de conceptos
- **Pollinations.ai** - Imágenes educativas (Nano Banana Pro, Asistente Visual)
- **ElevenLabs** - Voces naturales para Lina y Rachelle (opcional)
- **Web Speech API** - Reconocimiento de voz

> **Estado de integraciones** (Google Classroom, etc.): [docs/INTEGRATIONS_STATUS.md](docs/INTEGRATIONS_STATUS.md)

### PWA & Performance
- **Service Worker** - Offline support
- **Web App Manifest** - Installable app
- **Lazy Loading** - Code splitting
- **Image Optimization** - WebP format

---

## 🚀 Instalación

### Prerrequisitos

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Clonar Repositorio

```bash
git clone https://github.com/novaschola/nova-schola-elementary.git
cd nova-schola-elementary
```

### Instalar Dependencias

```bash
npm install
```

### Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Supabase (requerido para guardar datos)
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# IA: motor principal Google Gemini (recomendado)
VITE_GOOGLE_GEMINI_API_KEY=tu_gemini_key

# Imágenes: Pollinations.ai (gratuito) o OpenAI opcional
# VITE_OPENAI_API_KEY=opcional

# ElevenLabs (opcional, voces Lina/Rachelle)
VITE_ELEVENLABS_API_KEY=tu_elevenlabs_api_key

# Google Classroom (opcional; ver docs/INTEGRATIONS_STATUS.md)
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_GOOGLE_CLIENT_SECRET=tu_google_client_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Ejecutar Base de Datos

```bash
# Ejecutar migraciones en Supabase SQL Editor
# Archivos en /supabase/*.sql
```

### Iniciar Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3001](http://localhost:3001) (o el puerto que indique Vite).

### Tests

```bash
npm run test
```

Tests de datos críticos: mundos Arena, misiones, quests pedagógicas, mapeo mission→quest, y helpers de contenido personalizado para inglés. Ver [docs/PARA_EVALUADORES.md](docs/PARA_EVALUADORES.md#2-tests-automatizados).

Para pruebas end‑to‑end (Playwright) de los flujos principales (login demo, campus, navegación a Tutor de Matemáticas, Tutor de Inglés, Centro de Investigación, Arena, Misiones, Biblioteca de Cuadernos y Tienda Nova):

```bash
npm run test:e2e
```

### Build de Producción

```bash
npm run build
npm run preview   # previsualizar build
```

---

## 📱 Uso

### Modo Demo

```bash
# En la landing page, click en "VER DEMO INTERACTIVA"
# Explora todas las funciones sin registro
```

### Registro de Estudiante

1. Click en "Crear cuenta"
2. Ingresar nombre, email, teléfono del tutor, contraseña
3. Personalizar avatar
4. ¡Comenzar a aprender!

### Crear Cuaderno

1. Ir a Biblioteca de Cuadernos
2. Click en "+ Nuevo Cuaderno"
3. Elegir título, materia, color, emoji
4. ¡Empezar a tomar notas!

### Generar Imagen Educativa

1. Escribir nota sobre un concepto (ej: "La célula")
2. Esperar sugerencia de Lina/Rachelle
3. Click en "Generar imagen"
4. Imagen insertada automáticamente

---

## 🏗️ Arquitectura

```
nova-schola-elementary/
├── components/          # Componentes React
│   ├── Campus/         # Vista del campus
│   ├── MathMaestro/    # Math Maestro module
│   ├── Notebook/       # Sistema de cuadernos
│   └── ...
├── pages/              # Páginas principales
├── services/           # Servicios (API, Supabase, IA)
├── hooks/              # Custom React hooks
├── lib/                # Utilidades
├── supabase/           # Schemas y migraciones
├── public/             # Assets estáticos
└── docs/               # Documentación
```

### Flujo de Datos

```
Usuario → React Component → Service Layer → API/Supabase → Database
                ↓
         State Management (React Hooks)
                ↓
         UI Update (Framer Motion)
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

### Proceso

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Estilo

- **TypeScript**: Strict mode enabled
- **React**: Functional components + hooks
- **CSS**: Tailwind utility classes
- **Commits**: Conventional Commits

---

## 📊 Roadmap

### Q1 2026
- [ ] Tutoras especializadas adicionales (Arte, Música)
- [ ] Modo práctica avanzado con ejercicios adaptativos
- [ ] Integración con más LMS (Canvas, Moodle, Microsoft Teams)
- [ ] App móvil nativa (React Native)
- [ ] Dashboard de analytics para padres y profesores

### Q2 2026
- [ ] Modo colaborativo (estudiar con amigos)
- [ ] Tutorías en vivo con profesores reales
- [ ] Certificaciones y diplomas digitales
- [ ] API pública para desarrolladores
- [ ] Marketplace de contenido educativo

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo

- **Desarrollo**: [Tu Nombre](https://github.com/tu-usuario)
- **Diseño**: Nova Schola Design Team
- **IA/ML**: Nova Schola AI Lab

---

## 📞 Contacto

- **Website**: [novaschola.com](https://novaschola.com)
- **Email**: contacto@novaschola.com
- **Twitter**: [@NovaSchola](https://twitter.com/NovaSchola)
- **LinkedIn**: [Nova Schola](https://linkedin.com/company/novaschola)

---

## 🙏 Agradecimientos

- OpenAI por GPT-4 y DALL-E
- ElevenLabs por voces naturales
- Supabase por backend increíble
- Comunidad open-source

---

<div align="center">

**Hecho con ❤️ para transformar la educación**

⭐ Si te gusta este proyecto, dale una estrella en GitHub

</div>
