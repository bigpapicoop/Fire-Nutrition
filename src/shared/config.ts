// Connection details for the shared recipe database (Supabase project "Fire Nutrition").
// Both values are meant to be public: they let the app read and add recipes, and the database's own
// security rules (supabase/setup.sql) decide what's allowed. Only admins can delete.
// Leave them empty and the app works as before, with recipes saved only on each device.
export const SUPABASE_URL = 'https://chjnojbgptinjsupmaok.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_cOkNBtb13eVok6xFS4FdDw_a2qeLZ8P'
