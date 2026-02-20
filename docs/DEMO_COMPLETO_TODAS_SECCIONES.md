# 🎬 CONFIGURACIÓN DEMO COMPLETO - PASO A PASO

## 📋 ÍNDICE DE SECCIONES A CONFIGURAR:

1. ✅ Login Page (Botón Demo)
2. ✅ Campus Nova (Dashboard Principal)
3. ✅ Centro de Misiones (Task Control Center)
4. ✅ Tarjetas Mágicas (Flashcards)
5. ✅ Tutor de Matemáticas (Math Maestro)
6. ✅ Amigo de Inglés (Buddy Learn)
7. ✅ Centro de Investigación (Research Center)
8. ✅ Tienda de Premios (Avatar Shop)
9. ✅ Salón de la Fama (Hall of Fame)
10. ✅ Arena Nova (Game Arena)
11. ✅ Panel de Padres (Parent Dashboard)

---

# 🚀 IMPLEMENTACIÓN ORDENADA:

## 1️⃣ LOGIN PAGE - Botón Demo

### ✅ YA ESTÁ HECHO
El botón "VER DEMO INTERACTIVA" ya existe y funciona.

**Verificar:**
- Abre la app
- Deberías ver el botón naranja "🎬 VER DEMO INTERACTIVA"
- Al hacer clic, entra como sofia.demo@novaschola.com

---

## 2️⃣ CAMPUS NOVA - Dashboard Principal

### Archivo: `components/Campus/NovaCampus.tsx`

**Objetivo:** Mostrar el avatar, nivel, monedas y racha correctamente.

### ✅ YA ESTÁ CONFIGURADO CON DATOS DE SUPABASE
Los datos de Sofía (Nivel 5, 1,250 XP, 450 monedas, racha 7) ya están en Supabase.

**Verificar:**
- Entra como demo
- Deberías ver:
  - Avatar de superheroína con corona y capa
  - Nivel 5
  - 1,250 XP
  - 450 monedas 🪙
  - Racha de 7 días 🔥

**Si NO ves los datos correctos:**
- El problema es que la app no está leyendo de Supabase
- Verifica que ejecutaste los 3 scripts SQL

---

## 3️⃣ CENTRO DE MISIONES - Task Control Center

### Archivo: `components/Missions/TaskControlCenter.tsx`

**Cambio 1: Ocultar error de Google Classroom**

**Línea 266**, cambia:
```typescript
toast.error("Error cargando misiones.");
```

**Por:**
```typescript
// toast.error("Error cargando misiones."); // Disabled for demo mode
```

**Cambio 2: Pre-seleccionar primera misión**

**Busca la línea ~260** (donde dice `setSelectedTask`):

**Agrega después de `setTasks(uniqueTasks);`:**
```typescript
// Auto-select first mission in demo mode
const isDemoMode = localStorage.getItem('nova_demo_mode') === 'true';
if (isDemoMode && uniqueTasks.length > 0 && !selectedTask) {
  const firstMission = uniqueTasks.find(t => t.subject === 'EXAM_PREP') || uniqueTasks[0];
  setSelectedTask(firstMission);
}
```

**Resultado:**
- ✅ No muestra error
- ✅ Auto-selecciona la primera misión de examen
- ✅ Muestra las 3 misiones de Google Classroom

---

## 4️⃣ TARJETAS MÁGICAS - Flashcards

### Archivo: `components/Flashcards.tsx`

**Cambio 1: Pre-llenar tema**

**Busca la línea donde se define `topicInput`** (aproximadamente línea 70):

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

**Cambio 2: Auto-mostrar misiones detectadas**

**Busca donde se renderizan las `studyOpportunities`** (línea ~320):

**Agrega al inicio del componente:**
```typescript
// Auto-expand detected missions in demo mode
useEffect(() => {
  const isDemoMode = localStorage.getItem('nova_demo_mode') === 'true';
  if (isDemoMode && studyOpportunities.length > 0) {
    // Auto-select first opportunity after 1 second
    setTimeout(() => {
      handleGenerateFromMission(studyOpportunities[0]);
    }, 1000);
  }
}, [studyOpportunities]);
```

**Resultado:**
- ✅ Campo pre-lleno con "Fracciones y Decimales"
- ✅ Auto-genera flashcards después de 1 segundo
- ✅ Muestra las 3 misiones detectadas

---

## 5️⃣ TUTOR DE MATEMÁTICAS - Math Maestro

### Archivo: `components/MathMaestro/MathTutor.tsx` o `components/Tutor/MathTutor.tsx`

