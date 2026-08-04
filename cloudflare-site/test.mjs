import worker from "./src/index.js";

const pagina = `<!doctype html><html><head>
<title>Horóscopo de hoje | PopZun</title>
<meta name="description" content="geral">
<link rel="canonical" href="https://popzun.surreal-marcosrg.workers.dev/horoscopo/">
<meta property="og:title" content="Horóscopo de hoje">
<meta property="og:description" content="geral">
<meta property="og:url" content="https://popzun.surreal-marcosrg.workers.dev/horoscopo/">
<meta property="og:image" content="imagem">
<meta name="twitter:title" content="Horóscopo de hoje">
<meta name="twitter:description" content="geral">
<meta name="twitter:image" content="imagem">
</head></html>`;

globalThis.fetch = async () => Response.json({
  signos: { gemeos: { geral: "Uma conversa abre caminhos.", conselho: "Escute antes de responder." } }
});

const env = { ASSETS: { fetch: async () => new Response(pagina, { headers: { "content-type": "text/html" } }) } };
const resposta = await worker.fetch(new Request("https://popzun.surreal-marcosrg.workers.dev/horoscopo/?signo=gemeos"), env);
const html = await resposta.text();

for (const trecho of [
  "Horóscopo de Gêmeos hoje | PopZun",
  "Uma conversa abre caminhos. Conselho: Escute antes de responder.",
  "?signo=gemeos"
]) {
  if (!html.includes(trecho)) throw new Error(`Metadado ausente: ${trecho}`);
}

console.log("Metadados dinâmicos por signo: OK");
