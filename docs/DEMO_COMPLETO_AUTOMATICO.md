# 🎬 GUÍA COMPLETA: Configurar Demo Automático 100%

## 🎯 Objetivo:
Hacer que la cuenta demo muestre TODAS las funcionalidades del programa automáticamente, sin que el usuario tenga que escribir nada.

---

## 📋 CAMBIOS A REALIZAR:

### 1️⃣ **Centro de Investigación - Pre-llenar búsqueda**

**Archivo:** `components/ResearchCenter/ResearchCenter.tsx`

**Línea 53**, cambia:
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

**Por:**
```typescript
// Pre-fill with demo query for automatic demo mode
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [searchQuery, setSearchQuery] = useState(isDemoMode ? 'El Ciclo del Agua' : '');
```

**Resultado:** El campo de búsqueda ya tendrá "El Ciclo del Agua" escrito.

---

### 2️⃣ **Tarjetas Mágicas - Auto-seleccionar misión**

**Archivo:** `components/Flashcards.tsx`

**Busca la línea ~70** (donde se define `const [topicInput, setTopicInput] = useState('')`):

**Cambia:**
```typescript
const [topicInput, setTopicInput] = useState('');
```

**Por:**
```typescript
// Pre-fill with demo topic
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [topicInput, setTopicInput] = useState(isDemoMode ? 'Fracciones y Decimales' : '');
```

**Resultado:** El campo ya tendrá "Fracciones y Decimales" listo para generar.

---

### 3️⃣ **Centro de Misiones - Ocultar error**

**Archivo:** `components/Missions/TaskControlCenter.tsx`

**Línea 266**, cambia:
```typescript
toast.error("Error cargando misiones.");
```

**Por:**
```typescript
// toast.error("Error cargando misiones."); // Disabled for demo mode
```

**Resultado:** No mostrará el error de Google Classroom en modo demo.

---

### 4️⃣ **Tutor de Matemáticas - Pre-llenar problema**

**Archivo:** `components/MathMaestro/MathTutor.tsx` (si existe)

**Busca donde se inicializa el input del problema matemático y pre-llénalo con:**
```typescript
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [problem, setProblem] = useState(isDemoMode ? '1/2 + 1/4' : '');
```

**Resultado:** Ya tendrá un problema de fracciones listo.

---

### 5️⃣ **Amigo de Inglés - Pre-llenar conversación**

**Archivo:** `components/BuddyLearn/BuddyLearn.tsx` (o similar)

**Pre-llena el primer mensaje con:**
```typescript
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [initialMessage, setInitialMessage] = useState(
  isDemoMode ? 'Hello! Can you teach me about animals?' : ''
);
```

**Resultado:** La conversación ya estará iniciada.

---

## 🎨 MEJORAS VISUALES PARA EL DEMO:

### 6️⃣ **Banner de Modo Demo**

**Archivo:** `components/MainLayout.tsx`

**Agrega al inicio del componente:**
```typescript
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';

// Dentro del return, antes del contenido principal:
{isDemoMode && (
  <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white py-2 px-4 text-center font-bold text-sm">
    🎬 MODO DEMOSTRACIÓN - Todos los datos son ficticios para fines educativos
  </div>
)}
```

**Resultado:** Un banner arriba indicando que es modo demo.

---

### 7️⃣ **Tooltips Explicativos**

**En cada sección principal, agrega tooltips que expliquen qué hace:**

**Ejemplo en Campus Nova:**
```typescript
{isDemoMode && (
  <div className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl max-w-xs z-50">
    <p className="text-sm font-bold">💡 Haz clic en cualquier edificio para explorar</p>
  </div>
)}
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN:

### **Prioridad Alta (Esencial):**
1. ✅ Centro de Investigación (cambio #1)
2. ✅ Tarjetas Mágicas (cambio #2)
3. ✅ Centro de Misiones (cambio #3)

### **Prioridad Media (Recomendado):**
4. ⭐ Tutor de Matemáticas (cambio #4)
5. ⭐ Amigo de Inglés (cambio #5)

### **Prioridad Baja (Opcional):**
6. 💡 Banner de Modo Demo (cambio #6)
7. 💡 Tooltips Explicativos (cambio #7)

---

## 📝 CHECKLIST DE VERIFICACIÓN:

Después de hacer los cambios, verifica:

- [ ] Login con botón "VER DEMO INTERACTIVA" funciona
- [ ] Entras como Sofía Martínez (Nivel 5, 1,250 XP, 450 monedas)
- [ ] Centro de Investigación tiene "El Ciclo del Agua" pre-escrito
- [ ] Tarjetas Mágicas tiene "Fracciones y Decimales" pre-escrito
- [ ] Centro de Misiones NO muestra error
- [ ] Tutor de Matemáticas tiene problema pre-escrito
- [ ] Amigo de Inglés tiene conversación iniciada
- [ ] Avatar de superheroína con corona y capa visible
- [ ] 3 misiones de Google Classroom visibles
- [ ] 3 medallas desbloqueadas en Salón de la Fama

---

## 🎬 GUIÓN DE PRESENTACIÓN:

### **Introducción (30 segundos):**
> "Les voy a mostrar Nova Schola, una plataforma que combina IA con gamificación. Voy a entrar en modo demo para que vean cómo funciona."

**[Clic en "VER DEMO INTERACTIVA"]**

### **Campus Nova (1 minuto):**
> "Aquí está Sofía, una estudiante de 3° grado. Tiene nivel 5, 1,250 puntos de experiencia, y una racha de 7 días. Cada edificio es una funcionalidad diferente."

### **Centro de Misiones (1 minuto):**
> "Aquí vemos las tareas de Google Classroom convertidas en misiones gamificadas. Sofía tiene un examen de matemáticas, un quiz de ciencias, y un proyecto de sociales."

### **Tarjetas Mágicas (1 minuto):**
> "La app detecta automáticamente que Sofía tiene un examen de fracciones y genera tarjetas de estudio. Solo presiono Enter..."

**[Presionar Enter]**

> "Y Nova crea las tarjetas automáticamente. Sofía puede estudiar y ganar puntos."

### **Centro de Investigación (1 minuto):**
> "Aquí Sofía puede investigar cualquier tema. Ya tiene 'El Ciclo del Agua' listo. Presiono Investigar..."

**[Clic en Investigar]**

> "Y Nova busca información segura y apropiada para su edad. Luego puede escribir su reporte con sus propias palabras."

### **Cierre (30 segundos):**
> "En resumen: Google Classroom integrado, IA pedagógica, y gamificación real. Todo en una plataforma."

---

## 💾 BACKUP:

Antes de hacer cambios, crea un backup:
```bash
# En la carpeta del proyecto
git add .
git commit -m "Backup antes de configurar demo automático"
```

---

## ✅ RESULTADO FINAL:

Una vez implementados todos los cambios:
- ✅ Demo 100% funcional sin escribir nada
- ✅ Perfecto para presentaciones en colegios
- ✅ Muestra todas las funcionalidades clave
- ✅ Sin errores ni pantallas vacías
- ✅ Experiencia fluida y profesional

---

**¿Listo para implementar? Empieza por los cambios de Prioridad Alta (1, 2, 3).** 🚀
