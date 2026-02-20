-- GRANT EXECUTE permission on the functions to authenticated users (Parents need this)
GRANT EXECUTE ON FUNCTION award_coins_secure(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION award_coins_secure(UUID, INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION award_xp_secure(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION award_xp_secure(UUID, INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO service_role;

-- OPTIONAL: If you want to be extra safe, you can add RLS policies, 
-- but 'SECURITY DEFINER' inside the function usually bypasses table RLS.
-- The GRANT EXECUTE is what allows the API call to even reach the function.
