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

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).trim();
const supabaseAnonKey = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

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

const distEnv = path.join(dist, "env.js");
if (supabaseUrl && supabaseAnonKey) {
  const config = { supabaseUrl, supabaseAnonKey };
  fs.writeFileSync(
    distEnv,
    "/* Generado por npm run build */\nwindow.OURBOOK_CONFIG = " +
      JSON.stringify(config, null, 0) +
      ";\n",
    "utf8"
  );
} else {
  const rootEnv = path.join(root, "env.js");
  if (fs.existsSync(rootEnv)) {
    fs.copyFileSync(rootEnv, distEnv);
  } else {
    fs.writeFileSync(distEnv, "window.OURBOOK_CONFIG = {};\n", "utf8");
  }
}

console.log("Build OK → dist/");
console.log(
  supabaseUrl && supabaseAnonKey
    ? "  Supabase: URL + anon en dist/env.js (variables de entorno)"
    : "  Supabase: se copió env.js del proyecto (o vacío). Añade .env o rellena env.js."
);
