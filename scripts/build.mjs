/**
 * Genera dist/ para Cloudflare Pages:
 * - Copia index.html y app.js
 * - Escribe env.js con SUPABASE_URL y SUPABASE_ANON_KEY (desde .env o CI)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

try {
  const dotenv = await import("dotenv");
  dotenv.config({ path: path.join(root, ".env") });
} catch {
  /* dotenv opcional en CI donde las vars ya están en process.env */
}

const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || "").trim();

const hasUrl = !!supabaseUrl;
const hasKey = !!supabaseAnonKey;
if (!hasUrl || !hasKey) {
  console.log(
    "  Variables de build (Cloudflare Pages → tu proyecto → Settings → Environment variables):"
  );
  console.log("    SUPABASE_URL: " + (hasUrl ? "definida" : "VACÍA — el build no puede inyectar env.js"));
  console.log(
    "    SUPABASE_ANON_KEY: " + (hasKey ? "definida" : "VACÍA — usa la clave anon (JWT eyJ...), no sb_secret")
  );
  console.log(
    "  Actívalas para el entorno que usa tu rama (Production y/o Preview), guarda y vuelve a desplegar."
  );
}

fs.mkdirSync(dist, { recursive: true });

for (const f of ["index.html", "app.js"]) {
  fs.copyFileSync(path.join(root, f), path.join(dist, f));
}

const pub = path.join(root, "public");
if (fs.existsSync(pub)) {
  for (const name of fs.readdirSync(pub)) {
    fs.copyFileSync(path.join(pub, name), path.join(dist, name));
  }
}

const config = {};
if (supabaseUrl) config.supabaseUrl = supabaseUrl;
if (supabaseAnonKey) config.supabaseAnonKey = supabaseAnonKey;

const envJs =
  "/* Generado por npm run build — no editar en dist */\n" +
  "window.OURBOOK_CONFIG = " +
  JSON.stringify(config, null, 0) +
  ";\n";

fs.writeFileSync(path.join(dist, "env.js"), envJs, "utf8");

console.log("Build OK → dist/");
console.log(
  supabaseUrl && supabaseAnonKey
    ? "  Supabase: URL + anon key inyectadas en dist/env.js"
    : "  Aviso: sin SUPABASE_URL / SUPABASE_ANON_KEY (sitio solo localStorage)"
);
