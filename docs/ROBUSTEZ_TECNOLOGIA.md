# Tecnología para mayor robustez — Nova Schola Elementary

Documento que resume **qué falta a nivel tecnología** para que el programa sea más robusto, en orden de prioridad. Incluye lo que ya existe y lo pendiente.

---

## ✅ Ya implementado

| Área | Qué hay |
|------|---------|
| **Errores no capturados** | `utils/errorLogger.ts`: captura `window.error` y `unhandledrejection`; buffer en memoria; comentario para enviar a Sentry/LogRocket en producción. |
| **Error Boundary** | `components/ErrorBoundary.tsx` + `react-error-boundary` en `index.tsx`: fallback "Algo salió mal" + Reintentar / Recargar. |
| **Mensajes de usuario** | `utils/errorMessages.ts`: mensajes ES/EN centralizados para misiones, sync, guardar, analizar. |
| **Web Vitals** | `utils/webVitals.ts`: CLS, FID, FCP, LCP, TTFB, INP; hoy solo `console.log` y buffer; listo para conectar a analytics. |
| **Variables de entorno** | Gemini usa `VITE_GOOGLE_GEMINI_API_KEY` (sin clave hardcodeada). Supabase usa `VITE_SUPABASE_*`. `.env.example` documentado. |
| **Validación** | Zod u otras validaciones en varios servicios (mathValidator, supabase types, etc.). |
| **Tests** | Vitest para datos críticos (adventureWorlds, pedagogicalQuests, arenaMissionToQuest). |
| **Sentry** | `lib/sentry.ts`: init opcional con `VITE_SENTRY_DSN`. `ErrorFallback` reporta con `Sentry.captureException`. |
| **Reintentos + timeout** | `lib/apiUtils.ts`: `retryWithBackoff`, `withTimeout`, `withTimeoutAndRetry`. Aplicado en `services/gemini.ts` (30 s timeout, 2 reintentos con backoff). |

---

## 1. Prioridad alta (robustez y seguridad) — ✅ Implementado

### 1.1 Monitoreo de errores en producción — ✅ Hecho

- **Qué:** Enviar errores a un servicio (Sentry).
- **Dónde:** `lib/sentry.ts` (init si `VITE_SENTRY_DSN` está definido), `index.tsx` llama a `initSentry()`, `components/ErrorBoundary.tsx` usa `Sentry.captureException(error)` en el fallback.
- **Beneficio:** Ver errores reales de usuarios en el panel de Sentry cuando se configura el DSN.

### 1.2 Reintentos con backoff en llamadas externas — ✅ Hecho

- **Qué:** Reintentar llamadas a Gemini con backoff exponencial (1 s, 2 s) y máximo 2 reintentos (3 intentos totales).
- **Dónde:** `lib/apiUtils.ts` exporta `retryWithBackoff`; `services/gemini.ts` usa `withTimeoutAndRetry` en la llamada a `chat.sendMessage`.
- **Beneficio:** Menos fallos percibidos por cortes breves de red o picos de carga.

### 1.3 Timeout en llamadas a IA y APIs — ✅ Hecho

- **Qué:** Timeout de 30 s en la llamada a Gemini; si se excede, se rechaza con mensaje claro y se puede reintentar (vía 1.2).
- **Dónde:** `lib/apiUtils.ts` exporta `withTimeout`; `services/gemini.ts` usa `withTimeoutAndRetry` (timeout 30 s + retries).
- **Beneficio:** La UI no queda colgada si la API no responde.

---

## 2. Prioridad media (estabilidad y datos)

### 2.1 Validación de variables de entorno al arranque

- **Qué:** Al iniciar la app, comprobar que existan las variables mínimas (p. ej. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) y mostrar un mensaje claro si faltan, en lugar de fallos dispersos.
- **Dónde:** En `main.tsx` o `App.tsx` antes de renderizar, o en un pequeño `lib/env.ts` que exporte `assertEnv()` y se llame al inicio.
- **Beneficio:** Menos tiempo debugueando “por qué no carga” por falta de .env.

