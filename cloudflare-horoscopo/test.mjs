import worker from "./src/index.js";

const nomes = ["aries", "touro", "gemeos", "cancer", "leao", "virgem", "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes"];
const item = {
  geral: "Um texto geral completo para o teste automatizado do contrato diário.",
  amor: "Conversa e gentileza aproximam.",
  trabalho: "Organize uma prioridade importante.",
  bemEstar: "Respeite o seu próprio ritmo.",
  conselho: "Avance com calma e constância.",
  cor: "azul",
  numero: "7",
  periodo: "tarde"
};
const memoria = new Map();
let chamadasDaIA = 0;
const env = {
  AI: {
    async run() {
      chamadasDaIA += 1;
      return { response: JSON.stringify({ signos: Object.fromEntries(nomes.map(nome => [nome, item])) }) };
    }
  },
  HOROSCOPO_DB: {
    async get(chave, tipo) {
      const valor = memoria.get(chave);
      return tipo === "json" && valor ? JSON.parse(valor) : valor ?? null;
    },
    async put(chave, valor) {
      memoria.set(chave, valor);
    }
  }
};

const primeira = await worker.fetch(new Request("https://popzun.com.br/api/horoscopo"), env);
const segunda = await worker.fetch(new Request("https://popzun.com.br/api/horoscopo"), env);
const corpo = await segunda.json();

if (!primeira.ok || !segunda.ok) throw new Error("O endpoint não respondeu com sucesso");
if (Object.keys(corpo.signos).length !== 12) throw new Error("A resposta não contém os 12 signos");
if (chamadasDaIA !== 1) throw new Error(`A IA foi chamada ${chamadasDaIA} vezes em vez de uma`);
console.log("OK: 12 signos, contrato válido e apenas uma geração diária.");
