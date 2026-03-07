// teletextosantander/supabase.js

const SUPABASE_URL = "https://ctzrfpnlxlkbjwgriozb.supabase.co";
const SUPABASE_KEY = "AQUI_PEGA_TU_SUPABASE_CLIENT_API_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// asegura sesión anónima para poder insertar con RLS
async function ensureSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    await supabaseClient.auth.signInAnonymously();
  }
}
