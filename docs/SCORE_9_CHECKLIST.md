# Checklist para evaluación 9+ — Nova Schola Elementary

Lista de verificación para que un evaluador compruebe que el proyecto cumple estándares de calidad (score ≥ 9/10).

---

## 1. Documentación

- [ ] **README** con instalación, tests, build y enlace a [PARA_EVALUADORES.md](PARA_EVALUADORES.md)
- [ ] **[INTEGRATIONS_STATUS.md](INTEGRATIONS_STATUS.md)** — Estado de Google Classroom (implementado, pendiente colegio real) e IA (Gemini, Pollinations)
- [ ] **[PARA_EVALUADORES.md](PARA_EVALUADORES.md)** — Cómo probar, ejecutar tests, criterios sugeridos
- [ ] **.env.example** con secciones comentadas (requeridos, IA, opcionales)
- [ ] **CHANGELOG** con mejoras recientes (tests, docs, mensajes de error, mapeo Arena)

---

## 2. Tests

- [ ] `npm run test` ejecuta suite Vitest
- [ ] Tests en `data/*.test.ts`: adventureWorlds, pedagogicalQuests, arenaMissionToQuest
- [ ] Tests adicionales en servicios y hooks clave (`services/missionService.test.ts`, `hooks/usePersonalizedContent_mod.test.ts`)
- [ ] Pruebas E2E Playwright (`npm run test:e2e`) para flujos principales: login demo, campus, Math Tutor, English Tutor, Research Center, Arena, Misiones, Biblioteca, Tienda, Suscripción, Panel de Padres
- [ ] Coherencia: cada clave del mapeo Arena existe en adventureWorlds; quests referenciadas existen o hay fallback documentado

---

## 3. Código y arquitectura

- [ ] **Una fuente de verdad** para mapeo Arena → quest: `data/arenaMissionToQuest.ts`
- [ ] **Mensajes de error centralizados**: `utils/errorMessages.ts` usado en Centro de Misiones, Google Classroom Sync, notebookService, MathTutorBoard
- [ ] **Compatibilidad legacy**: `services/openai.ts` re-exporta desde `ai_service` (Gemini) para componentes que lo importaban
- [ ] **Error Boundary** en `index.tsx` con fallback amigable (Reintentar / Recargar)

---

## 4. Experiencia de usuario

- [ ] Mensajes de error **amigables** (no técnicos) en flujos críticos: misiones, sync, guardar apunte, analizar ejercicio
- [ ] **Estado vacío** en Centro de Misiones cuando no hay tareas (texto que explica Google Classroom y sugiere Arena/Tutor)
- [ ] **Demo** funcional (botón "VER DEMO INTERACTIVA") y piloto 5° grado documentado

---

## 5. Integraciones

- [ ] Google Classroom **documentado** como implementado y activable con colegio real (no es bug que no aparezcan tareas sin vincular)
- [ ] README y .env.example reflejan **Gemini** como motor principal e **imágenes** (Pollinations/opcional OpenAI)

---

## Resumen

Si todos los ítems anteriores están cubiertos, el proyecto cumple con los criterios de **pulido, documentación, tests y coherencia** esperados para un score **9+**. Para más detalle técnico, ver [PARA_EVALUADORES.md](PARA_EVALUADORES.md) e [INTEGRATIONS_STATUS.md](INTEGRATIONS_STATUS.md).
