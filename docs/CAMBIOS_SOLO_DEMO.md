# 🎬 CAMBIOS PARA MODO DEMO - SOLO AFECTA CUENTA DEMO

## ⚠️ IMPORTANTE:
Todos estos cambios usan `localStorage.getItem('nova_demo_mode') === 'true'` para detectar si es modo demo.
**NO afectan a usuarios normales**, solo a la cuenta demo.

---

## CAMBIO #1: Centro de Misiones - Ocultar Error

**Archivo:** `components/Missions/TaskControlCenter.tsx`
**Línea:** 265-266

**BUSCA:**
```typescript
console.error("Error loading missions:", err);
toast.error("Error cargando misiones.");
```

**REEMPLAZA CON:**
```typescript
console.error("Error loading missions:", err);
// Only show error if NOT in demo mode
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
if (!isDemoMode) {
    toast.error("Error cargando misiones.");
}
```

**EFECTO:** El error NO aparece en modo demo, pero SÍ aparece para usuarios normales.

---

## CAMBIO #2: Centro de Investigación - Pre-llenar Búsqueda

**Archivo:** `components/ResearchCenter/ResearchCenter.tsx`
**Línea:** 53

**BUSCA:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

**REEMPLAZA CON:**
```typescript
// Pre-fill with demo query ONLY in demo mode
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [searchQuery, setSearchQuery] = useState(isDemoMode ? 'El Ciclo del Agua' : '');
```

**EFECTO:** Solo en modo demo, el campo tiene "El Ciclo del Agua". Usuarios normales ven el campo vacío.

---

## CAMBIO #3: Tarjetas Mágicas - Pre-llenar Tema

**Archivo:** `components/Flashcards.tsx`
**Línea:** ~70 (busca donde se define `topicInput`)

**BUSCA:**
```typescript
const [topicInput, setTopicInput] = useState('');
```

**REEMPLAZA CON:**
```typescript
// Pre-fill with demo topic ONLY in demo mode
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [topicInput, setTopicInput] = useState(isDemoMode ? 'Fracciones y Decimales' : '');
```

**EFECTO:** Solo en modo demo, el campo tiene "Fracciones y Decimales". Usuarios normales ven el campo vacío.

---

## ✅ VERIFICACIÓN:

Después de hacer estos 3 cambios:

1. **Entra como usuario normal:**
   - Centro de Misiones: Muestra error si falla Google Classroom ✅
   - Centro de Investigación: Campo vacío ✅
   - Tarjetas Mágicas: Campo vacío ✅

2. **Entra como demo (botón "VER DEMO INTERACTIVA"):**
   - Centro de Misiones: NO muestra error ✅
   - Centro de Investigación: Campo pre-lleno con "El Ciclo del Agua" ✅
   - Tarjetas Mágicas: Campo pre-lleno con "Fracciones y Decimales" ✅

---

## 🔒 SEGURIDAD:

Estos cambios son **100% seguros** porque:
- ✅ Solo afectan cuando `localStorage.getItem('nova_demo_mode') === 'true'`
- ✅ Esa variable solo se activa con el botón "VER DEMO INTERACTIVA"
- ✅ Usuarios normales NUNCA verán los cambios
- ✅ No tocan la base de datos
- ✅ No afectan la lógica del programa

---

## 📝 ORDEN DE IMPLEMENTACIÓN:

1. Haz el Cambio #1 (Centro de Misiones)
2. Guarda y prueba
3. Haz el Cambio #2 (Centro de Investigación)
4. Guarda y prueba
5. Haz el Cambio #3 (Tarjetas Mágicas)
6. Guarda y prueba

---

## 🎯 RESULTADO FINAL:

- ✅ Demo funciona perfectamente sin errores
- ✅ Usuarios normales NO se ven afectados
- ✅ Solo 3 cambios pequeños y seguros
- ✅ Fácil de revertir si es necesario

---

**¿Listo para hacer el Cambio #1?** 🚀
