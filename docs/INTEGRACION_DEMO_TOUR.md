# 🎬 INTEGRACIÓN DEL DEMO TOUR - INSTRUCCIONES

## ✅ ARCHIVOS CREADOS:

1. ✅ `context/DemoTourContext.tsx` - Context con 10 pasos pre-configurados
2. ✅ `components/DemoTour/DemoTourButton.tsx` - Botón flotante del tour

---

## 📋 PASOS DE INTEGRACIÓN:

### **PASO 1: Agregar el Provider en App.tsx**

**Archivo:** `App.tsx` o `_app.tsx` (depende de tu estructura)

**Busca donde están los otros Providers** (LearningProvider, GamificationProvider, etc.)

**Agrega:**
```typescript
import { DemoTourProvider } from './context/DemoTourContext';

// Dentro del return, envuelve todo con:
<DemoTourProvider>
  {/* Resto de tu app */}
</DemoTourProvider>
```

**Ejemplo completo:**
```typescript
return (
  <DemoTourProvider>
    <LearningProvider>
      <GamificationProvider>
        {/* Tu app */}
      </GamificationProvider>
    </LearningProvider>
  </DemoTourProvider>
);
```

---

### **PASO 2: Agregar el Botón en MainLayout.tsx**

**Archivo:** `components/MainLayout.tsx`

**Al final del componente, antes del cierre del div principal:**

```typescript
import { DemoTourButton } from './DemoTour/DemoTourButton';

// Dentro del return, al final:
return (
  <div>
    {/* Todo tu contenido actual */}
    
    {/* Agregar esto al final */}
    <DemoTourButton />
  </div>
);
```

---

### **PASO 3: Iniciar el Tour desde el Login**

**Archivo:** `components/LoginPage.tsx`

**Busca el botón "VER DEMO INTERACTIVA"** (línea ~595)

**Modifica el onClick:**

```typescript
import { useDemoTour } from '@/context/DemoTourContext';

// Dentro del componente:
const { startTour } = useDemoTour();

// En el onClick del botón demo:
onClick={() => {
    // Auto-login con demo credentials
    setFormData({
        ...formData,
        email: 'sofia.demo@novaschola.com',
        password: 'demo2024'
    });
    // Enable demo mode
    localStorage.setItem('nova_demo_mode', 'true');
    // Trigger login
    onLogin({ email: 'sofia.demo@novaschola.com', password: 'demo2024' }, 'STUDENT');
    
    // **AGREGAR ESTO:**
    // Start demo tour after login
    setTimeout(() => {
        startTour();
    }, 1000); // Espera 1 segundo para que cargue el dashboard
}}
```

---

### **PASO 4: Navegación Automática**

**Archivo:** `components/MainLayout.tsx`

**Agregar efecto para navegar automáticamente según el paso del tour:**

```typescript
import { useDemoTour } from '@/context/DemoTourContext';
import { useEffect } from 'react';

// Dentro del componente:
const { tourState, getCurrentStepData } = useDemoTour();

useEffect(() => {
  if (tourState.isActive) {
    const currentStep = getCurrentStepData();
    if (currentStep && currentStep.view) {
      // Navegar automáticamente a la vista del paso actual
      setCurrentView(currentStep.view);
    }
  }
}, [tourState.currentStep, tourState.isActive]);
```

---

## 🎯 RESULTADO ESPERADO:

Después de integrar todo:

1. Usuario hace click en "VER DEMO INTERACTIVA"
2. Entra como Sofía
3. **Aparece el botón flotante** en la esquina inferior derecha
4. Botón muestra: "Paso 1 de 10: Bienvenida al Campus Nova"
5. Usuario hace click en "Siguiente"
6. **Navega automáticamente** al Centro de Misiones
7. Botón actualiza: "Paso 2 de 10: Centro de Misiones"
8. Y así sucesivamente...

---

## 🔧 VERIFICACIÓN:

### **Test 1: Context funciona**
```typescript
// En cualquier componente:
import { useDemoTour } from '@/context/DemoTourContext';

const { tourState } = useDemoTour();
console.log('Tour activo:', tourState.isActive);
console.log('Paso actual:', tourState.currentStep);
```

### **Test 2: Botón aparece**
- Inicia el tour
- Deberías ver el botón flotante en la esquina inferior derecha
- Con fondo blanco, borde morado, y botones de navegación

### **Test 3: Navegación funciona**
- Click en "Siguiente"
- Debería cambiar de vista automáticamente
- Contador debería actualizar (Paso 2 de 10, etc.)

---

## 🎨 PERSONALIZACIÓN (Opcional):

### **Cambiar colores del botón:**
En `DemoTourButton.tsx`, busca:
```typescript
className="bg-gradient-to-r from-indigo-500 to-purple-600"
```

Cambia a tus colores preferidos.

### **Cambiar posición del botón:**
En `DemoTourButton.tsx`, busca:
```typescript
className="fixed bottom-8 right-8"
```

Cambia `bottom-8` o `right-8` a otras posiciones.

### **Agregar más pasos:**
En `DemoTourContext.tsx`, agrega más objetos al array `DEMO_STEPS`.

---

## 📝 CHECKLIST DE INTEGRACIÓN:

- [ ] Agregar DemoTourProvider en App.tsx
- [ ] Agregar DemoTourButton en MainLayout.tsx
- [ ] Modificar onClick del botón demo en LoginPage.tsx
- [ ] Agregar navegación automática en MainLayout.tsx
- [ ] Probar que el botón aparece
- [ ] Probar que la navegación funciona
- [ ] Probar los 10 pasos completos

---

## 🐛 TROUBLESHOOTING:

### **El botón no aparece:**
- Verifica que DemoTourProvider esté en App.tsx
- Verifica que DemoTourButton esté en MainLayout.tsx
- Verifica que startTour() se llame después del login

### **La navegación no funciona:**
- Verifica que el useEffect esté en MainLayout.tsx
- Verifica que setCurrentView esté disponible
- Revisa la consola por errores

### **Errores de TypeScript:**
- Verifica que ViewState tenga todos los valores necesarios
- Verifica que los imports sean correctos

---

## 🚀 SIGUIENTE NIVEL (Futuro):

Una vez que funcione el tour básico, podemos agregar:

1. **Datos pre-cargados** en cada paso
2. **Animaciones automáticas** (confetti, highlights)
3. **Tooltips explicativos** en elementos específicos
4. **Simulación de interacciones** (clicks automáticos)
5. **Narración en off** con texto-a-voz

---

**¿Listo para integrar? Empieza por el Paso 1 (App.tsx) y avísame si necesitas ayuda.** 🎬