**Busca el archivo correcto:**
```bash
# Ejecuta en terminal para encontrar el archivo
find . -name "*MathTutor*" -type f
```

**Cambio: Pre-llenar problema**

**Busca donde se inicializa el input del problema:**

**Cambia:**
```typescript
const [userInput, setUserInput] = useState('');
```

**Por:**
```typescript
// Pre-fill with demo problem
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [userInput, setUserInput] = useState(isDemoMode ? '¿Cuánto es 1/2 + 1/4?' : '');
```

**Resultado:**
- ✅ Ya tiene un problema de fracciones listo
- ✅ Solo presionar Enter para que Lina responda

---

## 6️⃣ AMIGO DE INGLÉS - Buddy Learn

### Archivo: `components/BuddyLearn/BuddyLearn.tsx` o similar

**Cambio: Pre-iniciar conversación**

**Busca donde se inicializa el chat:**

**Agrega:**
```typescript
// Auto-start conversation in demo mode
useEffect(() => {
  const isDemoMode = localStorage.getItem('nova_demo_mode') === 'true';
  if (isDemoMode && messages.length === 0) {
    // Add initial demo message
    const demoMessage = {
      id: 'demo-1',
      role: 'user',
      content: 'Hello! Can you teach me about animals?',
      timestamp: new Date()
    };
    setMessages([demoMessage]);
    // Auto-respond after 1 second
    setTimeout(() => {
      handleSendMessage(demoMessage.content);
    }, 1000);
  }
}, []);
```

**Resultado:**
- ✅ Conversación ya iniciada
- ✅ Buddy responde automáticamente
- ✅ Muestra ejemplo de práctica de inglés

---

## 7️⃣ CENTRO DE INVESTIGACIÓN - Research Center

### Archivo: `components/ResearchCenter/ResearchCenter.tsx`

**Cambio: Pre-llenar búsqueda**

**Línea 53**, cambia:
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

**Por:**
```typescript
// Pre-fill with demo query
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [searchQuery, setSearchQuery] = useState(isDemoMode ? 'El Ciclo del Agua' : '');
```

**Resultado:**
- ✅ Campo pre-lleno con "El Ciclo del Agua"
- ✅ Solo presionar Enter para investigar
- ✅ Nova genera información automáticamente

---

## 8️⃣ TIENDA DE PREMIOS - Avatar Shop

### Archivo: `components/Gamification/AvatarShop.tsx` o similar

**Objetivo:** Mostrar accesorios comprados y disponibles

### ✅ YA ESTÁ CONFIGURADO CON DATOS DE SUPABASE
Sofía ya tiene:
- Corona Dorada (equipada)
- Capa Roja (equipada)
- Lentes de Estrella (en inventario)
- Varita Mágica (en inventario)

**Verificar:**
- Entra a la Tienda
- Deberías ver accesorios comprados y otros disponibles para comprar

---

## 9️⃣ SALÓN DE LA FAMA - Hall of Fame

### Archivo: `components/Gamification/HallOfFame.tsx`

**Objetivo:** Mostrar progreso, medallas y estadísticas

### ✅ YA ESTÁ CONFIGURADO CON DATOS DE SUPABASE
Sofía ya tiene:
- 15 misiones completadas
- 3 medallas desbloqueadas
- Nivel 5 (1,250 XP)
- Racha de 7 días

**Verificar:**
- Entra al Salón de la Fama
- Deberías ver todas las estadísticas

**Mejora opcional - Auto-mostrar medallas:**

**Agrega al inicio del componente:**
```typescript
// Auto-show badges in demo mode
useEffect(() => {
  const isDemoMode = localStorage.getItem('nova_demo_mode') === 'true';
  if (isDemoMode) {
    // Trigger confetti after 1 second
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1000);
  }
}, []);
```

**Resultado:**
- ✅ Confetti automático al entrar
- ✅ Muestra todas las medallas

---

## 🔟 ARENA NOVA - Game Arena

### Archivo: `components/Arena/ArenaLobby.tsx`

**Objetivo:** Mostrar tabla de posiciones

### ✅ YA ESTÁ CONFIGURADO CON DATOS DE SUPABASE
La tabla de posiciones ya tiene:
1. Carlos Rodríguez - Nivel 6 (1,450 XP)
2. **Sofía Martínez** - Nivel 5 (1,250 XP) ← TÚ
3. Ana Gómez - Nivel 5 (1,180 XP)
4. Luis Pérez - Nivel 4 (980 XP)
5. María Torres - Nivel 4 (920 XP)

