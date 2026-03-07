const SUPABASE_URL = "https://ctzrfpnlxlkbjwgriozb.supabase.co";
const SUPABASE_KEY = "PEGA_AQUI_TU_SUPABASE_CLIENT_API_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function ensureSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error("Error obteniendo sesión:", error);
    return;
  }

  if (!data.session) {
    const { error: signInError } = await supabaseClient.auth.signInAnonymously();
    if (signInError) {
      console.error("Error en login anónimo:", signInError);
    }
  }
}
