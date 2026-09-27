// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://rtrhmkjpzqwsqrbfrbib.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_3iyUhTLJZNtgdjgBWLY1xw_I_QLyExX";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
