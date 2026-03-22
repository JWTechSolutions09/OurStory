/**
 * Sirve GET /env.js usando SUPABASE_URL y SUPABASE_ANON_KEY del proyecto Pages (runtime).
 * No depende de process.env durante npm run build.
 */
export function onRequestGet(context) {
  const url = String(context.env.SUPABASE_URL || "").trim();
  const key = String(context.env.SUPABASE_ANON_KEY || "").trim();
  const config = { supabaseUrl: url, supabaseAnonKey: key };
  const body =
    "/* Runtime: Pages Function (variables del proyecto en Cloudflare) */\n" +
    "window.OURBOOK_CONFIG = " +
    JSON.stringify(config) +
    ";\n";
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
