/**
 * Configuración pública (solo URL + anon key; nunca service_role).
 * Desarrollo: deja vacío y usa solo localStorage, o usa `npm run build` con `.env`.
 * Producción: Cloudflare Pages genera dist/env.js en el build (no edites credenciales aquí si haces commit).
 */
window.OURBOOK_CONFIG = window.OURBOOK_CONFIG || {
  supabaseUrl: "https://ptdhbumkpjviuxenbbmr.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZGhidW1rcGp2aXV4ZW5iYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzEzNDIsImV4cCI6MjA4OTc0NzM0Mn0.MwSFImzxFOuluSEMu2c7nNin0YG1nst86JudvyRY4C0",
};
