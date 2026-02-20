# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Mejoras para calidad y evaluación (score 9+)

- **Tests automatizados**: Vitest para `adventureWorlds`, `pedagogicalQuests`, `arenaMissionToQuest`. Ejecutar con `npm run test`.
- **Documentación**: `docs/INTEGRATIONS_STATUS.md` (estado Google Classroom, IA), `docs/PARA_EVALUADORES.md` (guía rápida para evaluadores).
- **Mapeo Arena centralizado**: `data/arenaMissionToQuest.ts` como única fuente de verdad missionId→questId; tests de coherencia.
- **Mensajes de error centralizados**: `utils/errorMessages.ts` para mensajes ES/EN consistentes; uso en Centro de Misiones y Google Classroom Sync.
- **Referencias legacy**: `services/openai.ts` como re-export de `ai_service` (Gemini) para compatibilidad con report-buddy y otros.
- **README**: badge Tests, sección Testing y Build, .env actualizado (Gemini como motor principal).
- **.env.example**: comentarios por sección (requeridos, IA, opcionales).

---

## [1.0.0] - 2026-01-11

### 🎉 Lanzamiento Inicial

Primera versión completa de Nova Schola Elementary con todas las características principales.

### ✨ Agregado

#### Características Principales
- **Asistente Visual Inteligente**: Detección automática de conceptos visualizables en notas con generación de imágenes educativas mediante IA
- **Biblioteca de Cuadernos 3D**: Sistema completo de organización de notas con cuadernos personalizables
- **Tutoras con IA**: Lina (Matemáticas/Ciencias) y Rachelle (Inglés) con voces naturales y personalidades únicas
- **Sistema de Gamificación**: Misiones, recompensas, avatares personalizables, y progreso

#### Módulos Educativos
- **Math Maestro**: Práctica interactiva de matemáticas con explicaciones visuales
- **English Tutor**: Práctica de conversación, Story Builder, Puzzle Timeline
- **Centro de Investigación (Research Lab)**: Búsqueda con IA para TODAS las materias (Matemáticas, Ciencias, Historia, Geografía, Arte)
- **Tarjetas Mágicas**: Flashcards generadas automáticamente

#### Infraestructura
- **PWA Completo**: App installable con soporte offline
- **Service Worker**: Caché inteligente y actualizaciones automáticas
- **Meta Tags SEO**: Optimización completa para motores de búsqueda
- **Responsive Design**: Funciona en móvil, tablet y desktop

#### UI/UX
- **404 Page**: Página de error personalizada y amigable
- **Loading Skeletons**: Estados de carga profesionales
- **Error Boundaries**: Manejo elegante de errores
- **Offline Page**: Experiencia offline con auto-reconexión

#### Backend
- **Supabase Integration**: Base de datos PostgreSQL con RLS
- **Real-time Subscriptions**: Actualizaciones en tiempo real
- **Authentication**: Sistema completo de autenticación
- **Google Classroom**: Integración con Google Classroom

#### APIs de IA
- **OpenAI GPT-4**: Tutoras inteligentes y generación de contenido
- **DALL-E 3**: Generación de imágenes educativas
- **ElevenLabs**: Voces naturales para Lina y Rachelle
- **Web Speech API**: Reconocimiento de voz

### 🔧 Técnico

#### Performance
- Lazy loading de componentes pesados
- Code splitting por rutas
- Optimización de imágenes (WebP)
- Preconnect a recursos externos

#### Seguridad
- Row Level Security (RLS) en Supabase
- Sanitización de inputs
- Variables de entorno protegidas
- Headers de seguridad

#### Accesibilidad
- ARIA labels en componentes interactivos
- Navegación por teclado
- Contraste de colores WCAG AA
- Focus visible

### 📚 Documentación
- README completo con guías de instalación
- CONTRIBUTING.md con guías de contribución
- Documentación de implementación de características
- Guías de demo y presentación

---

## [0.9.0] - 2026-01-10

### ✨ Agregado
- Sistema de Biblioteca de Cuadernos
- Asistente Visual Inteligente (beta)
- Avatares de Lina y Rachelle

### 🔧 Cambiado
- Mejorada UI de Math Maestro
- Optimizado rendimiento de English Tutor

### 🐛 Corregido
- Bug en sistema de autenticación
- Error en carga de avatares
- Problema con Google Classroom sync

---

## [0.8.0] - 2026-01-05

### ✨ Agregado
- Centro de Investigación con IA
- Generación de reportes PDF
- Integración con Google Classroom

### 🔧 Cambiado
- Rediseño del Dashboard
- Mejorada navegación del campus

---

## [0.7.0] - 2025-12-30

### ✨ Agregado
- Sistema de gamificación completo
- Avatar personalizable
- Tienda Nova

### 🔧 Cambiado
- Mejorado sistema de misiones
- Optimizada base de datos

---

## [0.6.0] - 2025-12-29

### ✨ Agregado
- Math Maestro Board
- Explicaciones visuales de operaciones
- Sistema de hints

---

## [0.5.0] - 2025-12-28

### ✨ Agregado
- English Tutor con Rachelle
- Story Builder
- Puzzle Timeline

---

## [0.4.0] - 2025-12-20

### ✨ Agregado
- Tarjetas Mágicas
- Algoritmo de repetición espaciada

---

## [0.3.0] - 2025-12-15

### ✨ Agregado
- Sistema de autenticación
- Portal de padres
- Reportes de progreso

---

## [0.2.0] - 2025-12-10

### ✨ Agregado
- Dashboard principal
- Nova Campus
- Navegación básica

---

## [0.1.0] - 2025-12-01

### 🎉 Inicio del Proyecto
- Setup inicial con React + TypeScript + Vite
- Configuración de Supabase
- Landing page básica

---

## Tipos de Cambios

- `✨ Agregado` para nuevas características
- `🔧 Cambiado` para cambios en funcionalidad existente
- `🗑️ Deprecado` para características que serán removidas
- `🚫 Removido` para características removidas
- `🐛 Corregido` para corrección de bugs
- `🔒 Seguridad` para vulnerabilidades corregidas

---

[1.0.0]: https://github.com/novaschola/nova-schola-elementary/releases/tag/v1.0.0
[0.9.0]: https://github.com/novaschola/nova-schola-elementary/releases/tag/v0.9.0
