# 🔧 Guía de Configuración de Supabase para Nova Schola

## ⚠️ PROBLEMA ACTUAL

El registro de usuarios está fallando con el error:
```
AuthApiError: Anonymous sign-ins are disabled
```

**Esto NO tiene nada que ver con WhatsApp.** Es un problema de configuración de autenticación en Supabase.

---

## ✅ SOLUCIÓN: Configurar Email Provider en Supabase

### **Paso 1: Acceder a tu Dashboard de Supabase**

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **fwpnhxmktwvmsvrxbuat**

---

### **Paso 2: Habilitar Email Provider**

1. En el menú lateral izquierdo, haz clic en **"Authentication"** (🔐)
2. Luego haz clic en **"Providers"**
3. Busca **"Email"** en la lista de providers
4. Asegúrate de que esté **HABILITADO** (toggle en verde)

**Captura de pantalla de referencia:**
```
┌─────────────────────────────────────┐
│ Email                          ✓ ON │  ← Debe estar en ON
├─────────────────────────────────────┤
│ ☑ Enable email provider             │
│ ☑ Confirm email                     │  ← Opcional (ver nota abajo)
│ ☑ Secure email change               │
└─────────────────────────────────────┘
```

---

### **Paso 3: Configurar Email Confirmations (IMPORTANTE)**

Tienes 2 opciones:

#### **OPCIÓN A: Deshabilitar confirmación de email (Más rápido para desarrollo)**
- **Ventaja:** Los usuarios pueden registrarse y usar la app inmediatamente
- **Desventaja:** Menos seguro (cualquiera puede registrarse con cualquier email)

**Pasos:**
1. En la sección "Email", busca **"Confirm email"**
2. **DESMARCA** la casilla "Confirm email"
3. Haz clic en **"Save"**

#### **OPCIÓN B: Habilitar confirmación de email (Recomendado para producción)**
- **Ventaja:** Más seguro (verifica que el email sea real)
- **Desventaja:** Requiere configurar un servicio de envío de emails

**Pasos:**
1. En la sección "Email", busca **"Confirm email"**
2. **MARCA** la casilla "Confirm email"
3. Configura el email template (ver Paso 4)
4. Haz clic en **"Save"**

**⚠️ RECOMENDACIÓN:** Para desarrollo/testing, usa **OPCIÓN A**. Para producción, usa **OPCIÓN B**.

---

### **Paso 4: Verificar "Allow new users to sign up"**

1. Ve a **Authentication** → **Settings**
2. Busca la sección **"User Signups"**
3. Asegúrate de que **"Allow new users to sign up"** esté **HABILITADO**

```
┌─────────────────────────────────────┐
│ User Signups                        │
├─────────────────────────────────────┤
│ ☑ Allow new users to sign up   ✓   │  ← Debe estar marcado
└─────────────────────────────────────┘
```

---

### **Paso 5: Configurar Email Templates (Solo si usas OPCIÓN B)**

Si habilitaste "Confirm email", necesitas configurar el template:

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **"Confirm signup"**
3. Verifica que el template tenga un link de confirmación válido
4. El template debe contener: `{{ .ConfirmationURL }}`

**Template básico en español:**
```html
<h2>Confirma tu cuenta en Nova Schola</h2>
<p>Hola {{ .Email }},</p>
<p>Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Si no creaste esta cuenta, ignora este email.</p>
```

---

### **Paso 6: Configurar SMTP (Solo si usas OPCIÓN B y quieres emails reales)**

Si quieres enviar emails de confirmación reales:

1. Ve a **Project Settings** → **Auth** → **SMTP Settings**
2. Configura tu servidor SMTP (puedes usar Gmail, SendGrid, etc.)

**Ejemplo con Gmail:**
```
Host: smtp.gmail.com
Port: 587
Username: tu-email@gmail.com
Password: [App Password de Gmail]
Sender email: tu-email@gmail.com
Sender name: Nova Schola
```

**⚠️ NOTA:** Para Gmail, necesitas crear una "App Password" en tu cuenta de Google.

---

## 🧪 PROBAR LA CONFIGURACIÓN

Después de hacer los cambios:

1. Ve a tu aplicación: http://localhost:3000
2. Haz clic en "Iniciar Sesión" → "Crear cuenta"
3. Intenta registrarte con un email REAL (ej: `tuprueba@gmail.com`)
4. Usa una contraseña fuerte (mínimo 6 caracteres)

**Si configuraste OPCIÓN A (sin confirmación):**
- Deberías poder iniciar sesión inmediatamente

**Si configuraste OPCIÓN B (con confirmación):**
- Recibirás un email de confirmación
- Haz clic en el link del email
- Luego podrás iniciar sesión

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Email address is invalid"
**Causa:** Estás usando un email con dominio falso (ej: `@example.com`, `@test.com`)

**Solución:** Usa un email real con dominio válido:
- ✅ `prueba@gmail.com`
- ✅ `test@outlook.com`
- ✅ `demo@hotmail.com`
- ❌ `test@example.com` (NO funciona)
- ❌ `user@test.com` (NO funciona)

---

### Error: "Anonymous sign-ins are disabled"
**Causa:** El Email Provider no está habilitado

**Solución:** Sigue el **Paso 2** de esta guía

---

### Error: "Email not confirmed"
**Causa:** Tienes "Confirm email" habilitado pero el usuario no confirmó su email

**Solución:**
1. Revisa tu bandeja de entrada (y spam)
2. Haz clic en el link de confirmación
3. O deshabilita "Confirm email" (ver Paso 3, OPCIÓN A)

---

## 📊 VERIFICAR EN SUPABASE DASHBOARD

Después de un registro exitoso, verifica:

1. Ve a **Authentication** → **Users**
2. Deberías ver el nuevo usuario en la lista
3. Si tiene "Confirm email" habilitado, verás un ícono de email no confirmado

---

## 🎯 RESUMEN RÁPIDO (TL;DR)

Para que el registro funcione AHORA:

1. ✅ Ve a Supabase Dashboard → Authentication → Providers
2. ✅ Habilita "Email" provider
3. ✅ DESMARCA "Confirm email" (para desarrollo)
4. ✅ Verifica que "Allow new users to sign up" esté habilitado
5. ✅ Guarda los cambios
6. ✅ Prueba registrarte con un email real (ej: `@gmail.com`)

---

## 📞 SOPORTE

Si sigues teniendo problemas:

1. Revisa la consola del navegador (F12) para ver el error exacto
2. Verifica que las variables de entorno en `.env` sean correctas
3. Asegúrate de que el proyecto de Supabase esté activo (no pausado)

---

**Última actualización:** 2026-01-04
**Generado por:** Antigravity Testing Suite
