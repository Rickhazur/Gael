# 🎬 SISTEMA DE DEMO TOUR AUTOMÁTICO

## 🎯 OBJETIVO:
Crear un demo 100% automático donde el usuario solo hace click y ve TODO funcionando.

---

## 📋 COMPONENTES A CREAR:

### **1. DemoTourContext.tsx**
Context que maneja el estado del tour:
- Paso actual (1-10)
- Datos pre-cargados para cada paso
- Navegación automática
- Simulación de resultados

### **2. DemoTourButton.tsx**
Botón flotante que aparece en modo demo:
- "Siguiente Paso" → Avanza automáticamente
- "Ver Resultado" → Muestra datos pre-generados
- "Saltar Tour" → Navega libremente

### **3. Datos Pre-configurados:**

#### **Centro de Misiones:**
```typescript
const DEMO_MISSIONS = [
  {
    id: 'demo-math-exam',
    title: 'Examen de Matemáticas - Fracciones y Decimales',
    subject: 'MATH',
    dueDate: '+5 days',
    route: 'MATH_TUTOR',
    autoData: {
      problem: '¿Cuánto es 1/2 + 1/4?',
      solution: '3/4',
      steps: ['Paso 1...', 'Paso 2...']
    }
  },
  {
    id: 'demo-science-quiz',
    title: 'Quiz de Ciencias - El Ciclo del Agua',
    subject: 'SCIENCE',
    dueDate: '+2 days',
    route: 'RESEARCH_CENTER',
    autoData: {
      topic: 'El Ciclo del Agua',
      research: 'El ciclo del agua es...',
      report: 'Mi reporte sobre...'
    }
  }
];
```

#### **Tutor de Matemáticas:**
```typescript
const DEMO_MATH_SESSION = {
  problem: '¿Cuánto es 1/2 + 1/4?',
  steps: [
    'Primero, necesitamos encontrar un denominador común.',
    'El denominador común de 2 y 4 es 4.',
    '1/2 = 2/4',
    'Ahora sumamos: 2/4 + 1/4 = 3/4',
    '¡La respuesta es 3/4!'
  ],
  visual: '🍕 [Imagen de pizza dividida]',
  reward: { xp: 50, coins: 20 }
};
```

#### **Centro de Investigación:**
```typescript
const DEMO_RESEARCH = {
  topic: 'El Ciclo del Agua',
  searchResult: `
    El ciclo del agua es el proceso continuo de evaporación, 
    condensación y precipitación. 
    
    1. EVAPORACIÓN: El sol calienta el agua de océanos, ríos y lagos...
    2. CONDENSACIÓN: El vapor de agua se enfría y forma nubes...
    3. PRECIPITACIÓN: El agua cae en forma de lluvia, nieve o granizo...
  `,
  studentReport: `
    El ciclo del agua es muy importante para la vida en la Tierra.
    Primero, el sol calienta el agua y se convierte en vapor...
  `,
  reward: { xp: 40, coins: 20 }
};
```

#### **Tarjetas Mágicas:**
```typescript
const DEMO_FLASHCARDS = [
  {
    front: '¿Qué es 1/2 en decimal?',
    back: '0.5',
    category: 'math'
  },
  {
    front: '¿Cuánto es 1/4 + 1/4?',
    back: '1/2 o 0.5',
    category: 'math'
  },
  {
    front: '¿Qué es una fracción?',
    back: 'Una parte de un entero',
    category: 'math'
  }
];
```

#### **Amigo de Inglés:**
```typescript
const DEMO_ENGLISH_CHAT = [
  {
    role: 'user',
    message: 'Hello! Can you teach me about animals?'
  },
  {
    role: 'buddy',
    message: 'Hi Sofía! I\'d love to teach you about animals! 🐾 What\'s your favorite animal?'
  },
  {
    role: 'user',
    message: 'I like cats!'
  },
  {
    role: 'buddy',
    message: 'Cats are wonderful! 🐱 In English, we call a baby cat a "kitten". Can you say "kitten"?'
  }
];
```

---

## 🎯 FLUJO DEL TOUR:

### **Paso 1: Login**
- Click en "VER DEMO INTERACTIVA"
- Auto-login como Sofía

### **Paso 2: Campus Nova**
- Mostrar avatar, XP, monedas
- Botón: "Ver Misiones" → Auto-navega

### **Paso 3: Centro de Misiones**
- Mostrar 3 misiones de Google Classroom
- Botón: "Abrir Examen de Matemáticas" → Auto-navega

### **Paso 4: Tutor de Matemáticas**
- Campo pre-lleno: "¿Cuánto es 1/2 + 1/4?"
- Botón: "Ver Solución" → Muestra pasos automáticamente
- Animación de confetti + recompensa
- Botón: "Siguiente" → Vuelve a Misiones

### **Paso 5: Centro de Misiones (de nuevo)**
- Botón: "Abrir Quiz de Ciencias" → Auto-navega

### **Paso 6: Centro de Investigación**
- Campo pre-lleno: "El Ciclo del Agua"
- Botón: "Ver Investigación" → Muestra resultado pre-generado
- Botón: "Ver Reporte" → Muestra reporte de Sofía
- Animación de confetti + recompensa
- Botón: "Siguiente" → Tarjetas Mágicas

