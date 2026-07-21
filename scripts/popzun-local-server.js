const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.POPZUN_PORT || 8787);
const host = "127.0.0.1";

const mime = {
  ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".xml":"application/xml; charset=utf-8", ".svg":"image/svg+xml",
  ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp"
};

function decodeXml(value){
  return String(value || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function tag(block, name){
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return decodeXml(match ? match[1].trim() : "");
}

function guessCategory(title){
  const value = title.toLowerCase();
  if(/\bjogo\b|\bfutebol\b|\bcampeonato\b|\bcopa\b|\bplacar\b|\bsele[cç][aã]o\b|\bclube\b|\bfc\b|brasileir[aã]o|libertadores/.test(value)) return "Futebol";
  if(/ator|atriz|cantor|cantora|famos|influenciador/.test(value)) return "Famosos";
  if(/filme|série|serie|novela|reality|programa/.test(value)) return "TV e Reality";
  if(/receita|bolo|comida|cozinha/.test(value)) return "Culinária";
  return "Em Alta";
}

function googleSearchUrl(query){
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

const editorialSearches = [
  { label:"Famosos e fofoca", category:"Famosos", query:'famosos OR celebridades OR cantor OR atriz OR relacionamento OR separação' },
  { label:"Novelas e realities", category:"TV e Reality", query:'novela OR reality OR BBB OR televisão OR série' },
  { label:"Política popular", category:"Polêmicas", query:'Lula OR Bolsonaro OR Janja OR política Brasil' },
  { label:"Futebol e personagens", category:"Futebol", query:'futebol OR jogador OR seleção brasileira OR bastidores futebol' },
  { label:"Cinema e música", category:"Famosos", query:'cinema OR filme OR trailer OR música OR cantor' },
  { label:"Receitas e facilidades", category:"Culinária", query:'receita fácil OR cozinha OR comida OR sobremesa' },
  { label:"Saúde e descobertas", category:"Curiosidades", query:'saúde OR descoberta médica OR ciência OR astronomia' },
  { label:"Viagem e temporada", category:"Curiosidades", query:'viagem Brasil OR destino turístico OR férias OR turismo' },
  { label:"Estranho e curioso", category:"Curiosidades", query:'notícia estranha OR mistério OR curiosidade OR viralizou' }
];

function stripHtml(value){
  return decodeXml(String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function normalizedTitle(value){
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\s+-\s+[^-]+$/, "").replace(/[^a-z0-9]+/g, " ").trim();
}

async function newsFeed(profile){
  const params = new URLSearchParams({
    q:`${profile.query} when:2d`, hl:"pt-BR", gl:"BR", ceid:"BR:pt-419"
  });
  const response = await fetch(`https://news.google.com/rss/search?${params}`, {
    headers:{ "user-agent":"PopZunStudio/1.0 local editorial tool" }
  });
  if(!response.ok) throw new Error(`${profile.label}: Google Notícias respondeu ${response.status}`);
  const xml = await response.text();
  return parseNewsXml(xml, profile);
}

function parseNewsXml(xml, profile){
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 6).map(match => {
    const block = match[1];
    const rawTitle = tag(block, "title");
    const source = tag(block, "source") || rawTitle.split(" - ").pop();
    const title = rawTitle.replace(/\s+-\s+[^-]+$/, "").trim();
    return {
      title,
      summary: stripHtml(tag(block, "description")),
      link: tag(block, "link"),
      publishedAt: tag(block, "pubDate"),
      sourceName: source,
      source:`Notícias · ${profile.label}`,
      category: profile.category,
      platforms:["noticias"],
      traffic:"",
      verification:"needs-check"
    };
  }).filter(item => item.title);
}

async function discover(){
  const errors = [];
  const trendItems = await trends().catch(error => { errors.push(error.message); return []; });
  const newsResults = await Promise.all(editorialSearches.map(profile => newsFeed(profile)
    .catch(error => { errors.push(error.message); return []; })));
  const all = [
    ...trendItems.map(item => ({ ...item, source:"Google Trends", platforms:["google"], verification:"needs-check" })),
    ...newsResults.flat()
  ];
  const seen = new Set();
  const items = all.filter(item => {
    const key = normalizedTitle(item.title);
    if(!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { items:items.slice(0, 60), errors, profiles:editorialSearches.map(item => item.label) };
}

async function trends(){
  const response = await fetch("https://trends.google.com/trending/rss?geo=BR", {
    headers:{ "user-agent":"PopZunStudio/1.0 local editorial tool" }
  });
  if(!response.ok) throw new Error(`Google Trends respondeu ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 20).map(match => {
    const block = match[1];
    const title = tag(block, "title");
    return {
      title,
      traffic: tag(block, "ht:approx_traffic"),
      // O link do RSS de tendências pode apontar novamente para o XML.
      // Uma busca pelo termo é uma fonte útil e sempre abre como página normal.
      link: googleSearchUrl(title),
      publishedAt: tag(block, "pubDate"),
      category: guessCategory(title)
    };
  }).filter(item => item.title);
}

function json(res, status, data){
  res.writeHead(status, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" });
  res.end(JSON.stringify(data));
}

function serveFile(urlPath, res){
  let pathname = decodeURIComponent(urlPath);
  if(pathname.endsWith("/")) pathname += "index.html";
  const target = path.resolve(root, `.${pathname}`);
  if(target !== root && !target.startsWith(root + path.sep)) return json(res, 403, { error:"Acesso negado" });
  fs.stat(target, (error, stat) => {
    if(error || !stat.isFile()) return json(res, 404, { error:"Arquivo não encontrado" });
    res.writeHead(200, { "content-type":mime[path.extname(target).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(target).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`);
  try{
    if(url.pathname === "/api/health") return json(res, 200, { ok:true, service:"PopZun Robots" });
    if(url.pathname === "/api/trends") return json(res, 200, { source:"Google Trends Brasil", fetchedAt:new Date().toISOString(), items:await trends() });
    if(url.pathname === "/api/discover") return json(res, 200, { source:"Radar Popular PopZun", fetchedAt:new Date().toISOString(), ...await discover() });
    serveFile(url.pathname, res);
  }catch(error){
    json(res, 502, { error:error.message });
  }
});

if(require.main === module){
  server.listen(port, host, () => {
    console.log(`PopZun local: http://${host}:${port}/`);
    console.log("Robôs disponíveis somente neste computador. Pressione Ctrl+C para encerrar.");
  });
}

module.exports = { decodeXml, tag, stripHtml, normalizedTitle, parseNewsXml, guessCategory, googleSearchUrl };
