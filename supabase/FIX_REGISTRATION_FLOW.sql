-- Función para obtener ID de usuario por email (para vinculación en registro)
-- NOTA: Esto expone si un email existe. Usar con precaución.

create or replace function get_user_id_by_email(email_input text)
returns uuid
security definer -- Se ejecuta con permisos de admin para buscar en auth.users
as $$
declare
  found_id uuid;
begin
  select id into found_id
  from auth.users
  where email = email_input;
  
  return found_id;
end;
$$ language plpgsql;
