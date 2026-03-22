/**
 * Genera dist/ para Cloudflare Pages.
 *
 * Contrato de variables (debe coincidir con index.html):
 *
 *   process.env.SUPABASE_URL      -> JSON supabaseUrl     -> c.supabaseUrl
 *   process.env.SUPABASE_ANON_KEY -> JSON supabaseAnonKey -> c.supabaseAnonKey
 *
 * Origen en build: CI inyecta process.env (Cloudflare Pages, GitHub Actions, etc.)
 * o archivo .env en la raiz del repo (misma carpeta que package.json).
 *
 * Salida: dist/env.js (window.OURBOOK_CONFIG = { ... }) para preview local / fallback.
 * En Cloudflare Pages, functions/env.js/index.js sirve /env.js en runtime con las
 * variables del proyecto (no requiere que el build vea process.env).
 * public/_routes.json limita la Function a /env.js (resto estatico).
 * index.html carga <script src="env.js"></script> antes del boot de Supabase.
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

function readBuildEnv(name) {
  let v = process.env[name];
  if (v == null) return "";
  v = String(v).trim();
  if (v.charCodeAt(0) === 0xfeff) v = v.slice(1).trim();
  return v;
}

const supabaseUrl = readBuildEnv("SUPABASE_URL");
const supabaseAnonKey = readBuildEnv("SUPABASE_ANON_KEY");

const hasUrl = !!supabaseUrl;
const hasKey = !!supabaseAnonKey;
const onCfPages = process.env.CF_PAGES === "1";

if (!hasUrl || !hasKey) {
  console.log(
    "  Variables de build (Cloudflare Pages → tu proyecto → Settings → Environment variables):"
  );
  console.log("    SUPABASE_URL: " + (hasUrl ? "definida" : "VACIA (process.env vacio en este build)"));
  console.log(
    "    SUPABASE_ANON_KEY: " + (hasKey ? "definida" : "VACIA — clave anon JWT (eyJ...), no sb_secret")
  );
  if (onCfPages) {
    console.log(
      "  Cloudflare Pages (CF_PAGES=1). Rama: " +
        (process.env.CF_PAGES_BRANCH || "?") +
        " | Commit: " +
        (process.env.CF_PAGES_COMMIT_SHA || "").slice(0, 7)
    );
    console.log(
      "  Revisa: Pages → este proyecto (el del repo Git) → Settings → Variables / Environment variables."
    );
    console.log(
      "  Nombres exactos: SUPABASE_URL y SUPABASE_ANON_KEY (no otros prefijos)."
    );
    console.log(
      "  Deben existir para el entorno de ESA rama (Production vs Preview). Guarda y Retry deployment."
    );
  } else {
    console.log(
      "  Activalas para Production/Preview en Pages, o usa archivo .env local para npm run build."
    );
  }
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

const emptyHint =
  !supabaseUrl || !supabaseAnonKey
    ? "/* Config vacio: en Cloudflare Pages anade SUPABASE_URL y SUPABASE_ANON_KEY (Environment variables) y redeploy. */\n"
    : "";

const envJs =
  "/* Generado por npm run build - no editar en dist */\n" +
  emptyHint +
  "window.OURBOOK_CONFIG = " +
  JSON.stringify(config, null, 0) +
  ";\n";

fs.writeFileSync(path.join(dist, "env.js"), envJs, { encoding: "utf8" });

console.log("Build OK → dist/");
console.log(
  supabaseUrl && supabaseAnonKey
    ? "  Supabase: URL + anon key inyectadas en dist/env.js"
    : "  Aviso: sin SUPABASE_URL / SUPABASE_ANON_KEY (sitio solo localStorage)"
);
