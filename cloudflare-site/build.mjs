import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(projectRoot, ".popzun-public");

const publicEntries = [
  "ads.txt",
  "artigos",
  "assets",
  "assuntos",
  "categoria",
  "contato",
  "cookies",
  "discos-78-rpm",
  "discos-lp",
  "em-alta",
  "horoscopo",
  "index.html",
  "perfis",
  "privacidade",
  "recentes",
  "robots.txt",
  "sitemap.xml",
  "sobre",
  "tags",
  "termos",
  "zunzun",
];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const entry of publicEntries) {
  await cp(join(projectRoot, entry), join(outputRoot, entry), { recursive: true });
}

const converterRoot = join(projectRoot, "conversor-de-imagens");
const converterOutput = join(outputRoot, "conversor-de-imagens");
await mkdir(converterOutput, { recursive: true });

for (const entry of ["index.html", "metadata.json", "assets"]) {
  await cp(join(converterRoot, entry), join(converterOutput, entry), { recursive: true });
}

const files = await readdir(outputRoot, { recursive: true });
console.log(`Assets públicos preparados: ${files.length} entradas em ${outputRoot}`);