### **Paso 7: Tarjetas Mágicas**
- Mostrar misiones detectadas
- Botón: "Generar Flashcards" → Muestra 3 tarjetas pre-creadas
- Botón: "Practicar" → Auto-repasa 2 tarjetas
- Animación de confetti + recompensa
- Botón: "Siguiente" → Amigo de Inglés

### **Paso 8: Amigo de Inglés**
- Mostrar conversación pre-cargada
- Botón: "Continuar Chat" → Agrega 2 mensajes más
- Animación de confetti + recompensa
- Botón: "Siguiente" → Tienda

### **Paso 9: Tienda de Premios**
- Mostrar monedas acumuladas (ahora ~600)
- Mostrar accesorios comprados y disponibles
- Botón: "Comprar Lentes de Estrella" → Simula compra
- Avatar se actualiza con lentes
- Botón: "Siguiente" → Salón de la Fama

### **Paso 10: Salón de la Fama**
- Mostrar todas las estadísticas actualizadas
- Mostrar medallas desbloqueadas
- Confetti automático
- Botón: "Ver Arena" → Arena Nova

### **Paso 11: Arena Nova**
- Mostrar tabla de posiciones
- Sofía subió a 1° lugar (por las actividades del tour)
- Botón: "Ver Panel de Padres" → Panel

### **Paso 12: Panel de Padres**
- Mostrar progreso semanal
- Mostrar alertas y recomendaciones
- Botón: "Finalizar Tour" → Vuelve a Campus

---

## 🔧 IMPLEMENTACIÓN TÉCNICA:

### **Archivo 1: `context/DemoTourContext.tsx`**
```typescript
import React, { createContext, useContext, useState } from 'react';

interface DemoTourState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  autoData: any;
}

const DemoTourContext = createContext<any>(null);

export function DemoTourProvider({ children }: { children: React.ReactNode }) {
  const [tourState, setTourState] = useState<DemoTourState>({
    isActive: false,
    currentStep: 0,
    totalSteps: 12,
    autoData: {}
  });

  const startTour = () => {
    setTourState({ ...tourState, isActive: true, currentStep: 1 });
  };

  const nextStep = () => {
    setTourState({ ...tourState, currentStep: tourState.currentStep + 1 });
  };

  const endTour = () => {
    setTourState({ ...tourState, isActive: false, currentStep: 0 });
  };

  return (
    <DemoTourContext.Provider value={{ tourState, startTour, nextStep, endTour }}>
      {children}
    </DemoTourContext.Provider>
  );
}

export const useDemoTour = () => useContext(DemoTourContext);
```

### **Archivo 2: `components/DemoTourButton.tsx`**
```typescript
import React from 'react';
import { useDemoTour } from '@/context/DemoTourContext';
import { ChevronRight, X } from 'lucide-react';

export function DemoTourButton() {
  const { tourState, nextStep, endTour } = useDemoTour();

  if (!tourState.isActive) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
      {/* Indicador de progreso */}
      <div className="bg-white rounded-full px-4 py-2 shadow-xl border-2 border-indigo-500">
        <p className="text-sm font-bold text-indigo-600">
          Paso {tourState.currentStep} de {tourState.totalSteps}
        </p>
      </div>

      {/* Botón siguiente */}
      <button
        onClick={nextStep}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
      >
        Siguiente Paso
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Botón salir */}
      <button
        onClick={endTour}
        className="bg-gray-500 text-white px-4 py-2 rounded-full shadow-lg text-sm hover:bg-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN:

- [ ] Crear `DemoTourContext.tsx`
- [ ] Crear `DemoTourButton.tsx`
- [ ] Agregar datos pre-configurados a cada componente
- [ ] Modificar Centro de Misiones para usar datos demo
- [ ] Modificar Tutor de Matemáticas para mostrar solución pre-generada
- [ ] Modificar Centro de Investigación para mostrar investigación pre-generada
- [ ] Modificar Tarjetas Mágicas para mostrar flashcards pre-creadas
- [ ] Modificar Amigo de Inglés para mostrar chat pre-cargado
- [ ] Agregar navegación automática entre pasos
- [ ] Agregar animaciones y confetti en cada paso
- [ ] Probar flujo completo

---

## 🎬 RESULTADO FINAL:

Usuario hace click en "VER DEMO INTERACTIVA" →
1. Entra como Sofía
2. Ve botón "Siguiente Paso"
3. Click → Va a Misiones
4. Click → Abre Matemáticas
5. Click → Ve solución automática
6. Click → Va a Ciencias
7. Click → Ve investigación automática
8. Click → Va a Flashcards
9. Click → Ve tarjetas pre-creadas
10. Click → Va a Inglés
11. Click → Ve chat pre-cargado
12. Click → Va a Tienda
13. Click → Compra accesorio
14. Click → Ve estadísticas
15. Click → Ve tabla de posiciones
16. Click → Ve panel de padres
17. **FIN DEL TOUR**

**TODO automático, solo haciendo click.** 🚀

---

¿Quieres que implemente este sistema de Demo Tour?
