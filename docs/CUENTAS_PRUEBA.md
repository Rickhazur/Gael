# Cuentas de prueba – Nova Schola Elementary

Correos y contraseñas para probar la app como **estudiante** y como **padre/acudiente**.  
Ejecuta los scripts SQL en Supabase (SQL Editor) en el orden indicado si aún no tienes las cuentas.

---

## Resumen rápido

| Rol        | Correo                      | Contraseña  | Script SQL                    |
|-----------|-----------------------------|-------------|-------------------------------|
| Estudiante | `piloto.quinto@novaschola.com` | `piloto2024` | `supabase/CREATE_PILOTO_QUINTO_USER.sql` |
| Padre     | `padre.andres@novaschola.com`  | `padre2024`  | `supabase/CREATE_PADRE_ANDRES_USER.sql`  |

---

## 1. Estudiante (Piloto Quinto / Andrés)

- **Correo:** `piloto.quinto@novaschola.com`
- **Contraseña:** `piloto2024`
- **Rol:** Estudiante
- **Grado:** 5° (Arena Ciudadela del Tiempo, misiones g5)
- **Colegio:** No bilingüe (modo estándar)
- **Monedas:** 99.999 (para comprar en la tienda)
- **Script:** `supabase/CREATE_PILOTO_QUINTO_USER.sql`

**Uso:** Inicia sesión como **Estudiante** en la app para probar tutoría de matemáticas (Profe Lina), Centro de Investigación, Arena, misiones y tienda de avatares.

---

## 2. Padre de Andrés (acudiente)

- **Correo:** `padre.andres@novaschola.com`
- **Contraseña:** `padre2024`
- **Rol:** Padre / Acudiente
- **Vinculado a:** Estudiante `piloto.quinto@novaschola.com` (Piloto Quinto)
- **Script:** `supabase/CREATE_PADRE_ANDRES_USER.sql`

**Uso:** Inicia sesión como **Padre** en la app para probar el panel de acudientes: ver progreso del estudiante, misiones, recompensas y notificaciones.

**Modo prueba sin Supabase:** Si no has ejecutado los scripts en Supabase, la app permite entrar igual con este correo y contraseña (bypass). Verás al estudiante "Piloto Quinto" como hijo y podrás dar premios; los datos no se guardan en la nube hasta que configures Supabase y ejecutes los scripts.

**Importante (con Supabase):** Ejecuta primero `CREATE_PILOTO_QUINTO_USER.sql` para que exista el estudiante; luego ejecuta `CREATE_PADRE_ANDRES_USER.sql` para crear al padre y vincularlo al estudiante.

---

## Orden de ejecución en Supabase

1. En el **SQL Editor** de tu proyecto Supabase:
2. Ejecutar **`CREATE_PILOTO_QUINTO_USER.sql`** (crea el estudiante).
3. Ejecutar **`CREATE_PADRE_ANDRES_USER.sql`** (crea el padre y lo vincula al estudiante).
4. (Opcional) Ejecutar **`parent_rewards_schema.sql`** para que los premios por meta que crea el padre se guarden en la nube y sigan visibles tras cerrar sesión.

---

## Seguridad

- Estas cuentas son **solo para pruebas** (desarrollo/demo).
- No uses estos correos ni contraseñas en producción.
- En producción, los usuarios se registran desde la app y las contraseñas se gestionan con Supabase Auth.
