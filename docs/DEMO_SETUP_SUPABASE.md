# 🚀 Guía Rápida: Configurar Modo Demo en Supabase

## ⚠️ IMPORTANTE: Sigue estos pasos EN ORDEN

### **Paso 0: Crear las Tablas de la Base de Datos** 🗄️

**PRIMERO DE TODO**, necesitas crear las tablas:

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor** (en el menú lateral)
3. Haz clic en **"New query"**
4. Copia **TODO** el contenido del archivo:
   ```
   c:\Users\devel\OneDrive\Desktop\Nova-Schola-Elementary-main\supabase\CREATE_DEMO_TABLES.sql
   ```
5. Pégalo en el editor SQL
6. Haz clic en **"Run"** (botón verde)
7. **Verifica:** Deberías ver "Success. No rows returned"

**✅ Esto crea las tablas:**
- `student_profiles`
- `student_avatars`
- `quest_completions`
- `unlocked_badges`
- `google_classroom_assignments`
- `learning_progress`

---

### **Paso 1: Crear el Usuario Demo en Supabase Auth** ✅

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Navega a **Authentication** → **Users**
3. Haz clic en **"Add user"** (botón verde arriba a la derecha)
4. Completa el formulario:
   ```
   Email: sofia.demo@novaschola.com
   Password: demo2024
   ```
5. **MUY IMPORTANTE:** Marca la casilla **"Auto Confirm User"**
   - Esto evita que Supabase envíe un email de verificación
   - El usuario estará activo inmediatamente
6. Haz clic en **"Create user"**
7. **Verifica:** Deberías ver a "sofia.demo@novaschola.com" en la lista de usuarios

---

### **Paso 2: Ejecutar el Script SQL** 📝

**SOLO después de crear el usuario**, ejecuta el script SQL:

1. En Supabase, ve a **SQL Editor** (en el menú lateral)
2. Haz clic en **"New query"**
3. Copia **TODO** el contenido del archivo:
   ```
   c:\Users\devel\OneDrive\Desktop\Nova-Schola-Elementary-main\supabase\DEMO_MODE_SETUP.sql
   ```
4. Pégalo en el editor SQL
5. Haz clic en **"Run"** (botón verde abajo a la derecha)
6. **Verifica:** Deberías ver "Success. No rows returned" (esto es normal)

---

### **Paso 3: Verificar que Funcionó** ✅

Ejecuta estas queries una por una para verificar:

#### **3.1 Verificar Perfil del Estudiante:**
```sql
SELECT * FROM student_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');
```
**Deberías ver:** 1 fila con nombre "Sofía Martínez", nivel 3, 1250 XP, 450 monedas

#### **3.2 Verificar Avatar:**
```sql
SELECT * FROM student_avatars 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');
```
**Deberías ver:** 1 fila con avatar_id "girl_superhero"

#### **3.3 Verificar Misiones Completadas:**
```sql
SELECT * FROM quest_completions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');
```
**Deberías ver:** 4 filas (mission-003, mission-006, mission-007, mission-008)

#### **3.4 Verificar Medallas:**
```sql
SELECT * FROM unlocked_badges 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');
```
**Deberías ver:** 3 filas (first-quest, streak-3, streak-7)

#### **3.5 Verificar Tareas de Classroom:**
```sql
SELECT * FROM google_classroom_assignments 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sofia.demo@novaschola.com');
```
**Deberías ver:** 3 filas (Examen de Matemáticas, Quiz de Ciencias, Proyecto de Sociales)

---

### **Paso 4: Probar en la App** 🎬

1. Abre tu app en el navegador (debería estar corriendo en `localhost:5173` o similar)
2. Deberías ver la pantalla de login
3. Busca el botón naranja **"🎬 VER DEMO INTERACTIVA"**
4. Haz clic
5. **Deberías entrar automáticamente** como Sofía Martínez
6. Verifica que veas:
   - ✅ Nivel 5 en la esquina superior derecha
   - ✅ 450 monedas
   - ✅ Avatar de superheroína con corona y capa
   - ✅ Misiones en el Centro de Misiones
   - ✅ Medallas en el Salón de la Fama

---

## 🐛 Solución de Problemas

### **Error: "Failed to run sql query: ERROR: 42601: syntax error"**
**Causa:** Intentaste ejecutar el SQL antes de crear el usuario
**Solución:** Ve al Paso 1 y crea el usuario primero

### **Error: "No rows returned" pero no veo datos en la app**
**Causa:** El usuario existe pero el SQL no se ejecutó correctamente
**Solución:** 
1. Verifica que el usuario existe en Authentication → Users
2. Ejecuta las queries de verificación del Paso 3
3. Si no ves datos, vuelve a ejecutar el script SQL completo

### **El botón "VER DEMO" no aparece**
**Causa:** El código no se compiló correctamente
**Solución:**
1. Verifica que `npm run dev` esté corriendo sin errores
2. Refresca la página (F5)
3. Abre la consola del navegador (F12) y busca errores

### **Entra al demo pero no hay misiones/medallas/etc.**
**Causa:** El SQL se ejecutó parcialmente o hay un problema con las tablas
**Solución:**
1. Ejecuta las queries de verificación del Paso 3
2. Si alguna query no devuelve datos, ejecuta solo esa sección del SQL
3. Verifica que las tablas existan en Database → Tables

---

## 📞 ¿Necesitas Ayuda?

Si sigues teniendo problemas:
1. Toma una captura del error exacto
2. Verifica qué query de verificación (Paso 3) falla
3. Comparte el mensaje de error completo

---

## ✅ Checklist Final

Antes de presentar, verifica:
- [ ] Usuario `sofia.demo@novaschola.com` existe en Supabase Auth
- [ ] Script SQL ejecutado sin errores
- [ ] Query de verificación de perfil devuelve 1 fila
- [ ] Query de verificación de avatar devuelve 1 fila
- [ ] Query de verificación de misiones devuelve 4 filas
- [ ] Query de verificación de medallas devuelve 3 filas
- [ ] Botón "VER DEMO" visible en la app
- [ ] Al hacer clic, entras como Sofía Martínez
- [ ] Ves nivel 5, 450 monedas, avatar personalizado

**Si todos los checks están ✅, estás listo para presentar! 🚀**
