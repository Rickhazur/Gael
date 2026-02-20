# Audio precargado (MP3) — Bajar costo TTS

Objetivo: **reducir llamadas a Azure/ElevenLabs** usando MP3 estáticos para frases fijas. Cada frase en el mapa local = 0 costo en producción.

---

## Qué está precargado hoy

- **Lina (es):** tour, intros matemáticas, feedback corto, tips, problemas verbales (tanque), Research intro, bienvenida 5°.
- **Rachelle (en):** tour, intros matemáticas, welcomes, feedback corto.

El mapa está en `services/elevenlabs.ts` → `LOCAL_AUDIO_MAP`. Si el texto coincide (exacto o prefijo para textos largos), se sirve el MP3 desde `public/audio/` y **no se llama a TTS**.

---

## Qué sigue llamando a TTS (costo)

| Origen | Qué se habla | Cómo bajar costo |
|--------|--------------|-------------------|
| **TutorChat** | Respuestas del tutor (Gemini) paso a paso | No se puede precargar todo (es dinámico). Opción: precargar frases tipo "Muy bien, el siguiente paso es…" y usar solo para ciertos pasos. |
| **Curriculum / AIConsultant** | Texto de secciones o respuestas de IA | Precargar frases fijas de cada sección si las tienes. |
| **VocabularyModal** | Palabras en inglés | Lista fija de vocabulario → precargar MP3 por palabra. |
| **feedbackPhrases con nombre** | "¡Muy bien, María!" | TTS en tiempo real (nombre variable). Para ahorrar: usar solo frases sin nombre y precargadas. |

---

## Cómo agregar más MP3 precargados

### 1. Añadir frases a la lista

Edita **`data/preloadAudioPhrases.json`** y agrega objetos:

```json
{
  "text": "Frase exacta que dirá Lina o Rachelle",
  "path": "lina/mi_frase.mp3",
  "voice": "lina"
}
```

- **voice:** `"lina"` → Azure es-MX-DaliaNeural, **voice:** `"rachelle"` → Azure en-US-JennyNeural.
- **path:** ruta relativa a `public/audio/` (ej. `lina/feedback_xyz.mp3`, `rachelle/welcome_extra.mp3`).

### 2. Generar los MP3

Necesitas **Azure Speech** (o ajustar el script a ElevenLabs). En `.env`:

```env
VITE_AZURE_SPEECH_KEY=tu_key
VITE_AZURE_REGION=eastus
```

Luego:

```bash
node scripts/generate_preload_audio.mjs
```

El script:

- Lee `data/preloadAudioPhrases.json`
- Genera un MP3 por frase en `public/audio/` (crea carpetas si faltan)
- **Imprime en consola** las entradas para `LOCAL_AUDIO_MAP`

### 3. Pegar en el mapa local

Copia las líneas que imprime el script y pégalas dentro de `LOCAL_AUDIO_MAP` en `services/elevenlabs.ts`:

```ts
const LOCAL_AUDIO_MAP: Record<string, string> = {
    // ... existentes ...
    "Frase exacta que dirá Lina": "/audio/lina/mi_frase.mp3",
};
```

Guarda y listo: esa frase ya no gastará TTS.

---

## Buenas prácticas

- **Texto exacto:** la clave del mapa es el texto tal cual lo pasa `generateSpeech()`. Si en el código hay "¡Genial!" y en el mapa "¡Genial!!", no hará match.
- **Frases con nombre:** tipo "¡Muy bien, {name}!": no se puede un solo MP3. Opciones: (1) usar solo frases sin nombre precargadas, o (2) dejar TTS solo para el nombre (menos costo).
- **Idioma:** Lina = español, Rachelle = inglés. Usa `path` y `voice` coherentes (lina → `lina/`, rachelle → `rachelle/`).

---

## Scripts existentes

| Script | Uso |
|--------|-----|
| `generate_lina_feedback_audio.mjs` | Feedback Lina (frases en el propio script). |
| `generate_rachelle_welcomes.mjs` | Welcomes Rachelle. |
| `generate_word_problem_audio.mjs` | Frases de problemas verbales (tanque). |
| **`generate_preload_audio.mjs`** | **Lista única** desde `data/preloadAudioPhrases.json`; genera todos e imprime entradas para el mapa. |

Usa `generate_preload_audio.mjs` para tener **una sola lista** (el JSON) y no duplicar frases en varios scripts.
