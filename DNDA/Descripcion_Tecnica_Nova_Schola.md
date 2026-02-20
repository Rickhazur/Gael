# DESCRIPCIÓN TÉCNICA DEL SOFTWARE
## Nova Schola Elementary - Plataforma Educativa con IA

**Versión:** 2.0.0  
**Fecha:** Enero 2026  
**Autor:** [Tu Nombre]  
**Registro DNDA:** [Pendiente]

---

## 1. INFORMACIÓN GENERAL

### 1.1 Identificación del Software

**Nombre Completo:**  
Nova Schola Elementary - Plataforma Educativa con Inteligencia Artificial

**Nombre Corto:**  
Nova Schola

**Versión:**  
2.0.0

**Tipo de Software:**  
Aplicación Web Educativa (SaaS - Software as a Service)

**Categoría:**  
Educación / E-Learning / EdTech

**Licencia:**  
Propietaria

---

## 2. ESPECIFICACIONES TÉCNICAS

### 2.1 Arquitectura del Sistema

**Tipo de Arquitectura:**  
Cliente-Servidor con arquitectura de tres capas

**Componentes Principales:**

1. **Frontend (Cliente):**
   - Single Page Application (SPA)
   - Framework: React 18.2.0
   - Lenguaje: TypeScript 5.0+
   - Build Tool: Vite 4.4.5

2. **Backend (Servidor):**
   - Backend as a Service (BaaS): Supabase
   - Base de datos: PostgreSQL 15
   - Autenticación: Supabase Auth
   - Storage: Supabase Storage

3. **Servicios Externos:**
   - OpenAI API (GPT-4)
   - ElevenLabs API (Text-to-Speech)
   - Google APIs (Classroom, OAuth)
   - Twilio API (WhatsApp)

### 2.2 Tecnologías Utilizadas

**Lenguajes de Programación:**
- TypeScript: 95%
- JavaScript: 3%
- SQL: 2%

**Frameworks y Librerías:**

**Frontend:**
- React 18.2.0 - Framework UI
- React Router DOM 6.14.2 - Enrutamiento
- Tailwind CSS 3.3.3 - Estilos
- Lucide React 0.263.1 - Iconografía
- Sonner 0.6.2 - Notificaciones
- Recharts 2.7.2 - Gráficos
- React Hook Form 7.45.2 - Formularios
- Zod 3.21.4 - Validación

**Backend/Database:**
- Supabase Client 2.26.0 - Cliente de base de datos
- PostgreSQL 15 - Base de datos relacional

**Herramientas de Desarrollo:**
- Vite 4.4.5 - Build tool y dev server
- ESLint 8.45.0 - Linter
- TypeScript Compiler 5.0+ - Compilador
- PostCSS 8.4.27 - Procesador CSS

**APIs y Servicios:**
- OpenAI API - Inteligencia artificial
- ElevenLabs API - Síntesis de voz
- Google Classroom API - Integración educativa
- Twilio API - Mensajería WhatsApp

### 2.3 Requisitos del Sistema

**Servidor (Producción):**
- Node.js 18+ (para build)
- Servidor web (Nginx/Apache) o CDN
- SSL/TLS certificado
- Dominio propio

**Cliente (Usuario Final):**
- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript habilitado
- Conexión a internet: mínimo 2 Mbps
- Resolución mínima: 1024x768px

---

## 3. FUNCIONALIDADES DEL SOFTWARE

### 3.1 Módulos Principales

**1. Sistema de Autenticación**
- Registro de usuarios (estudiantes, padres, administradores)
- Inicio de sesión con email y contraseña
- Recuperación de contraseña
- Autenticación con Google OAuth (opcional)
- Gestión de sesiones con JWT
- Roles y permisos

**2. Sistema de Avatares y Gamificación**
- 40+ avatares organizados por grado (1° a 5°)
- Selección de avatar personalizado
- Sistema de Nova Coins (moneda virtual)
- Tienda de accesorios (30+ items)
- Personalización de avatar
- Sistema de niveles y experiencia

