/**
 * Utilidades para llamadas a APIs externas: reintentos con backoff y timeouts.
 * Mejora la robustez frente a fallos temporales y respuestas lentas.
 */

/** Tiempo máximo por defecto para una llamada (30 s). */
const DEFAULT_TIMEOUT_MS = 30_000;

/** Número de reintentos por defecto (2 reintentos = 3 intentos totales). */
const DEFAULT_MAX_RETRIES = 2;

/** Espera base entre reintentos (ms). */
const BASE_DELAY_MS = 1000;

/**
 * Ejecuta una promesa con un timeout. Si se excede el tiempo, rechaza con un error claro.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = DEFAULT_TIMEOUT_MS,
  label: string = 'API'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timeout after ${ms / 1000}s. Please try again.`));
    }, ms);
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Reintenta una función async con backoff exponencial.
 * Útil para fallos temporales de red o rate limits.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    label?: string;
  } = {}
): Promise<T> {
  const { maxRetries = DEFAULT_MAX_RETRIES, baseDelayMs = BASE_DELAY_MS, label = 'API' } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorMsg = err.message || '';
      // Si es un error de cuota o rate limit (429), no reintentamos para fallar rápido al respaldo
      if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota')) {
        console.warn(`🛑 ${label} hit quota/rate limit (429). Skipping retries.`);
        break;
      }

      if (attempt === maxRetries) break;
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(`⚠️ ${label} attempt ${attempt + 1} failed, retrying in ${delay}ms...`, err);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

/**
 * Ejecuta una llamada async con timeout y reintentos.
 * Recomendado para Gemini y otras APIs externas.
 */
export async function withTimeoutAndRetry<T>(
  fn: () => Promise<T>,
  options: {
    timeoutMs?: number;
    maxRetries?: number;
    label?: string;
  } = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, maxRetries = DEFAULT_MAX_RETRIES, label = 'API' } = options;
  return retryWithBackoff(
    () => withTimeout(fn(), timeoutMs, label),
    { maxRetries, label }
  );
}
