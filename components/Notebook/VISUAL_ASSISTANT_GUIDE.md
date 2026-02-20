# 🎨 Asistente Visual Inteligente - Guía de Implementación

## ✅ Archivos Creados

### 1. **Servicios**
- `services/visualConceptDetector.ts` - Detección de conceptos con IA
  - `detectVisualConcepts()` - Analiza texto y detecta conceptos
  - `generateEducationalImagePrompt()` - Genera prompts optimizados
  - `getTutorSuggestionMessage()` - Mensajes de Lina/Rachelle
  - `getTutorForSubject()` - Asigna tutora según materia

### 2. **Componentes**
- `components/Notebook/VisualConceptSuggestion.tsx` - UI de sugerencia
  - Avatar de tutora (Lina/Rachelle)
  - Generación de imagen
  - Preview y regeneración
  - Botones de aceptar/descartar

### 3. **Hooks**
- `hooks/useVisualAssistant.ts` - Lógica de detección
  - `useVisualAssistant()` - Maneja sugerencias automáticas
  - `useImageGallery()` - Galería de imágenes generadas

## 🚀 Cómo Integrar en UniversalNotebook

### Paso 1: Importar en UniversalNotebook.tsx

```tsx
import { useVisualAssistant, useImageGallery } from '@/hooks/useVisualAssistant';
import { VisualConceptSuggestion } from './VisualConceptSuggestion';
```

### Paso 2: Agregar Hooks

```tsx
export const UniversalNotebook: React.FC<UniversalNotebookProps> = ({
  isOpen,
  onClose,
  language,
  getNoteData,
  onStudy
}) => {
  // ... código existente ...
  
  const [noteContent, setNoteContent] = useState('');
  const noteData = getNoteData();
  
  // NUEVO: Hook de asistente visual
  const {
    suggestedConcept,
    showSuggestion,
    tutorName,
    dismissSuggestion,
    acceptSuggestion,
    isAnalyzing
  } = useVisualAssistant(
    noteContent,
    noteData?.subject || 'other',
    language,
    { enabled: true, minContentLength: 100 }
  );
  
  // NUEVO: Hook de galería de imágenes
  const { images, addImage } = useImageGallery(notebookId);
  
  // ... resto del código ...
};
```

### Paso 3: Agregar Handler para Aceptar Imagen

```tsx
const handleAcceptImage = useCallback((imageUrl: string) => {
  // Agregar imagen a la galería
  const imageId = addImage({
    url: imageUrl,
    concept: suggestedConcept?.name || '',
    prompt: suggestedConcept?.imagePrompt || ''
  });
  
  // Insertar imagen en el contenido de la nota
  const imageMarkdown = `\n\n![${suggestedConcept?.name}](${imageUrl})\n*${suggestedConcept?.description}*\n\n`;
  setNoteContent(prev => prev + imageMarkdown);
  
  // Aceptar sugerencia
  acceptSuggestion();
  
  toast.success(language === 'es' 
    ? '¡Imagen agregada a tu nota!' 
    : 'Image added to your note!');
}, [suggestedConcept, addImage, acceptSuggestion, language]);
```

### Paso 4: Renderizar Sugerencia en el UI

```tsx
return (
  <AnimatePresence>
    {isOpen && (
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header existente */}
          {/* ... */}
          
          {/* NUEVO: Sugerencia de Concepto Visual */}
          {showSuggestion && suggestedConcept && (
            <div className="px-6">
              <VisualConceptSuggestion
                conceptName={suggestedConcept.name}
                conceptDescription={suggestedConcept.description}
                imagePrompt={suggestedConcept.imagePrompt}
                tutorName={tutorName}
                language={language}
                onAccept={handleAcceptImage}
                onDismiss={dismissSuggestion}
              />
            </div>
          )}
          
          {/* Indicador de análisis */}
          {isAnalyzing && (
            <div className="px-6 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                <span>
                  {language === 'es' 
                    ? 'Analizando conceptos...' 
                    : 'Analyzing concepts...'}
                </span>
              </div>
            </div>
          )}
          
          {/* Contenido de la nota existente */}
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full p-6 min-h-[300px] resize-none focus:outline-none"
            placeholder={language === 'es' 
              ? 'Escribe tus apuntes aquí...' 
              : 'Write your notes here...'}
          />
          
          {/* Galería de imágenes generadas */}
          {images.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                {language === 'es' ? '🖼️ Imágenes Generadas' : '🖼️ Generated Images'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img 
                      src={img.url} 
                      alt={img.concept}
                      className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {img.concept}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Botones existentes */}
          {/* ... */}
          
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
```

