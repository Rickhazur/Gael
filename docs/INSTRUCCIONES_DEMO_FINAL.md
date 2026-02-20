# 🎬 DEMO AUTOMÁTICO - INSTRUCCIONES FINALES

## 🎯 OBJETIVO:
Pre-configurar campos para que el demo funcione automáticamente y mostrar las nuevas características estrella.

---

## ✅ CAMBIO #1: Centro de Investigación

### Archivo: `components/ResearchCenter/ResearchCenter.tsx`

### Línea 53:
**BUSCA esta línea exacta:**
```typescript
  const [searchQuery, setSearchQuery] = useState('');
```

**REEMPLÁZALA con estas 3 líneas:**
```typescript
  // Pre-fill with demo query ONLY in demo mode
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
  const [searchQuery, setSearchQuery] = useState(isDemoMode ? 'El Ciclo del Agua' : '');
```

**Resultado:** En modo demo, el campo tendrá "El Ciclo del Agua" pre-escrito.

---

## ✅ CAMBIO #2: Centro de Misiones

### Archivo: `components/Missions/TaskControlCenter.tsx`

### Líneas 265-266:
**BUSCA estas líneas exactas:**
```typescript
            console.error("Error loading missions:", err);
            toast.error("Error cargando misiones.");
```

**REEMPLÁZALAS con estas 5 líneas:**
```typescript
            console.error("Error loading missions:", err);
            // Only show error if NOT in demo mode
            const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
            if (!isDemoMode) {
                toast.error("Error cargando misiones.");
            }
```

**Resultado:** En modo demo, NO mostrará el error de Google Classroom.

---

## ✅ CAMBIO #3: Tarjetas Mágicas

### Archivo: `components/Flashcards.tsx`

### Paso 1: Encuentra la línea
Busca en el archivo (Ctrl+F) la línea que dice:
```typescript
const [topicInput, setTopicInput] = useState('');
```

Debería estar alrededor de la línea 70-80.

### Paso 2: Reemplázala
**REEMPLÁZALA con estas 3 líneas:**
```typescript
  // Pre-fill with demo topic ONLY in demo mode
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
  const [topicInput, setTopicInput] = useState(isDemoMode ? 'Fracciones y Decimales' : '');
```

**Resultado:** En modo demo, el campo tendrá "Fracciones y Decimales" pre-escrito.

---

## 🆕 NUEVAS CARACTERÍSTICAS PARA DEMOSTRAR

### 🌟 CARACTERÍSTICA ESTRELLA #1: BIBLIOTECA DE CUADERNOS

**Ubicación:** Agregar botón en Dashboard o Sidebar

**Qué mostrar en el demo:**
1. **Vista de Biblioteca**
   - Cuadernos 3D organizados por materia
   - Matemáticas con Lina (morado 📗)
   - English with Rachelle (azul 📘)
   - Ciencias (verde 📙)

2. **Crear Nuevo Cuaderno**
   - Click en "+ Nuevo Cuaderno"
   - Elegir color y emoji
   - Título: "Geometría Avanzada"
   - Materia: Matemáticas

3. **Abrir Cuaderno**
   - Click en cuaderno de Matemáticas
   - Ver lista de notas organizadas
   - Contador de notas visible

**Script para presentación:**
> "Miren esta biblioteca personal donde cada estudiante organiza sus apuntes. Los cuadernos están codificados por color y materia. Matemáticas con Lina en morado, Inglés con Rachelle en azul. Es como tener una mochila digital perfectamente organizada."

---

### 🎨 CARACTERÍSTICA ESTRELLA #2: ASISTENTE VISUAL INTELIGENTE

**Ubicación:** Dentro de cualquier cuaderno al tomar notas

**Qué mostrar en el demo:**

1. **Escribir Nota sobre la Célula**
   ```
   Título: La Célula Animal
   Contenido: "La célula es la unidad básica de la vida. 
   Tiene núcleo que contiene el ADN, citoplasma donde 
   ocurren las reacciones químicas, y membrana celular 
   que protege la célula..."
   ```

2. **Lina Aparece Automáticamente**
   - Después de 2 segundos, aparece el avatar de Lina
   - Mensaje: "💡 Veo que estás estudiando sobre la célula. ¿Te gustaría que genere una imagen para entenderlo mejor?"

3. **Generar Imagen**
   - Click en "✨ Sí, generar imagen"
   - Muestra loading: "Generando tu imagen educativa..."
   - Aparece diagrama de célula con labels

4. **Preview y Opciones**
   - Botón "Usar esta imagen" (verde)
   - Botón "Regenerar" (amarillo)
   - Botón "Cancelar" (gris)

5. **Imagen Insertada**
   - La imagen se agrega automáticamente a la nota
   - Se guarda en la galería del cuaderno
   - Estudiante puede continuar escribiendo

