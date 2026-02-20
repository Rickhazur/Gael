# Estado de integraciones – Nova Schola Elementary

Este documento aclara el estado de cada integración externa para evaluadores, colegios y desarrolladores.

---

## Google Classroom

| Aspecto | Estado |
|--------|--------|
| **Código** | Implementado y listo para uso |
| **Activación** | Requiere una cuenta real de colegio que autorice la sincronización |
| **Ubicación** | `services/googleClassroom.ts`, `components/GoogleClassroom/`, `getGoogleClassroomAssignments` en Supabase |
| **Comportamiento actual** | Si no hay colegio vinculado o no hay tareas sincronizadas, el Centro de Misiones muestra misiones internas (Nova) y/o misiones nativas. No es un error: es el flujo esperado hasta que un colegio se una y conecte su dominio. |

**Conclusión:** La integración con Google Classroom está desarrollada. No se puede “activar” en producción hasta que exista un colegio real con cuenta y autorización para sincronizar. En demo y pruebas se usan misiones internas.

---

## IA y generación de contenido

| Servicio | Uso | Estado |
|----------|-----|--------|
| **Google Gemini** | Chat, tutoría, detección de conceptos, Research Center | Activo (motor principal) |
| **Pollinations.ai** | Imágenes educativas (Nano Banana Pro, Asistente Visual, Arena) | Activo (sin API key) |
| **ElevenLabs** | Voces de Lina y Rachelle | Opcional; requiere API key |
| **OpenAI / DALL·E** | No usado en el flujo principal | Código legacy en `api/` solo para rutas alternativas si se configuran |

---

## Base de datos y backend

| Servicio | Estado |
|----------|--------|
| **Supabase** | Activo: auth, misiones, avatares, pets, recompensas, RLS |
| **Cron / sync** | `pages/api/cron/sync-classroom.ts` listo para cuando haya colegio con Classroom |

---

## Resumen para evaluación

- **Google Classroom:** Implementado; pendiente de activación hasta contar con colegio real que sincronice.
- **Errores “al cargar misiones”** cuando no hay Classroom: esperados si no hay colegio vinculado; la app debe mostrar mensaje amigable y seguir mostrando misiones internas/nativas (ver mejoras en Centro de Misiones).

Si necesitas más detalle técnico de alguna integración, está en `services/` y en los componentes indicados arriba.
