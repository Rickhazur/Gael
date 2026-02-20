# ✅ Lista de Verificación Manual - Nova Schola

**Fecha:** 2026-01-05
**Versión:** 2.0 (Final Deployment)  
**Usuario de prueba:** test123@gmail.com (o el que creaste)

---

## 📋 **INSTRUCCIONES:**

Para cada item:
- ✅ = Funciona correctamente
- ❌ = No funciona / Tiene error
- ⚠️ = Funciona pero con problemas
- ⏭️ = No probado / Saltado

---

## 0️⃣ **MODAL DE CONTACTO & CORREOS** (NUEVO)

- [ ] Botón "Solicitar Demo" abre el modal
- [ ] Validación de campos funciona (email incorrecto)
- [ ] Al enviar, muestra notificación de éxito (Toast)
- [ ] **CRÍTICO:** El correo llega a `novaschola25@gmail.com`
- [ ] No aparece error 404 ni 500 al enviar

---

## 1️⃣ **AUTENTICACIÓN** ✅ COMPLETADO

- [✅] Registro de estudiante funciona
- [ ] Login con credenciales correctas
- [ ] Logout funciona
- [ ] Mensaje de error con credenciales incorrectas
- [ ] Cambio de idioma (ES/EN) funciona

**Notas:**
- Registro: ✅ Funciona después de configurar Supabase
- Credenciales de prueba: test123@gmail.com / TestPass123!

---

## 2️⃣ **DASHBOARD / PÁGINA PRINCIPAL**

- [ ] Dashboard carga correctamente después de login
- [ ] Se muestra el nombre del estudiante
- [ ] Se muestra el avatar (si hay uno configurado)
- [ ] Balance de Nova Coins visible
- [ ] Navegación lateral (sidebar) funciona
- [ ] Todos los módulos son accesibles

**Qué verificar:**
- ¿Ves tu nombre en la pantalla?
- ¿Cuántas Nova Coins tienes? (debería ser 100 inicial)
- ¿Qué módulos ves en el menú?

---

## 3️⃣ **SISTEMA DE AVATAR**

### Avatar Shop
- [ ] Puedes acceder a la tienda de avatares
- [ ] Se muestran accesorios disponibles
- [ ] Se muestra el precio de cada accesorio
- [ ] Puedes comprar un accesorio (si tienes coins)
- [ ] El balance de coins se actualiza después de comprar

### Personalización
- [ ] Puedes cambiar tu avatar base
- [ ] Puedes equipar accesorios comprados
- [ ] Puedes desequipar accesorios
- [ ] **PERSISTENCIA:** Los cambios se guardan al recargar (F5)
- [ ] **PERSISTENCIA:** Los items comprados siguen comprados al recargar

### Mascotas (Pets)
- [ ] Puedes adoptar una mascota (Huevo o Robot)
- [ ] Se descuentan las monedas correctamente
- [ ] Puedes alimentar/jugar con la mascota
- [ ] **PERSISTENCIA:** La mascota sigue ahí al recargar la página

**Prueba esto:**
1. Ve a la tienda de avatares
2. Compra el accesorio más barato
3. Equípalo
4. Refresca la página (F5)
5. ¿Sigue equipado el accesorio?

---

## 4️⃣ **ARENA Y MISIONES**

### Misiones Diarias (Arena)
- [ ] Puedes acceder al módulo Arena
- [ ] Se muestran quests/misiones disponibles
- [ ] Puedes completar una misión
- [ ] Recibes recompensas (XP, coins) al completar
- [ ] El progreso se guarda

### Misiones Escolares (MissionsLog)
- [ ] Puedes acceder a MissionsLog
- [ ] Se muestran tareas de Google Classroom (si hay)
- [ ] Las misiones son diferentes a las de Arena

**Prueba esto:**
1. Ve a Arena
2. Completa una misión fácil
3. Verifica que recibiste coins/XP
4. Refresca la página
5. ¿La misión sigue marcada como completada?

---

## 5️⃣ **MATH MAESTRO**

- [ ] Puedes acceder al módulo Math Tutor
- [ ] Se cargan problemas matemáticos
- [ ] Puedes resolver un problema
- [ ] Recibes feedback del AI
- [ ] El feedback es apropiado para primaria
- [ ] El progreso se guarda

**Prueba esto:**
1. Ve a Math Tutor
2. Resuelve 1-2 problemas
3. ¿El lenguaje es apropiado para niños?
4. ¿El AI te ayuda si te equivocas?

---

## 6️⃣ **AI TUTOR Y ACADEMIC BROWSER**

### Academic Browser
- [ ] Puedes acceder al navegador académico
- [ ] Puedes pegar texto en el área de texto
- [ ] El AI analiza el texto
- [ ] Se generan "Teacher Keys"
- [ ] Se generan "Sentence Starters"

### Feedback Contextual
- [ ] Los Teacher Keys son relevantes al texto
- [ ] Los Sentence Starters son específicos (no genéricos)
- [ ] Puedes escribir usando los hints
- [ ] Recibes feedback sobre tu escritura

**Prueba esto:**
1. Ve a Academic Browser
2. Pega este texto: "El ciclo del agua incluye evaporación, condensación y precipitación"
3. ¿El AI menciona estos conceptos en los Teacher Keys?
4. Escribe una oración usando los hints
5. ¿El feedback es específico?

