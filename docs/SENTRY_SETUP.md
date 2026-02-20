# Activar Sentry (monitoreo de errores)

El build funciona **sin** instalar `@sentry/react`. Para activar el envío de errores a Sentry:

## 1. Instalar el paquete

```bash
npm install @sentry/react --save
```

## 2. Sustituir el stub en `lib/sentry.ts`

Reemplaza el contenido de `lib/sentry.ts` por:

```ts
import * as Sentry from '@sentry/react';

const dsn = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SENTRY_DSN
  ? import.meta.env.VITE_SENTRY_DSN
  : '';

export function initSentry(): void {
  if (!dsn || dsn.trim() === '') return;
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    environment: import.meta.env.MODE ?? 'development',
  });
}
```

## 3. Reportar errores desde el Error Boundary

En `components/ErrorBoundary.tsx`, añade el import y el `useEffect`:

```tsx
import * as Sentry from '@sentry/react';

// Dentro del componente ErrorFallback, antes del return:
useEffect(() => {
  if (error) Sentry.captureException(error);
}, [error]);
```

## 4. Variables de entorno

En tu `.env` (o en Vercel):

```env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

Obtén el DSN en [sentry.io](https://sentry.io) → tu proyecto → Settings → Client Keys (DSN).