**3. Arena de Misiones**
- Misiones educativas diarias y semanales
- Sistema de recompensas
- Categorías por materia
- Niveles de dificultad
- Progreso persistente
- Leaderboards

**4. Math Maestro (Tutor de Matemáticas)**
- Generación de problemas con IA
- Explicaciones paso a paso
- Síntesis de voz (text-to-speech)
- Adaptación al nivel del estudiante
- Visualizaciones interactivas
- Seguimiento de progreso

**5. Navegador Académico**
- Análisis de texto con IA
- Generación de "Teacher Keys"
- "Sentence Starters" contextuales
- Feedback en tiempo real
- Detección de plagio
- Parafraseo asistido

**6. Sistema de Progreso**
- Dashboard de métricas
- Gráficos de rendimiento
- Reportes para padres
- Exportación de datos
- Historial de actividades

**7. Panel de Administración**
- Gestión de usuarios
- Gestión de tienda
- Asignación de coins
- Configuración de planes
- Reportes administrativos

**8. Integración con Google Classroom**
- Sincronización de tareas
- Importación de estudiantes
- Publicación de calificaciones

**9. Reportes por WhatsApp**
- Envío automático de reportes
- Notificaciones a padres
- Resúmenes de progreso

### 3.2 Características Técnicas Destacadas

**Seguridad:**
- Encriptación de datos en tránsito (HTTPS/TLS)
- Encriptación de datos en reposo
- Autenticación de dos factores (opcional)
- Row Level Security (RLS) en base de datos
- Sanitización de inputs
- Protección contra SQL Injection
- Protección contra XSS
- CORS configurado

**Rendimiento:**
- Code splitting y lazy loading
- Optimización de imágenes
- Caché de recursos estáticos
- Compresión Gzip/Brotli
- CDN para assets
- Realtime updates con WebSockets

**Escalabilidad:**
- Arquitectura serverless
- Base de datos escalable (Supabase/PostgreSQL)
- Balanceo de carga automático
- Auto-scaling en producción

**Accesibilidad:**
- Diseño responsive (mobile-first)
- Soporte para lectores de pantalla
- Contraste de colores WCAG AA
- Navegación por teclado
- Textos alternativos en imágenes

**Internacionalización:**
- Soporte multiidioma (ES/EN)
- Formato de fechas localizado
- Formato de números localizado
- Moneda localizada (COP)

---

## 4. ARQUITECTURA DE BASE DE DATOS

### 4.1 Tablas Principales

**profiles (Perfiles de Usuario)**
```sql
- id: UUID (PK)
- name: TEXT
- email: TEXT
- role: TEXT (STUDENT, PARENT, ADMIN)
- level: TEXT (primary, teen)
- avatar_id: TEXT
- equipped_accessories: JSONB
- owned_accessories: JSONB
- guardian_phone: TEXT
- parent_id: UUID (FK)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**economy (Economía/Coins)**
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- coins: INTEGER
- total_earned: INTEGER
- total_spent: INTEGER
- last_updated: TIMESTAMP
```

**store_items (Items de Tienda)**
```sql
- id: TEXT (PK)
- name: TEXT
- type: TEXT
- rarity: TEXT
- cost: INTEGER
- condition_type: TEXT
- condition_value: TEXT
- icon: TEXT
- created_at: TIMESTAMP
```

**lesson_progress (Progreso de Lecciones)**
```sql
- id: UUID (PK)
- student_id: UUID (FK)
- lesson_id: TEXT
- lesson_title: TEXT
- subject: TEXT
- status: TEXT
- score: INTEGER
- time_spent_minutes: INTEGER
- feedback: TEXT
- homework_submitted: BOOLEAN
- homework_score: INTEGER
- can_continue: BOOLEAN
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
```

