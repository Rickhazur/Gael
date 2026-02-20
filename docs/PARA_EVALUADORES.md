# Guía rápida para evaluadores – Nova Schola Elementary

Documento pensado para quien revisa o evalúa el proyecto (colegios, jurados, auditores).

> **Checklist 9+:** [SCORE_9_CHECKLIST.md](SCORE_9_CHECKLIST.md) — Lista de verificación para score ≥ 9/10.

---

## 1. Cómo probar la app

```bash
npm install
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001) (o el puerto que indique Vite).

- **Demo automática:** en la pantalla de login, usa el botón **"VER DEMO INTERACTIVA"** para un recorrido guiado sin configurar cuentas.
- **Piloto 5° grado:** cuenta de prueba **`piloto.quinto@novaschola.com`** / **`piloto2024`**. Para crearla en Supabase: ejecutar `supabase/CREATE_PILOTO_QUINTO_USER.sql`. Inicia sesión como Estudiante para ver la experiencia de quinto (Arena Ciudadela del Tiempo, avatares 5°, misiones g5). La cuenta está configurada para **colegio no bilingüe** (modo estándar).
- **Padre de Andrés:** cuenta de prueba **`padre.andres@novaschola.com`** / **`padre2024`**. Para crearla: ejecutar `supabase/CREATE_PADRE_ANDRES_USER.sql` (después del script del estudiante). Inicia sesión como Padre para probar el panel de acudientes vinculado al estudiante piloto.

> **Todas las claves y correos de prueba:** [CUENTAS_PRUEBA.md](CUENTAS_PRUEBA.md)

---

## 2. Tests automatizados

```bash
npm run test
```

Se ejecutan tests de:

- **adventureWorlds:** mundos por grado, misiones de 5°, tutorIntro, lore.
- **pedagogicalQuests:** estructura, ids únicos, quests por grado, cobertura para Arena g5.
- **arenaMissionToQuest:** coherencia entre misiones del mapa y lecciones (mapeo missionId → questId).
- **Servicios y helpers clave:** generación de misiones nativas (`services/missionService.test.ts`) y helpers de contenido personalizado para inglés (`hooks/usePersonalizedContent_mod.test.ts`).

Para pruebas end‑to‑end (Playwright) de los flujos completos:

```bash
npm run test:e2e
```

Cobren:

- Login demo desde landing.
- Navegación a Math Tutor y English Tutor desde el campus y el sidebar.
- Apertura de Centro de Investigación, Arena, Misiones, Biblioteca de Cuadernos y Tienda Nova.
- Flujo básico de Panel de Padres y página de Suscripción.

---

## 3. Estado de integraciones

- **Google Classroom:** implementado en código; se activa cuando un colegio real vincula su dominio y autoriza la sincronización. No es un fallo que en demo o sin colegio no aparezcan tareas de Classroom.
- **IA:** motor principal Google Gemini; imágenes con Pollinations.ai; voces opcionales ElevenLabs.

Detalle: [INTEGRATIONS_STATUS.md](INTEGRATIONS_STATUS.md).

---

## 4. Estructura del proyecto (resumida)

| Área            | Ubicación principal                          |
|-----------------|----------------------------------------------|
| Mundos Arena    | `data/adventureWorlds.ts`                    |
| Mapeo misión→quest | `data/arenaMissionToQuest.ts`             |
| Quests pedagógicas | `data/pedagogicalQuests.ts`, `data/morePedagogicalQuests.ts` |
| Centro de Misiones | `components/Missions/TaskControlCenter.tsx` |
| Arena / mapa   | `components/Arena/AdventureArena.tsx`       |
| Tutor matemáticas | `components/MathMaestro/`                  |
| Servicios IA   | `services/ai_service.ts`, `services/gemini.ts` |

---

## 5. Criterios de evaluación sugeridos

- **Funcionalidad:** demo y flujos principales (login demo, Centro de Misiones, Arena, tutor, cuadernos) funcionan sin errores bloqueantes.
- **Integraciones:** estado documentado en [INTEGRATIONS_STATUS.md](INTEGRATIONS_STATUS.md); mensajes de error amigables cuando algo no está disponible (ej. Classroom no vinculado).
- **Calidad:** tests en `data/*.test.ts` pasan con `npm run test`; datos críticos (worlds, quests, mapeo Arena) con tests de coherencia.
- **Documentación:** README, esta guía y INTEGRATIONS_STATUS permiten entender alcance, límites y cómo probar.

Si necesitas un checklist en PDF o una versión más corta para rúbrica, se puede derivar de este documento.
