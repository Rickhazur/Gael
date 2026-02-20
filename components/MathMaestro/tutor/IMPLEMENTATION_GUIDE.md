# 🎯 Sistema de Explicaciones Visuales para Matemáticas
## Implementación Completa - Llevadas y Préstamos

### ✅ Componentes Creados

1. **`CarryOverBubble.tsx`** - Burbujas visuales animadas
2. **`operationHelpers.ts`** - Detección automática de llevadas/préstamos
3. **`ExplanationToggle.tsx`** - Toggle para modo detallado/compacto

---

## 📋 Cómo Integrar en MathTutorBoard.tsx

### Paso 1: Importar los componentes

```tsx
import { CarryOverLayer, CarryOverHint } from './CarryOverBubble';
import { generateOperationHints } from './operationHelpers';
import { ExplanationToggle } from './ExplanationToggle';
```

### Paso 2: Agregar estado para las explicaciones

```tsx
const [showDetailedExplanations, setShowDetailedExplanations] = useState(true);
const [currentHints, setCurrentHints] = useState<CarryOverHint[]>([]);
```

### Paso 3: Detectar llevadas cuando se genera un problema

```tsx
// Ejemplo para suma
const handleGenerateAddition = (num1: number, num2: number) => {
    const hints = generateOperationHints('addition', num1.toString(), num2.toString());
    setCurrentHints(hints as CarryOverHint[]);
    // ... resto de la lógica
};

// Ejemplo para resta
const handleGenerateSubtraction = (num1: number, num2: number) => {
    const hints = generateOperationHints('subtraction', num1.toString(), num2.toString());
    setCurrentHints(hints as CarryOverHint[]);
    // ... resto de la lógica
};

// Ejemplo para multiplicación
const handleGenerateMultiplication = (num1: number, num2: number) => {
    const hints = generateOperationHints('multiplication', num1.toString(), num2);
    setCurrentHints(hints as CarryOverHint[]);
    // ... resto de la lógica
};
```

### Paso 4: Agregar el toggle en el UI

```tsx
// En el header o toolbar del Math Board
<ExplanationToggle
    showDetailed={showDetailedExplanations}
    onToggle={() => setShowDetailedExplanations(!showDetailedExplanations)}
    className="mb-4"
/>
```

### Paso 5: Renderizar las burbujas sobre la operación

```tsx
// Dentro del contenedor donde se muestra la operación matemática
<div className="relative" ref={operationContainerRef}>
    {/* Tu operación matemática actual */}
    <div className="math-operation">
        {/* Números, signos, etc. */}
    </div>

    {/* Capa de burbujas explicativas */}
    <CarryOverLayer
        hints={currentHints}
        showDetailed={showDetailedExplanations}
        columnWidth={60} // Ajustar según el ancho de tus columnas
        containerRef={operationContainerRef}
    />
</div>
```

---

## 🎨 Ejemplo Completo de Uso

```tsx
import { useState, useRef } from 'react';
import { CarryOverLayer, CarryOverHint } from './CarryOverBubble';
import { generateOperationHints } from './operationHelpers';
import { ExplanationToggle } from './ExplanationToggle';

function MathProblem() {
    const [showDetailed, setShowDetailed] = useState(true);
    const [hints, setHints] = useState<CarryOverHint[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generar problema de suma
    const generateAdditionProblem = () => {
        const num1 = "387";
        const num2 = "245";
        const detectedHints = generateOperationHints('addition', num1, num2);
        setHints(detectedHints as CarryOverHint[]);
    };

    return (
        <div className="p-8">
            <ExplanationToggle
                showDetailed={showDetailed}
                onToggle={() => setShowDetailed(!showDetailed)}
            />

            <div className="relative mt-8" ref={containerRef}>
                {/* Operación matemática */}
                <div className="text-4xl font-mono text-center">
                    <div>  387</div>
                    <div>+ 245</div>
                    <div className="border-t-4 border-black">____</div>
                </div>

                {/* Burbujas explicativas */}
                <CarryOverLayer
                    hints={hints}
                    showDetailed={showDetailed}
                    columnWidth={60}
                    containerRef={containerRef}
                />
            </div>

            <button onClick={generateAdditionProblem}>
                Generar Problema
            </button>
        </div>
    );
}
```

---

## 🔧 Configuración de Ancho de Columnas

El parámetro `columnWidth` debe ajustarse según tu diseño:

```tsx
// Para fuente pequeña (text-2xl)
columnWidth={40}

// Para fuente mediana (text-3xl)
columnWidth={50}

// Para fuente grande (text-4xl)
columnWidth={60}

// Para fuente muy grande (text-5xl)
columnWidth={80}
```

---

## 🎯 Funciones Disponibles

### `generateOperationHints(operation, num1, num2)`

Detecta automáticamente llevadas/préstamos según la operación:

- **`'addition'`** - Detecta llevadas en sumas
- **`'subtraction'`** - Detecta préstamos en restas
- **`'multiplication'`** - Detecta llevadas en multiplicaciones
- **`'division'`** - Detecta pasos en divisiones

**Retorna:** Array de `CarryOverHint` con toda la información necesaria

---

## 🎨 Personalización de Colores

Los colores se definen en `CarryOverBubble.tsx`:

```tsx
const colors = {
    carry: {
        bg: 'bg-purple-100',      // Fondo morado para llevadas
        border: 'border-purple-400',
        text: 'text-purple-700',
    },
    borrow: {
        bg: 'bg-orange-100',      // Fondo naranja para préstamos
        border: 'border-orange-400',
        text: 'text-orange-700',
    }
};
```

---

## 📱 Modo Responsive

Las burbujas se adaptan automáticamente:

- **Modo Detallado**: Muestra explicación completa (200px de ancho)
- **Modo Compacto**: Solo muestra el número (40px de ancho)

---

## 🚀 Próximos Pasos Sugeridos

1. **Integrar con Lina's Voice**: Hacer que Lina mencione verbalmente las llevadas
2. **Animación Secuencial**: Mostrar las burbujas una por una, siguiendo el orden de resolución
3. **Modo Práctica**: Ocultar las burbujas y pedir al estudiante que identifique dónde hay llevadas
4. **Estadísticas**: Trackear qué tipo de llevadas causan más errores

---

## 💡 Tips Pedagógicos

- **Siempre activado por defecto** para estudiantes nuevos
- **Permitir desactivar** para estudiantes avanzados que ya dominan el concepto
- **Usar colores consistentes**: Morado = Llevadas, Naranja = Préstamos
- **Animaciones suaves**: No distraer, solo guiar la atención

---

## 🐛 Troubleshooting

**Las burbujas no aparecen:**
- Verificar que `columnWidth` esté configurado correctamente
- Asegurar que el contenedor tenga `position: relative`
- Revisar que `hints` no esté vacío

**Posición incorrecta:**
- Ajustar `topOffset` en `CarryOverBubble`
- Verificar el ancho real de las columnas con DevTools

**Burbujas se superponen:**
- Aumentar `columnWidth`
- Reducir el tamaño de fuente de la operación

---

¡Sistema listo para hacer que TODOS los niños entiendan las matemáticas! 🎉