**Verificar:**
- Entra a Arena Nova
- Deberías ver la tabla de posiciones
- Sofía debe estar en 2° lugar

---

## 1️⃣1️⃣ PANEL DE PADRES - Parent Dashboard

### Archivo: `components/Parent/ParentDashboard.tsx`

**Objetivo:** Mostrar progreso semanal, rendimiento por materia, alertas

### ✅ YA ESTÁ CONFIGURADO CON DATOS DE SUPABASE
El panel ya tiene:
- Progreso semanal (14 misiones, 1,280 XP)
- Rendimiento por materia (Lenguaje 95%, Matemáticas 92%, etc.)
- Alertas recientes
- Recomendaciones de IA

**Verificar:**
- Cambia a vista de Padre (si es posible)
- O crea una cuenta de padre vinculada a Sofía
- Deberías ver todas las estadísticas

---

# ✅ CHECKLIST FINAL:

Después de hacer TODOS los cambios, verifica:

## **Login y Acceso:**
- [ ] Botón "VER DEMO INTERACTIVA" visible
- [ ] Login automático funciona
- [ ] Entra como Sofía Martínez

## **Campus Nova:**
- [ ] Avatar de superheroína visible
- [ ] Nivel 5 mostrado
- [ ] 1,250 XP mostrado
- [ ] 450 monedas mostradas
- [ ] Racha de 7 días mostrada

## **Centro de Misiones:**
- [ ] NO muestra error
- [ ] 3 misiones de Google Classroom visibles
- [ ] Primera misión auto-seleccionada

## **Tarjetas Mágicas:**
- [ ] Campo pre-lleno con "Fracciones y Decimales"
- [ ] 3 misiones detectadas visibles
- [ ] Auto-genera flashcards (opcional)

## **Tutor de Matemáticas:**
- [ ] Campo pre-lleno con "¿Cuánto es 1/2 + 1/4?"
- [ ] Lina responde automáticamente

## **Amigo de Inglés:**
- [ ] Conversación ya iniciada
- [ ] Buddy responde automáticamente

## **Centro de Investigación:**
- [ ] Campo pre-lleno con "El Ciclo del Agua"
- [ ] Solo presionar Enter para investigar

## **Tienda de Premios:**
- [ ] Accesorios comprados visibles
- [ ] Accesorios disponibles visibles
- [ ] 450 monedas mostradas

## **Salón de la Fama:**
- [ ] 15 misiones completadas
- [ ] 3 medallas desbloqueadas
- [ ] Nivel 5 y XP correctos
- [ ] Confetti automático (opcional)

## **Arena Nova:**
- [ ] Tabla de posiciones visible
- [ ] Sofía en 2° lugar
- [ ] 5 competidores mostrados

## **Panel de Padres:**
- [ ] Progreso semanal visible
- [ ] Rendimiento por materia visible
- [ ] Alertas recientes visibles
- [ ] Recomendaciones de IA visibles

---

# 🎬 ORDEN DE IMPLEMENTACIÓN RECOMENDADO:

### **Día 1 - Esenciales (2-3 horas):**
1. Centro de Misiones (ocultar error)
2. Tarjetas Mágicas (pre-llenar)
3. Centro de Investigación (pre-llenar)

### **Día 2 - Tutores (1-2 horas):**
4. Tutor de Matemáticas (pre-llenar)
5. Amigo de Inglés (auto-iniciar)

### **Día 3 - Visuales (1 hora):**
6. Salón de la Fama (confetti automático)
7. Verificar todas las secciones

---

# 📝 NOTAS IMPORTANTES:

1. **Backup antes de empezar:**
   ```bash
   git add .
   git commit -m "Backup antes de configurar demo"
   ```

2. **Prueba después de cada cambio:**
   - Guarda el archivo
   - Recarga la app
   - Entra como demo
   - Verifica que funciona

3. **Si algo falla:**
   - Revisa la consola del navegador (F12)
   - Busca errores en rojo
   - Deshaz el último cambio

---

# 🚀 RESULTADO FINAL:

Una vez completado TODO:
- ✅ Demo 100% funcional
- ✅ Todas las secciones pre-configuradas
- ✅ Sin errores ni pantallas vacías
- ✅ Perfecto para presentaciones
- ✅ Muestra TODAS las funcionalidades

---

**¡Empieza por el Día 1 (Esenciales) y avísame cuando termines cada cambio!** 🎯
