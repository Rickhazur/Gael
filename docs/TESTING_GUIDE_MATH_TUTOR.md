# 🧪 GUÍA DE PRUEBAS: Tutor Matemático Perfecto

## 🎯 Objetivo
Verificar que el sistema de tutorización matemática funciona perfectamente con carry-over animado.

---

## ✅ Pruebas Básicas

### **Prueba 1: Suma Simple (sin carry-over)**
```
1. Escribe en la pizarra: 23 + 14
2. Espera la pregunta: "¿Cuánto es 3 más 4?"
3. Responde: 7
4. Espera: "¡Correcto! 7. Escribimos 7."
5. Espera la pregunta: "¿Cuánto es 2 más 1?"
6. Responde: 3
7. Resultado: 37 ✅
```

**✅ Verificar:**
- No debe aparecer nube (no hay carry-over)
- Resultado correcto: 37
- Celebración al final

---

### **Prueba 2: Suma con Carry-Over (LA PRUEBA CLAVE)**
```
1. Escribe en la pizarra: 47 + 38
2. Espera la pregunta: "¿Cuánto es 7 más 8?"
3. Responde: 15
4. Espera: "¡Exacto! Quince. Como es mayor que nueve, 
            escribimos 5 y llevamos 1 a las decenas."
5. 🔍 VERIFICAR: Debe aparecer la NUBE ☁️ con el número 1
6. Espera la pregunta: "¿Cuánto es 4 más 3 más 1 que llevamos?"
7. Responde: 8
8. Resultado: 85 ✅
```

**✅ Verificar:**
- ☁️ Nube aparece con carita 😊
- Nube contiene el número "1"
- Nube está posicionada arriba de las decenas
- Resultado correcto: 85
- Confetti y estrellas al final

---

### **Prueba 3: Suma con Múltiples Carry-Overs**
```
1. Escribe: 789 + 456
2. Unidades: 9 + 6 = 15 → Escribe 5, lleva 1 ☁️
3. Decenas: 8 + 5 + 1 = 14 → Escribe 4, lleva 1 ☁️
4. Centenas: 7 + 4 + 1 = 12 → Escribe 2, lleva 1 ☁️
5. Resultado: 1245 ✅
```

**✅ Verificar:**
- Nube aparece 3 veces
- Cada vez con el número correcto
- Resultado final: 1245

---

### **Prueba 4: Resta Simple**
```
1. Escribe: 58 - 23
2. Unidades: 8 - 3 = 5
3. Decenas: 5 - 2 = 3
4. Resultado: 35 ✅
```

---

### **Prueba 5: Resta con Préstamo**
```
1. Escribe: 52 - 27
2. Unidades: 2 < 7 → Pedir prestado
3. Espera: "2 es menor que 7, así que pedimos prestado 1 de las decenas"
4. Ahora: 12 - 7 = 5
5. Decenas: 4 - 2 = 2
6. Resultado: 25 ✅
```

---

### **Prueba 6: Multiplicación**
```
1. Escribe: 23 × 4
2. Unidades: 3 × 4 = 12 → Escribe 2, lleva 1 ☁️
3. Decenas: 2 × 4 + 1 = 9
4. Resultado: 92 ✅
```

---

### **Prueba 7: División**
```
1. Escribe: 85 ÷ 5
2. Espera: "¿Cuántas veces cabe 5 en 85?"
3. Responde: 17
4. Resultado: 17 ✅
```

---

## 🔍 Verificaciones Visuales

### **La Nube Debe:**
- ✅ Aparecer cuando hay carry-over
- ✅ Tener una carita sonriente 😊
- ✅ Mostrar el número correcto
- ✅ Estar posicionada arriba de la siguiente columna
- ✅ Tener sombra azul (glow effect)
- ✅ Ser blanca con borde azul

### **La Pizarra Debe:**
- ✅ Mostrar números coloridos
- ✅ Destacar (highlight) la columna actual
- ✅ Mostrar confetti cuando termine
- ✅ Mostrar estrellas en las esquinas
- ✅ Línea de operación con gradiente