## 🎯 Flujo de Usuario

### 1. **Estudiante Escribe Notas**
```
Estudiante escribe: "La célula es la unidad básica de la vida. 
Tiene núcleo, citoplasma y membrana celular..."
```

### 2. **Sistema Detecta Conceptos**
```
[Después de 2 segundos sin escribir]
→ Analiza el texto con GPT-4o-mini
→ Detecta: "célula animal" (confianza: 0.95)
→ Genera prompt: "Educational diagram of an animal cell..."
```

### 3. **Lina Aparece con Sugerencia**
```
┌─────────────────────────────────────┐
│ 👩‍🏫 Lina dice:                      │
│ "Veo que estás estudiando sobre     │
│  la célula. ¿Te gustaría que        │
│  genere una imagen para             │
│  entenderlo mejor?"                 │
│                                     │
│ [✨ Sí, generar] [No, gracias]     │
└─────────────────────────────────────┘
```

### 4. **Generación y Preview**
```
[Click en "Sí, generar"]
→ Genera imagen educativa
→ Muestra preview
→ Opciones: [Usar] [Regenerar] [Cancelar]
```

### 5. **Imagen Insertada**
```
[Click en "Usar"]
→ Imagen se inserta en la nota
→ Se guarda en galería del cuaderno
→ Estudiante puede continuar escribiendo
```

## 🎨 Personalización

### Ajustar Sensibilidad de Detección

```tsx
const { suggestedConcept } = useVisualAssistant(
  noteContent,
  subject,
  language,
  {
    enabled: true,
    minContentLength: 50,  // Menos texto requerido
    debounceMs: 1000       // Detectar más rápido
  }
);
```

### Cambiar Prompts por Materia

```tsx
// En visualConceptDetector.ts
const subjectStyles = {
  math: "diagram style, geometric, labeled",
  science: "scientific illustration, detailed",
  // Agregar más estilos...
};
```

### Personalizar Mensajes de Tutoras

```tsx
// En visualConceptDetector.ts
export function getTutorSuggestionMessage() {
  // Personalizar mensajes según contexto
}
```

## 📊 Métricas y Analytics

### Trackear Uso

```tsx
const handleAcceptImage = (imageUrl: string) => {
  // ... código existente ...
  
  // Analytics
  trackEvent('visual_assistant_image_generated', {
    subject: noteData.subject,
    concept: suggestedConcept.name,
    tutor: tutorName,
    language
  });
};
```

## 🔒 Consideraciones de Seguridad

1. **Validación de Contenido**
   - Filtrar conceptos inapropiados
   - Validar prompts antes de generar

2. **Límites de Uso**
   - Máximo 5 imágenes por nota
   - Cooldown entre generaciones

3. **Moderación**
   - Revisar imágenes generadas
   - Reportar contenido inapropiado

## 🚀 Próximas Mejoras

1. **Comparaciones Visuales**
   - "Célula animal vs célula vegetal"
   - Genera 2 imágenes lado a lado

2. **Secuencias**
   - "Ciclo del agua paso a paso"
   - Genera serie de imágenes

3. **Anotaciones**
   - Permitir dibujar sobre imágenes
   - Agregar flechas y labels

4. **Compartir**
   - Compartir imágenes con compañeros
   - Galería pública de mejores imágenes

---

**¡Sistema listo para revolucionar el aprendizaje visual en Nova Schola!** 🎨✨
