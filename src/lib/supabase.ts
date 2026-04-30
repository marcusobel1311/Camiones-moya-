import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mxddkyarxfeauffngdiy.supabase.co';
const supabaseKey = 'sb_publishable_9ZCZsQVA3RyVfEhKiahQdw_ee2K1KSi';

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
