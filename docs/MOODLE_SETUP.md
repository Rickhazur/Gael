# Configuración de Moodle en Nova Schola

## Migración de base de datos

Para habilitar la sincronización con Moodle, ejecuta la migración SQL:

```bash
# Ver el SQL a ejecutar (copia y pega en Supabase Dashboard)
npm run moodle:migrate
```

Luego:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto
2. **SQL Editor** → **New query**
3. Pega el SQL que mostró el comando
4. **Run**

O copia manualmente el contenido de `supabase/migrations/20250131_moodle_schema.sql`.

## Cómo funciona

### Opción A: El papá conecta al crear la cuenta
1. El papá va a **Crear cuenta** → modo **Padre**
2. Marca **"¿Tu colegio usa Moodle?"**
3. Ingresa URL, usuario y contraseña de Moodle del niño
4. Al crear la cuenta, Nova conecta Moodle en segundo plano
5. El niño entra y sus tareas ya están listas (no hace nada)

### Opción B: El estudiante conecta después
1. Va al Centro de Mando → **Sincronizar Colegio** → **Moodle**
2. Ingresa **URL** + **Usuario** + **Contraseña** de Moodle (o Token de API si prefiere)
3. Nova verifica la conexión y sincroniza las tareas

## Requisitos en Moodle (configuración del colegio)

El administrador del Moodle del colegio debe:

1. Habilitar **Web Services** en Administración del sitio
2. Crear o habilitar el servicio **`moodle_mobile_app`** (o uno personalizado) con las funciones:
   - `core_webservice_get_site_info`
   - `core_enrol_get_users_courses`
   - `mod_assign_get_assignments`
3. Permitir que los usuarios obtengan token vía **login/token.php** (usuario + contraseña) — habitualmente ya está habilitado para la app móvil oficial

## Notas

- Cada colegio tiene su propio Moodle; no hay un Moodle central como Google Classroom
- El token es específico por usuario
- Las tareas se muestran en el Centro de Mando junto con las de Google Classroom
