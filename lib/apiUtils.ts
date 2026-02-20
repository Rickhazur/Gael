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

/**
 * 🛡️ JSON GUARDRAIL: Safely parse AI-generated JSON with automatic repair.
 * Handles common AI output issues: truncated JSON, markdown fences, 
 * trailing commas, unmatched brackets, etc.
 * Returns null if the JSON is truly unrecoverable.
 */
export function safeParseJSON<T = any>(raw: string, label: string = 'AI'): T | null {
  if (!raw || typeof raw !== 'string') return null;

  // Step 1: Strip markdown code fences (```json ... ```)
  let cleaned = raw.replace(/```json\s*\n?/gi, '').replace(/```\s*$/g, '').trim();

  // Step 2: Extract JSON object/array if surrounded by text
  const jsonStartObj = cleaned.indexOf('{');
  const jsonStartArr = cleaned.indexOf('[');
  const jsonStart = jsonStartObj >= 0 && jsonStartArr >= 0
    ? Math.min(jsonStartObj, jsonStartArr)
    : Math.max(jsonStartObj, jsonStartArr);
  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }

  // Step 3: Try direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch (_) {
    // Continue to repair
  }

  // Step 4: Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Step 5: Fix truncated JSON - close unmatched brackets
  let openBraces = 0, openBrackets = 0;
  let inString = false, escaped = false;
  for (const ch of cleaned) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  // Close unclosed strings
  if (inString) cleaned += '"';

  // Remove trailing incomplete key-value (e.g., `"key": ` with no value)
  cleaned = cleaned.replace(/,?\s*"[^"]*"\s*:\s*$/g, '');

  // Close unmatched brackets
  for (let i = 0; i < openBrackets; i++) cleaned += ']';
  for (let i = 0; i < openBraces; i++) cleaned += '}';

  // Step 6: Retry parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn(`🛡️ ${label} JSON repair failed. Raw (first 200 chars):`, raw.substring(0, 200));
    return null;
  }
}
