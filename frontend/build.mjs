/**
 * =====================================================================
 *  frontend/build.mjs
 * =====================================================================
 * Script de compilación del frontend (usa esbuild).
 *
 *   node build.mjs           -> compila el frontend en ../public
 *   node build.mjs --watch   -> recompila automáticamente al guardar
 *
 * El resultado queda en ../public (index.html + assets/), que es la
 * carpeta que sirve el servidor Express. Con "npm start" en la raíz
 * del proyecto ya se ve la aplicación en http://localhost:3000
 * =====================================================================
 */
import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const salida = path.join(raiz, "..", "public");
const watch = process.argv.includes("--watch");

const opciones = {
  entryPoints: [path.join(raiz, "src", "main.tsx")],
  bundle: true,
  outdir: path.join(salida, "assets"),
  entryNames: "main",
  format: "iife",
  jsx: "automatic",
  minify: !watch,
  sourcemap: watch,
  target: ["es2019"],
  logLevel: "info",
};

function escribirIndexHtml() {
  mkdirSync(path.join(salida, "assets"), { recursive: true });
  writeFileSync(
    path.join(salida, "index.html"),
    `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fidelización — Sistema de Puntos</title>
    <link rel="stylesheet" href="/assets/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/main.js"></script>
  </body>
</html>
`
  );
}

escribirIndexHtml();

if (watch) {
  const ctx = await esbuild.context(opciones);
  await ctx.watch();
  console.log("Observando cambios en frontend/src …");
} else {
  await esbuild.build(opciones);
  console.log("Frontend compilado en /public");
}