---

## 7️⃣ **ELEVENLABS TTS (AUDIO)**

- [ ] Hay botones de audio (🔊) en la app
- [ ] Al hacer clic, se reproduce audio
- [ ] La voz suena natural (no robótica)
- [ ] No hay errores de "Invalid Key"
- [ ] El navegador no bloquea el audio

**Prueba esto:**
1. Busca un botón de audio en cualquier módulo
2. Haz clic
3. ¿Se reproduce el audio?
4. ¿Suena como voz humana?

---

## 8️⃣ **SISTEMA DE ECONOMÍA**

- [ ] Puedes ver tu balance de Nova Coins
- [ ] El balance se actualiza al ganar coins
- [ ] El balance se actualiza al gastar coins
- [ ] Los cambios persisten (refrescar página)

**Prueba esto:**
1. Anota tu balance actual: _____ coins
2. Completa una misión o compra algo
3. Verifica que el balance cambió
4. Refresca la página (F5)
5. ¿El balance sigue siendo correcto?

---

## 9️⃣ **PANEL DE ADMINISTRACIÓN** (Solo si tienes cuenta admin)

- [ ] Puedes acceder al panel admin
- [ ] Ves la lista de estudiantes
- [ ] Puedes editar un estudiante
- [ ] Puedes modificar el balance de coins
- [ ] Puedes agregar items a la tienda
- [ ] Puedes editar items de la tienda
- [ ] Puedes eliminar items de la tienda

**Nota:** Si no tienes cuenta admin, salta esta sección.

---

## 🔟 **SISTEMA DE SUSCRIPCIONES**

- [ ] Puedes acceder a la página de suscripciones
- [ ] Se muestran 3 planes: Explorador, Aventurero, Leyenda
- [ ] Los precios están en pesos colombianos (COP)
- [ ] Se muestran las features de cada plan
- [ ] Instrucciones de pago Nequi visibles
- [ ] Instrucciones de pago Bancolombia visibles
- [ ] Botón de WhatsApp funciona
- [ ] Al hacer clic en WhatsApp, abre la app con mensaje

**Prueba esto:**
1. Ve a la página de suscripciones
2. Haz clic en "Pagar con Nequi"
3. ¿Ves el número de teléfono correcto?
4. Haz clic en el botón de WhatsApp
5. ¿Abre WhatsApp con un mensaje pre-llenado?

---

## 1️⃣1️⃣ **UI/UX Y DISEÑO**

### Diseño General
- [ ] Los colores son vibrantes (no grises/blancos planos)
- [ ] Hay gradientes modernos
- [ ] Los bordes son redondeados
- [ ] Las sombras se ven bien
- [ ] La tipografía es legible

### Responsive
- [ ] La app se ve bien en desktop
- [ ] La app se ve bien en tablet (F12 → Device toolbar)
- [ ] La app se ve bien en móvil (F12 → Device toolbar)

### Navegación
- [ ] Todos los botones funcionan
- [ ] Los links llevan a donde deben
- [ ] No hay páginas rotas (404)
- [ ] El menú lateral funciona

---

## 1️⃣2️⃣ **LEGAL & ADMINISTRATIVO** (NUEVO)

- [ ] Archivo `CODIGO_FUENTE_NOVA_SCHOLA.txt` existe en la carpeta raíz
- [ ] El módulo "Research Center" (Report Buddy) carga correctamente
- [ ] Las políticas de privacidad (si existen enlaces) funcionan

---

## 1️⃣3️⃣ **ERRORES Y CONSOLA**

- [ ] No hay errores rojos en consola (F12)
- [ ] No hay errores 401 (Supabase auth)
- [ ] No hay errores 404 (archivos faltantes)
- [ ] No hay errores de TypeScript
- [ ] No hay warnings críticos

**Cómo verificar:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Navega por la app
4. ¿Aparecen errores rojos?

---

## 📊 **RESUMEN DE TESTING**

### Total de items probados: __ / 70

### Funcionalidades que funcionan: __
### Funcionalidades con problemas: __
### Funcionalidades no probadas: __

---

## 🐛 **PROBLEMAS ENCONTRADOS**

Lista aquí cualquier problema que encuentres:

1. **Problema:** 
   - **Dónde:** 
   - **Qué pasa:** 
   - **Cómo reproducir:** 

2. **Problema:** 
   - **Dónde:** 
   - **Qué pasa:** 
   - **Cómo reproducir:** 

---

## 💡 **SUGERENCIAS DE MEJORA**

Lista aquí cualquier idea para mejorar:

1. 
2. 
3. 

---

## ✅ **CONCLUSIÓN**

**Estado general de la aplicación:**
- [ ] Excelente - Todo funciona perfectamente
- [ ] Bueno - Funciona con algunos problemas menores
- [ ] Regular - Varios problemas importantes
- [ ] Malo - Muchos errores críticos

**¿Está lista para producción?**
- [ ] Sí, lista para lanzar
- [ ] Casi, solo faltan detalles menores
- [ ] No, requiere más trabajo

---

**Última actualización:** 2026-01-04  
**Testeado por:** [Tu nombre]