**infractions (Infracciones Disciplinarias)**
```sql
- id: UUID (PK)
- student_id: UUID (FK)
- type: TEXT
- description: TEXT
- severity: TEXT
- timestamp: TIMESTAMP
```

**academic_results (Resultados Académicos)**
```sql
- id: UUID (PK)
- student_id: UUID (FK)
- subject: TEXT
- remedial_plan: JSONB
- timestamp: TIMESTAMP
```

**tutor_reports (Reportes del Tutor)**
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- source: TEXT
- subject: TEXT
- emoji: TEXT
- overall_score: INTEGER
- trend: TEXT
- challenges: JSONB
- recommendations: JSONB
- created_at: TIMESTAMP
```

### 4.2 Relaciones

- profiles.parent_id → profiles.id (relación padre-hijo)
- economy.user_id → profiles.id (one-to-one)
- lesson_progress.student_id → profiles.id (one-to-many)
- infractions.student_id → profiles.id (one-to-many)
- academic_results.student_id → profiles.id (one-to-many)
- tutor_reports.user_id → profiles.id (one-to-many)

---

## 5. FLUJO DE DATOS

### 5.1 Flujo de Autenticación

```
1. Usuario ingresa email y contraseña
2. Frontend envía credenciales a Supabase Auth
3. Supabase valida credenciales
4. Si válido: genera JWT token
5. Frontend almacena token en localStorage
6. Frontend obtiene perfil de usuario de tabla profiles
7. Frontend redirige a dashboard
```

### 5.2 Flujo de Gamificación

```
1. Usuario completa misión
2. Frontend calcula coins ganados
3. Frontend llama a función adminAwardCoins()
4. Backend actualiza tabla economy
5. Realtime subscription notifica cambio
6. Frontend actualiza UI con nuevo balance
7. Usuario puede gastar coins en tienda
```

### 5.3 Flujo de IA (Math Maestro)

```
1. Usuario ingresa problema matemático
2. Frontend envía problema a OpenAI API
3. OpenAI procesa y genera explicación
4. Frontend recibe respuesta
5. Frontend envía texto a ElevenLabs API
6. ElevenLabs genera audio
7. Frontend reproduce audio
8. Frontend muestra explicación visual
```

---

## 6. SEGURIDAD Y PRIVACIDAD

### 6.1 Medidas de Seguridad Implementadas

**Autenticación:**
- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Refresh tokens para sesiones largas
- Rate limiting en endpoints de auth

**Autorización:**
- Row Level Security (RLS) en Supabase
- Verificación de roles en cada request
- Políticas de acceso por tabla
- Validación de permisos en frontend y backend

**Protección de Datos:**
- Encriptación TLS 1.3 en tránsito
- Encriptación AES-256 en reposo
- Backup automático diario
- Retención de datos según GDPR

**Validación:**
- Validación de inputs con Zod
- Sanitización de HTML
- Escape de SQL queries
- Validación de tipos con TypeScript

### 6.2 Cumplimiento Legal

**GDPR (Reglamento General de Protección de Datos):**
- Consentimiento explícito para datos
- Derecho al olvido implementado
- Portabilidad de datos
- Notificación de brechas de seguridad

**COPPA (Children's Online Privacy Protection Act):**
- Consentimiento parental para menores de 13 años
- Limitación de datos recopilados
- No publicidad dirigida a menores

**Ley 1581 de 2012 (Colombia):**
- Política de privacidad visible
- Autorización para tratamiento de datos
- Derecho de acceso, rectificación y supresión

---

## 7. INTEGRACIÓN CON SERVICIOS EXTERNOS

### 7.1 OpenAI API

**Uso:** Generación de contenido educativo con IA

**Endpoints Utilizados:**
- `/v1/chat/completions` - Generación de texto
- Modelo: GPT-4

**Datos Enviados:**
- Prompt del usuario
- Contexto de la conversación
- Parámetros de generación

**Datos Recibidos:**
- Respuesta generada
- Tokens utilizados
- Metadata

### 7.2 ElevenLabs API

**Uso:** Síntesis de voz (text-to-speech)

**Endpoints Utilizados:**
- `/v1/text-to-speech` - Generación de audio

**Datos Enviados:**
- Texto a sintetizar
- ID de voz seleccionada
- Configuración de audio

**Datos Recibidos:**
- Archivo de audio (MP3)

### 7.3 Supabase

**Uso:** Backend as a Service

**Servicios Utilizados:**
- Auth - Autenticación
- Database - PostgreSQL
- Storage - Almacenamiento de archivos
- Realtime - WebSockets

### 7.4 Google APIs

**Uso:** Integración con Google Classroom

**APIs Utilizadas:**
- Google Classroom API
- Google OAuth 2.0

### 7.5 Twilio

**Uso:** Envío de mensajes por WhatsApp

**APIs Utilizadas:**
- Twilio WhatsApp API

---

## 8. DESPLIEGUE Y MANTENIMIENTO

### 8.1 Proceso de Despliegue

**Desarrollo:**
```bash
npm run dev  # Servidor de desarrollo local
```

**Build de Producción:**
```bash
npm run build  # Genera archivos optimizados en /dist
```

**Despliegue:**
- Hosting: Vercel / Netlify / AWS S3 + CloudFront
- CI/CD: GitHub Actions
- Monitoreo: Sentry / LogRocket

### 8.2 Mantenimiento

**Actualizaciones:**
- Actualizaciones de seguridad: Semanales
- Actualizaciones de features: Mensuales
- Actualizaciones mayores: Trimestrales

**Backup:**
- Base de datos: Diario (automático)
- Código fuente: Git (continuo)
- Configuración: Versionado

**Monitoreo:**
- Uptime monitoring
- Error tracking
- Performance monitoring
- User analytics

---

## 9. MÉTRICAS Y RENDIMIENTO

### 9.1 Métricas de Rendimiento

**Tiempo de Carga:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s

**Tamaño de Bundle:**
- JavaScript inicial: ~200 KB (gzipped)
- CSS: ~50 KB (gzipped)
- Total assets: ~500 KB

**Optimizaciones:**
- Code splitting por rutas
- Lazy loading de componentes
- Tree shaking
- Minificación
- Compresión

### 9.2 Capacidad

**Usuarios Concurrentes:**
- Soportado: 1,000+ usuarios simultáneos
- Escalable: Hasta 10,000+ con auto-scaling

**Almacenamiento:**
- Base de datos: Ilimitado (Supabase)
- Storage: 100 GB inicial, escalable

---

## 10. ROADMAP Y FUTURAS MEJORAS

### 10.1 Versión 2.1 (Q2 2026)

- [ ] Modo offline
- [ ] App móvil nativa (iOS/Android)
- [ ] Más idiomas (Francés, Portugués)
- [ ] Integración con Microsoft Teams

### 10.2 Versión 3.0 (Q4 2026)

- [ ] Realidad aumentada (AR)
- [ ] Gamificación avanzada
- [ ] Marketplace de contenido
- [ ] API pública para desarrolladores

---

## 11. CONTACTO TÉCNICO

**Desarrollador Principal:**  
[Tu Nombre]

**Email Técnico:**  
dev@novaschola.edu.co

**Repositorio:**  
[Privado]

**Documentación:**  
https://docs.novaschola.edu.co

---

## 12. LICENCIA Y DERECHOS

**Tipo de Licencia:**  
Propietaria - Todos los derechos reservados

**Copyright:**  
© 2026 [Tu Nombre/Empresa]

**Registro:**  
DNDA Colombia - [Número de registro pendiente]

---

**Versión del Documento:** 1.0  
**Fecha de Creación:** 04/01/2026  
**Última Actualización:** 04/01/2026

---

**FIN DE LA DESCRIPCIÓN TÉCNICA**