### 2.2 Envío de Web Vitals a analytics

- **Qué:** En producción, enviar las métricas de `utils/webVitals.ts` a Google Analytics, Vercel Analytics o similar.
- **Dónde:** En `reportMetric` de `webVitals.ts`: si `import.meta.env.PROD`, llamar a `gtag('event', ...)` o al API que uses.
- **Beneficio:** Medir LCP, FID, etc. en producción y detectar regresiones de rendimiento.

### 2.3 Health check o ping de servicios

- **Qué:** Endpoint o función que compruebe que Supabase (y opcionalmente Gemini) responden; útil para un panel interno o para mostrar “Modo offline” si falla.
- **Dónde:** `services/supabase.ts`: función `pingSupabase()` que haga una query trivial; opcionalmente llamarla desde un componente de estado global o desde el Error Boundary.
- **Beneficio:** Saber si el fallo es de red/backend y dar un mensaje coherente al usuario.

---

## 3. Prioridad baja (nice to have)

### 3.1 Circuit breaker para IA

- **Qué:** Si Gemini (o la API de imágenes) falla muchas veces seguidas, dejar de llamarla durante X segundos y mostrar “Servicio temporalmente no disponible” en lugar de reintentar siempre.
- **Dónde:** Capa delante de `callGeminiSocratic` y/o `generateImage` (ej. en `ai_service.ts`).
- **Beneficio:** Evitar saturar el servicio y dar feedback claro cuando hay una caída prolongada.

### 3.2 Cache de respuestas de IA (opcional)

- **Qué:** Para preguntas idénticas (mismo hash), devolver respuesta cacheada en memoria o en localStorage con TTL corto (ej. 5 min).
- **Dónde:** Envolver llamadas a Gemini en `ai_service` o en un hook que use esas llamadas.
- **Beneficio:** Menos latencia y menos consumo de cuota en preguntas repetidas (ej. demo).

### 3.3 Tests E2E

- **Qué:** Pruebas de flujo completo (ej. login demo → Centro de Misiones → abrir una misión) con Playwright o Cypress.
- **Dónde:** Carpeta `e2e/` o `tests/e2e/`, configurada en el proyecto.
- **Beneficio:** Detectar roturas de flujos críticos antes de desplegar.

---

## 4. Resumen por impacto

| Si quieres… | Añade esto |
|-------------|------------|
| Menos fallos por red | Reintentos con backoff + timeout en Gemini/APIs. |
| Saber qué falla en producción | Sentry (o similar) en `errorLogger`. |
| Evitar colgados por IA | Timeout (AbortController) en llamadas a Gemini e imágenes. |
| Menos errores de configuración | Validación de env al arranque. |
| Medir rendimiento real | Enviar Web Vitals a analytics en producción. |
| Más resiliencia ante caídas de IA | Circuit breaker opcional. |

---

## 5. Orden sugerido de implementación

1. **Gemini con env** — ✅ Hecho: clave desde `VITE_GOOGLE_GEMINI_API_KEY`.
2. **Timeout en Gemini** — ✅ Hecho: 30 s en `gemini.ts` vía `lib/apiUtils.ts`.
3. **Reintentos con backoff** — ✅ Hecho: en `gemini.ts` vía `withTimeoutAndRetry`.
4. **Sentry** — ✅ Hecho: `lib/sentry.ts` + `ErrorFallback`; opcional con `VITE_SENTRY_DSN`.
5. **Validación de env al arranque** — Bajo esfuerzo, alto impacto para quien despliega.
6. **Web Vitals → analytics** — Cuando tengas analytics en producción.
7. **Health check** — Útil cuando tengas panel interno o modo “offline”.
8. **Circuit breaker / cache** — Cuando la carga y el uso de IA justifiquen la complejidad.

Si quieres, se puede bajar al detalle de implementación (código concreto) para cualquiera de estos puntos.
