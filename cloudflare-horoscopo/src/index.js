const MODELO = "@cf/meta/llama-3.1-8b-instruct-fast";
const SIGNOS = [
  "aries", "touro", "gemeos", "cancer", "leao", "virgem",
  "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes"
];
const NOMES = {
  aries: "Áries", touro: "Touro", gemeos: "Gêmeos", cancer: "Câncer",
  leao: "Leão", virgem: "Virgem", libra: "Libra", escorpiao: "Escorpião",
  sagitario: "Sagitário", capricornio: "Capricórnio", aquario: "Aquário", peixes: "Peixes"
};
const TEMAS = [
  "iniciativa com calma", "conversas sinceras", "organização sem rigidez",
  "criatividade prática", "limites saudáveis", "reencontro com prioridades",
  "cooperação e escuta"
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return respostaCors(null, 204);
    if (request.method !== "GET" || !["/", "/api/horoscopo"].includes(url.pathname)) {
      return respostaJson({ erro: "Rota não encontrada" }, 404);
    }

    try {
      const resultado = await obterHoroscopo(env);
      return respostaJson(resultado);
    } catch (erro) {
      console.error("Falha ao entregar horóscopo", erro);
      const anterior = await env.HOROSCOPO_DB.get("horoscopo:ultimo", "json");
      if (anterior) return respostaJson({ ...anterior, desatualizado: true });
      return respostaJson(criarReserva(dataSaoPaulo()), 200);
    }
  },

  async scheduled(_evento, env, ctx) {
    ctx.waitUntil(obterHoroscopo(env));
  }
};

async function obterHoroscopo(env) {
  const data = dataSaoPaulo();
  const chave = `horoscopo:${data}`;
  const existente = await env.HOROSCOPO_DB.get(chave, "json");
  if (existente) return existente;

  const criado = await gerarComIA(env, data);
  validarPrevisao(criado);
  await env.HOROSCOPO_DB.put(chave, JSON.stringify(criado), { expirationTtl: 172800 });
  await env.HOROSCOPO_DB.put("horoscopo:ultimo", JSON.stringify(criado));
  return criado;
}

async function gerarComIA(env, data) {
  const indice = [...data].reduce((total, caractere) => total + caractere.charCodeAt(0), 0) % TEMAS.length;
  const temasDoDia = SIGNOS.map((signo, posicao) => `${NOMES[signo]}: ${TEMAS[(indice + posicao) % TEMAS.length]}`).join("; ");
  const prompt = `Escreva o horóscopo diário do PopZun para ${data}, em português brasileiro.
É entretenimento leve, acolhedor, variado e predominantemente otimista. Não faça previsões factuais e não prometa dinheiro, emprego, cura, gravidez ou relacionamento. Não mencione morte, doença, acidente, traição ou desastre.
Use estes temas apenas como sementes para diferenciar os signos: ${temasDoDia}.
Responda SOMENTE com JSON válido, sem markdown, neste formato:
{"signos":{"aries":{"geral":"20 a 28 palavras","amor":"8 a 14 palavras","trabalho":"8 a 14 palavras","bemEstar":"8 a 14 palavras","conselho":"8 a 14 palavras","cor":"uma cor","numero":"1 a 99","periodo":"manhã, tarde ou noite"}}}
Inclua exatamente estas 12 chaves: ${SIGNOS.join(", ")}. Não repita frases entre os signos.`;

  const resposta = await env.AI.run(MODELO, {
    messages: [
      { role: "system", content: "Você é um redator cuidadoso. Obedeça ao formato JSON solicitado e escreva de modo natural." },
      { role: "user", content: prompt }
    ],
    response_format: criarSchemaDeResposta(),
    max_tokens: 2200,
    temperature: 0.75
  });
  const conteudo = typeof resposta === "string" ? resposta : resposta.response;
  const json = typeof conteudo === "string" ? extrairJson(conteudo) : conteudo;
  return { data, geradoEm: new Date().toISOString(), fonte: "Workers AI", signos: json.signos };
}

function criarSchemaDeResposta() {
  const campos = {
    geral: { type: "string" }, amor: { type: "string" }, trabalho: { type: "string" },
    bemEstar: { type: "string" }, conselho: { type: "string" }, cor: { type: "string" },
    numero: { type: "string" }, periodo: { type: "string" }
  };
  const signo = { type: "object", properties: campos, required: Object.keys(campos) };
  return {
    type: "json_schema",
    json_schema: {
      type: "object",
      properties: { signos: { type: "object", properties: Object.fromEntries(SIGNOS.map(nome => [nome, signo])), required: SIGNOS } },
      required: ["signos"]
    }
  };
}

function extrairJson(texto) {
  if (!texto) throw new Error("A IA não devolveu texto");
  const inicio = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");
  if (inicio < 0 || fim <= inicio) throw new Error("Resposta da IA sem JSON");
  return JSON.parse(texto.slice(inicio, fim + 1));
}

function validarPrevisao(previsao) {
  if (!previsao?.signos) throw new Error("Objeto signos ausente");
  const campos = ["geral", "amor", "trabalho", "bemEstar", "conselho", "cor", "numero", "periodo"];
  for (const signo of SIGNOS) {
    const item = previsao.signos[signo];
    if (!item || campos.some(campo => !String(item[campo] || "").trim())) {
      throw new Error(`Previsão incompleta para ${signo}`);
    }
  }
}

function criarReserva(data) {
  const signos = {};
  SIGNOS.forEach((signo, indice) => {
    signos[signo] = {
      geral: `O dia favorece ${TEMAS[indice % TEMAS.length]}. Observe o seu ritmo e escolha o próximo passo sem transformar pressa em obrigação.`,
      amor: "Gentileza e escuta deixam os vínculos mais leves.",
      trabalho: "Uma prioridade bem escolhida vale mais que várias promessas.",
      bemEstar: "Uma pausa curta pode devolver clareza ao seu dia.",
      conselho: "Confie no progresso feito com constância.",
      cor: ["azul", "verde", "dourado", "lilás"][indice % 4],
      numero: String((indice * 7 + 3) % 99 + 1),
      periodo: ["manhã", "tarde", "noite"][indice % 3]
    };
  });
  return { data, geradoEm: new Date().toISOString(), fonte: "reserva editorial", temporario: true, signos };
}

function dataSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

function respostaJson(conteudo, status = 200) {
  return respostaCors(JSON.stringify(conteudo), status, { "content-type": "application/json; charset=utf-8" });
}

function respostaCors(body, status, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      ...headers,
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "cache-control": "public, max-age=300, s-maxage=3600"
    }
  });
}
