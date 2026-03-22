/**
 * Configuración pública del sitio (solo URL + anon key; nunca el service_role).
 * - Abriendo index.html desde la carpeta: valores vacíos → solo localStorage.
 * - Producción: npm run build genera dist/env.js desde variables de entorno.
 */
window.OURBOOK_CONFIG = window.OURBOOK_CONFIG || {
  supabaseUrl: "sb_publishable_soZ4PXxTq8Aetw-ZdprlCA_z2MAEJA3",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZGhidW1rcGp2aXV4ZW5iYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzEzNDIsImV4cCI6MjA4OTc0NzM0Mn0.MwSFImzxFOuluSEMu2c7nNin0YG1nst86JudvyRY4C0",
};