---

## 🐛 Problemas Comunes y Soluciones

### **Problema 1: La nube no aparece**
```
Causa: carry no se está pasando correctamente
Solución: Verificar en consola:
  console.log("Carry:", step.carry);
  console.log("Highlight:", step.highlight);
```

### **Problema 2: La tutora se equivoca**
```
Causa: Modo guiado no se activó
Solución: Verificar en consola:
  console.log("Modo guiado:", isGuidedMode.current);
  console.log("Pasos generados:", currentProblemSteps.current.length);
```

### **Problema 3: No avanza al siguiente paso**
```
Causa: Respuesta no se detecta como número
Solución: Asegurarse de responder solo con números
  Correcto: "15"
  Incorrecto: "quince" o "15 es la respuesta"
```

---

## 📊 Checklist de Funcionalidad

### **Sistema de Detección:**
- [ ] Detecta suma (+)
- [ ] Detecta resta (-)
- [ ] Detecta multiplicación (× o x o *)
- [ ] Detecta división (÷ o /)
- [ ] Ignora espacios en el problema

### **Cálculos:**
- [ ] Suma correcta
- [ ] Resta correcta
- [ ] Multiplicación correcta
- [ ] División correcta
- [ ] Carry-over automático
- [ ] Préstamo automático

### **Visualización:**
- [ ] Nube aparece con carry-over
- [ ] Nube tiene carita 😊
- [ ] Números coloridos
- [ ] Highlights funcionan
- [ ] Confetti al terminar
- [ ] Estrellas al terminar

### **Interacción:**
- [ ] Pregunta paso a paso
- [ ] Valida respuestas
- [ ] Avanza automáticamente
- [ ] Celebra al completar
- [ ] XP y gamificación funcionan

---

## 🎮 Prueba Completa de Integración

### **Escenario: Estudiante Nuevo**
```
1. Abre el tutor matemático
2. Escucha el saludo de Lina
3. Escribe: 47 + 38
4. Sigue las instrucciones paso a paso
5. Observa la nube cuando aparece
6. Completa el ejercicio
7. Recibe celebración
8. Ve XP aumentar
```

**Tiempo estimado:** 2-3 minutos  
**Resultado esperado:** Ejercicio completado sin errores

---

## 📝 Registro de Pruebas

### **Fecha:** _____________
### **Probado por:** _____________

| Prueba | Estado | Notas |
|--------|--------|-------|
| Suma simple | ⬜ | |
| Suma con carry-over | ⬜ | |
| Suma múltiple carry | ⬜ | |
| Resta simple | ⬜ | |
| Resta con préstamo | ⬜ | |
| Multiplicación | ⬜ | |
| División | ⬜ | |
| Nube animada | ⬜ | |
| Confetti final | ⬜ | |
| Gamificación | ⬜ | |

---

## 🚀 Pruebas Avanzadas (Opcional)

### **Prueba de Estrés:**
```
1. Escribe: 9999 + 9999
2. Verifica que maneje números grandes
3. Resultado esperado: 19998
```

### **Prueba de Límites:**
```
1. Escribe: 1 + 1
2. Verifica que funcione con números pequeños
3. Resultado esperado: 2
```

### **Prueba de Errores:**
```
1. Escribe: 10 ÷ 0
2. Verifica que muestre error apropiado
3. Mensaje esperado: "¡No podemos dividir entre cero!"
```

---

## ✅ Criterios de Éxito

El sistema está funcionando perfectamente si:

1. ✅ **Todos los cálculos son correctos**
2. ✅ **La nube aparece cuando debe**
3. ✅ **El método socrático fluye naturalmente**
4. ✅ **No hay errores en consola**
5. ✅ **La experiencia es fluida y agradable**

---

**Si todas las pruebas pasan: ¡EL TUTOR ES PERFECTO! 🎉**
