const HOROSCOPO_API = "https://popzun-horoscopo.surreal-marcosrg.workers.dev/api/horoscopo";
const SITE = "https://popzun.surreal-marcosrg.workers.dev";
const IMAGEM = `${SITE}/assets/img/horoscopo/horoscopo-do-dia-og.jpg`;

const NOMES = {
  aries: "Áries", touro: "Touro", gemeos: "Gêmeos", cancer: "Câncer",
  leao: "Leão", virgem: "Virgem", libra: "Libra", escorpiao: "Escorpião",
  sagitario: "Sagitário", capricornio: "Capricórnio", aquario: "Aquário", peixes: "Peixes"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const signo = url.searchParams.get("signo");
    const paginaDeHoroscopo = ["/horoscopo", "/horoscopo/", "/horoscopo/index.html"].includes(url.pathname);

    if (request.method !== "GET" || !paginaDeHoroscopo || !NOMES[signo]) {
      return env.ASSETS.fetch(request);
    }

    const pagina = await env.ASSETS.fetch(request);
    if (!pagina.ok || !pagina.headers.get("content-type")?.includes("text/html")) return pagina;

    const leitura = await obterLeitura(signo);
    const nome = NOMES[signo];
    const titulo = `Horóscopo de ${nome} hoje | PopZun`;
    const descricao = leitura
      ? `${leitura.geral} Conselho: ${leitura.conselho}`
      : `Veja a previsão de ${nome} para hoje: amor, trabalho, bem-estar e conselho do dia.`;
    const endereco = `${SITE}/horoscopo/?signo=${signo}`;
    let html = await pagina.text();

    html = trocar(html, /<title>.*?<\/title>/i, `<title>${escapar(titulo)}</title>`);
    html = metaNome(html, "description", descricao);
    html = trocar(html, /<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${endereco}">`);
    html = metaPropriedade(html, "og:title", titulo);
    html = metaPropriedade(html, "og:description", descricao);
    html = metaPropriedade(html, "og:url", endereco);
    html = metaPropriedade(html, "og:image", IMAGEM);
    html = metaNome(html, "twitter:title", titulo);
    html = metaNome(html, "twitter:description", descricao);
    html = metaNome(html, "twitter:image", IMAGEM);

    const headers = new Headers(pagina.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=300, s-maxage=1800");
    return new Response(html, { status: pagina.status, headers });
  }
};

async function obterLeitura(signo) {
  try {
    const resposta = await fetch(HOROSCOPO_API, { cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return dados?.signos?.[signo] || null;
  } catch {
    return null;
  }
}

function trocar(html, expressao, valor) {
  return expressao.test(html) ? html.replace(expressao, valor) : html;
}

function metaPropriedade(html, propriedade, conteudo) {
  const expressao = new RegExp(`<meta\\s+property=["']${propriedade}["'][^>]*>`, "i");
  return trocar(html, expressao, `<meta property="${propriedade}" content="${escapar(conteudo)}">`);
}

function metaNome(html, nome, conteudo) {
  const expressao = new RegExp(`<meta\\s+name=["']${nome}["'][^>]*>`, "i");
  return trocar(html, expressao, `<meta name="${nome}" content="${escapar(conteudo)}">`);
}

function escapar(valor) {
  return String(valor).replace(/[&<>"']/g, caractere => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[caractere]);
}