**Script para presentación:**
> "Y aquí viene la magia. Mientras el estudiante escribe sobre la célula, nuestra IA detecta que es un concepto que se beneficiaría de una imagen. Lina aparece y ofrece generar un diagrama educativo. Con un click, genera una ilustración perfecta con labels. Esto es ÚNICO en el mercado educativo. Ninguna otra plataforma tiene detección automática de conceptos visualizables con generación de imágenes educativas."

---

## 🎯 FLUJO COMPLETO DE DEMO RECOMENDADO

### Parte 1: Bienvenida (30 segundos)
1. Mostrar landing page
2. Click en "VER DEMO INTERACTIVA"
3. Entrar al Dashboard

### Parte 2: Características Existentes (2 minutos)
1. **Centro de Investigación** - "El Ciclo del Agua" pre-llenado
2. **Tarjetas Mágicas** - "Fracciones y Decimales" pre-llenado
3. **Math Maestro** - Mostrar a Lina enseñando

### Parte 3: ⭐ NUEVAS CARACTERÍSTICAS (3 minutos)

#### A. Biblioteca de Cuadernos (1.5 minutos)
1. Abrir biblioteca desde sidebar
2. Mostrar cuadernos organizados
3. Crear nuevo cuaderno "Geometría"
4. Abrir cuaderno de Matemáticas
5. Ver notas organizadas

#### B. Asistente Visual (1.5 minutos)
1. Abrir cuaderno de Ciencias
2. Crear nueva nota "La Célula"
3. Escribir contenido (copiar/pegar preparado)
4. **ESPERAR** a que Lina aparezca (2 segundos)
5. Click en "Generar imagen"
6. Mostrar preview
7. Click en "Usar esta imagen"
8. Mostrar imagen insertada en nota

### Parte 4: Cierre (30 segundos)
1. Resaltar diferenciadores:
   - ✅ Organización visual con cuadernos 3D
   - ✅ Detección automática de conceptos
   - ✅ Generación de imágenes educativas
   - ✅ Tutoras personalizadas (Lina/Rachelle)
2. Llamado a la acción

---

## 📋 CHECKLIST PRE-DEMO

### Antes de la presentación:

- [ ] Ejecutar schema de notebooks en Supabase
- [ ] Verificar que modo demo está activado
- [ ] Preparar texto para copiar/pegar sobre "La Célula"
- [ ] Probar generación de imagen (verificar API key)
- [ ] Verificar que Lina y Rachelle tienen avatares correctos
- [ ] Limpiar localStorage si es necesario
- [ ] Tener navegador en pantalla completa
- [ ] Cerrar otras pestañas/aplicaciones

### Texto Pre-preparado para Demo:

```
TÍTULO: La Célula Animal

CONTENIDO:
La célula es la unidad básica de la vida. Todas las células animales tienen tres partes principales:

1. NÚCLEO: Contiene el ADN y controla todas las actividades de la célula. Es como el cerebro de la célula.

2. CITOPLASMA: Es el líquido gelatinoso donde ocurren todas las reacciones químicas necesarias para la vida.

3. MEMBRANA CELULAR: Es la capa protectora que rodea la célula y controla qué entra y qué sale.

Las células trabajan juntas para formar tejidos, los tejidos forman órganos, y los órganos forman sistemas que mantienen nuestro cuerpo funcionando.
```

---

## 🎬 PUNTOS CLAVE PARA ENFATIZAR

### Durante la Demo de Biblioteca:
- "Organización visual que los niños entienden"
- "Cada materia con su color y su profesora"
- "Como una mochila digital, pero mejor organizada"

### Durante la Demo de Asistente Visual:
- "Detección AUTOMÁTICA de conceptos"
- "La tutora OFRECE ayuda, no la impone"
- "Genera imágenes EDUCATIVAS, no decorativas"
- "ÚNICO en el mercado - nadie más tiene esto"

---

## 🚀 RESULTADO FINAL

Con estas características integradas:
- ✅ Demo fluido y automático
- ✅ Muestra diferenciadores únicos
- ✅ Impacto visual inmediato
- ✅ Valor pedagógico claro
- ✅ Tecnología de punta evidente

---

## 📊 COMPARACIÓN CON COMPETENCIA

| Característica | Nova Schola | Otros |
|----------------|-------------|-------|
| Cuadernos organizados | ✅ 3D, por materia | ❌ Lista plana |
| Detección de conceptos | ✅ Automática con IA | ❌ No existe |
| Generación de imágenes | ✅ Educativas, con labels | ❌ No existe |
| Tutoras personalizadas | ✅ Lina y Rachelle | ❌ Genérico |
| Integración completa | ✅ Todo conectado | ❌ Módulos separados |

---

**¡Con estas características, Nova Schola se posiciona como la plataforma educativa más innovadora del mercado!** 🚀✨
