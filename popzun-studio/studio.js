(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const canUseFs = "showDirectoryPicker" in window;
  const storageKey = "popzunStudio.currentArticle.v2";
  const projectStoreName = "popzunStudioProject";
  const categories = {
    "Em Alta": "em-alta",
    "Famosos": "famosos",
    "TV e Reality": "tv-e-reality",
    "Internet": "internet",
    "Futebol": "futebol",
    "Culinária": "culinaria",
    "Curiosidades": "curiosidades",
    "Polêmicas": "polemicas",
    "Nostalgia": "nostalgia",
    "ZunZun": "zunzun"
  };

  const blankArticle = () => ({
    title: "",
    desc: "",
    seoDescription: "",
    ogDescription: "",
    profileName: "",
    profileUrl: "",
    profileText: "",
    category: "",
    date: todayBR(),
    author: "Redacao PopZun",
    slug: "",
    tags: [],
    emoji: "🔥",
    status: "draft",
    trending: true,
    recent: true,
    zunzun: false,
    featured: false,
    thumb: "",
    og: "",
    content: "",
    internalImages: [],
    slugEdited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const state = {
    root: null,
    posts: [],
    config: { siteUrl: "https://popzun.com.br", defaultAuthor: "Redacao PopZun" },
    currentArticle: blankArticle(),
    drafts: []
  };

  const els = {
    projectStatus: $("#projectStatus"),
    postsList: $("#postsList"),
    logBox: $("#logBox"),
    wizardPanel: $("#wizardPanel"),
    existingPanel: $("#existingPanel"),
    draftsPanel: $("#draftsPanel"),
    verifyPanel: $("#verifyPanel"),
    existingList: $("#existingList"),
    draftsList: $("#draftsList"),
    verifyResults: $("#verifyResults"),
    publishChecks: $("#publishChecks"),
    thumbPreview: $("#thumbPreview"),
    thumbInfo: $("#thumbInfo"),
    internalList: $("#internalList")
  };

  function log(message){
    const line = document.createElement("div");
    line.className = "log-line";
    line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    els.logBox.prepend(line);
  }

  function todayBR(){
    return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  }

  function slugify(text){
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  function escapeHtml(value){
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function normalizeSiteUrl(url){
    return (url || "https://popzun.com.br").replace(/\/+$/, "");
  }

  function categoryUrl(category){
    if(category === "ZunZun") return "/zunzun/";
    if(category === "Em Alta") return "/em-alta/";
    return `/categoria/${categories[category] || "curiosidades"}/`;
  }

  function showPanel(panel){
    [els.wizardPanel, els.existingPanel, els.draftsPanel, els.verifyPanel].forEach(el => el.classList.add("hidden"));
    panel.classList.remove("hidden");
    scrollToPanel(panel);
  }

  function showAuxPanel(panel){
    [els.existingPanel, els.draftsPanel].forEach(el => el.classList.add("hidden"));
    panel.classList.remove("hidden");
    scrollToPanel(panel);
  }

  function showStep(step){
    showPanel(els.wizardPanel);
    $$(".step-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.step === String(step)));
    $$("[data-step-btn]").forEach(btn => btn.classList.toggle("active", btn.dataset.stepBtn === String(step)));
    const active = $(`.step-panel[data-step="${step}"]`);
    scrollToPanel(active || els.wizardPanel);
  }

  function scrollToPanel(panel){
    window.setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  async function getDir(parent, name, create=false){
    return parent.getDirectoryHandle(name, { create });
  }

  function openProjectDb(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(projectStoreName, 1);
      req.onupgradeneeded = () => req.result.createObjectStore("handles");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveProjectHandle(handle){
    try{
      const db = await openProjectDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction("handles", "readwrite");
        tx.objectStore("handles").put(handle, "root");
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    }catch(e){
      log("Nao foi possivel salvar a pasta do projeto no navegador.");
    }
  }

  async function loadProjectHandle(){
    try{
      const db = await openProjectDb();
      const handle = await new Promise((resolve, reject) => {
        const tx = db.transaction("handles", "readonly");
        const req = tx.objectStore("handles").get("root");
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      db.close();
      return handle;
    }catch(e){
      return null;
    }
  }

  async function ensureHandlePermission(handle){
    if(!handle) return false;
    const opts = { mode: "readwrite" };
    if((await handle.queryPermission(opts)) === "granted") return true;
    return (await handle.requestPermission(opts)) === "granted";
  }

  async function getFile(parent, name, create=false){
    return parent.getFileHandle(name, { create });
  }

  async function readText(pathParts){
    let dir = state.root;
    for(let i = 0; i < pathParts.length - 1; i++) dir = await getDir(dir, pathParts[i]);
    const fileHandle = await getFile(dir, pathParts[pathParts.length - 1]);
    return await (await fileHandle.getFile()).text();
  }

  async function writeText(pathParts, content){
    let dir = state.root;
    for(let i = 0; i < pathParts.length - 1; i++) dir = await getDir(dir, pathParts[i], true);
    const fileHandle = await getFile(dir, pathParts[pathParts.length - 1], true);
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async function writeBlob(pathParts, blob){
    let dir = state.root;
    for(let i = 0; i < pathParts.length - 1; i++) dir = await getDir(dir, pathParts[i], true);
    const fileHandle = await getFile(dir, pathParts[pathParts.length - 1], true);
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  async function removePath(pathParts){
    let dir = state.root;
    for(let i = 0; i < pathParts.length - 1; i++) dir = await getDir(dir, pathParts[i]);
    await dir.removeEntry(pathParts[pathParts.length - 1]);
  }

  async function removeEntry(pathParts, recursive=false){
    let dir = state.root;
    for(let i = 0; i < pathParts.length - 1; i++) dir = await getDir(dir, pathParts[i]);
    try{
      await dir.removeEntry(pathParts[pathParts.length - 1], { recursive });
      return true;
    }catch(e){
      return false;
    }
  }

  async function exists(pathParts){
    try{
      let dir = state.root;
      for(let i = 0; i < pathParts.length - 1; i++) dir = await getDir(dir, pathParts[i]);
      await getFile(dir, pathParts[pathParts.length - 1]);
      return true;
    }catch(e){
      return false;
    }
  }

  async function listDirs(pathParts){
    let dir = state.root;
    for(const part of pathParts) dir = await getDir(dir, part);
    const names = [];
    for await (const [name, handle] of dir.entries()){
      if(handle.kind === "directory") names.push(name);
    }
    return names;
  }

  function parsePosts(text){
    const match = text.match(/const\s+POSTS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if(!match) throw new Error("Nao foi possivel ler o array POSTS.");
    return JSON.parse(match[1]);
  }

  function stringifyPosts(posts){
    return `const POSTS = ${JSON.stringify(posts, null, 2)};\n`;
  }

  function requireProject(){
    if(!state.root) throw new Error("Selecione a raiz do projeto primeiro.");
  }

  async function hydrateProject(handle, silent=false){
    state.root = handle;
    els.projectStatus.textContent = handle.name;
    await ensureStudioDirs();
    await loadConfig();
    await loadPosts();
    await loadDrafts();
    if(!silent) log("Projeto selecionado com permissao de leitura e escrita.");
  }

  async function ensureStudioDirs(){
    const studio = await getDir(state.root, "popzun-studio", true);
    await getDir(studio, "drafts", true);
  }

  async function loadPosts(){
    const text = await readText(["assets", "js", "posts.js"]);
    state.posts = parsePosts(text);
    renderPosts();
    log(`${state.posts.length} posts carregados de assets/js/posts.js.`);
  }

  async function loadConfig(){
    try{
      const text = await readText(["popzun-studio", "config.json"]);
      state.config = Object.assign(state.config, JSON.parse(text));
    }catch(e){
      log("Configuracao inicial usando valores padrao.");
    }
    $("#siteUrl").value = state.config.siteUrl || "";
    $("#defaultAuthor").value = state.config.defaultAuthor || "";
    if(!state.currentArticle.author) {
      state.currentArticle.author = state.config.defaultAuthor || "Redacao PopZun";
      $("#author").value = state.currentArticle.author;
    }
  }

  async function saveConfig(){
    requireProject();
    syncArticleFromForm();
    state.config.siteUrl = normalizeSiteUrl($("#siteUrl").value);
    state.config.defaultAuthor = $("#defaultAuthor").value.trim() || "Redacao PopZun";
    await writeText(["popzun-studio", "config.json"], JSON.stringify(state.config, null, 2) + "\n");
    log("Configuracao salva em popzun-studio/config.json.");
  }

  function openSite(){
    const url = normalizeSiteUrl($("#siteUrl").value || state.config.siteUrl);
    if(!url) throw new Error("Informe a URL do site/local antes de abrir.");
    window.open(`${url}/`, "_blank", "noopener");
  }

  function saveLocalDraft(){
    syncArticleFromForm(false);
    state.currentArticle.updatedAt = new Date().toISOString();
    localStorage.setItem(storageKey, JSON.stringify(state.currentArticle));
  }

  function loadLocalDraft(){
    try{
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if(saved && saved.slug) state.currentArticle = Object.assign(blankArticle(), saved);
    }catch(e){}
  }

  async function saveDraftFile(){
    requireProject();
    syncArticleFromForm();
    const data = state.currentArticle;
    if(!data.slug) throw new Error("Informe o slug antes de salvar o rascunho.");
    await writeText(["popzun-studio", "drafts", `${data.slug}.json`], JSON.stringify(data, null, 2) + "\n");
    await loadDrafts();
  }

  async function loadDrafts(){
    state.drafts = [];
    try{
      const studio = await getDir(state.root, "popzun-studio", true);
      const draftsDir = await getDir(studio, "drafts", true);
      for await (const [name, handle] of draftsDir.entries()){
        if(handle.kind !== "file" || !name.endsWith(".json")) continue;
        try{
          const data = JSON.parse(await (await handle.getFile()).text());
          state.drafts.push(Object.assign(blankArticle(), data, { fileName: name }));
        }catch(e){
          state.drafts.push({ fileName: name, title: "Rascunho invalido", slug: name.replace(/\.json$/, "") });
        }
      }
    }catch(e){}
    state.drafts.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    renderDrafts();
  }

  function renderPosts(){
    els.postsList.innerHTML = "";
    if(!state.posts.length){
      els.postsList.className = "list empty";
      els.postsList.textContent = "Nenhum post encontrado.";
      return;
    }
    els.postsList.className = "list";
    state.posts.slice(0, 8).forEach(post => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `<strong>${escapeHtml(post.title)}</strong><span>${escapeHtml(post.category)} - ${escapeHtml(post.date)} - ${escapeHtml(post.slug)}</span>`;
      els.postsList.appendChild(item);
    });
  }

  function renderDrafts(){
    els.draftsList.innerHTML = "";
    if(!state.drafts.length){
      els.draftsList.className = "list empty";
      els.draftsList.textContent = "Nenhum rascunho salvo ainda.";
      return;
    }
    els.draftsList.className = "list";
    state.drafts.forEach(draft => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <strong>${escapeHtml(draft.title || "Sem titulo")}</strong>
        <span>${escapeHtml(draft.slug)} - ${escapeHtml(draft.category || "Sem categoria")} - ${escapeHtml(draft.updatedAt || draft.createdAt || "")}</span>
        <div class="actions">
          <button type="button" data-continue-draft="${escapeHtml(draft.slug)}">Continuar edicao</button>
          <button type="button" data-publish-draft="${escapeHtml(draft.slug)}">Publicar</button>
          <button type="button" data-delete-draft="${escapeHtml(draft.slug)}">Excluir rascunho</button>
        </div>`;
      els.draftsList.appendChild(item);
    });
  }

  function syncArticleFromForm(updateLocal=true){
    const previous = state.currentArticle || blankArticle();
    const slug = slugify($("#slug").value);
    state.currentArticle = Object.assign(previous, {
      title: $("#title").value.trim(),
      desc: $("#desc").value.trim(),
      profileName: $("#profileName").value.trim(),
      profileUrl: $("#profileUrl").value.trim(),
      profileText: $("#profileText").value.trim(),
      category: $("#category").value,
      date: $("#date").value.trim(),
      author: $("#author").value.trim() || state.config.defaultAuthor || "Redacao PopZun",
      slug,
      tags: $("#tags").value.split(",").map(tag => tag.trim()).filter(Boolean),
      emoji: $("#emoji").value.trim() || "🔥",
      status: $("#status").value,
      trending: $("#trending").checked,
      recent: $("#recent").checked,
      zunzun: $("#zunzun").checked,
      featured: $("#featured").checked,
      content: $("#articleContent").value,
      updatedAt: new Date().toISOString()
    });
    if(updateLocal) localStorage.setItem(storageKey, JSON.stringify(state.currentArticle));
    return state.currentArticle;
  }

  function fillForm(article){
    const data = Object.assign(blankArticle(), article || {});
    $("#title").value = data.title || "";
    $("#desc").value = data.desc || "";
    $("#category").value = data.category || "";
    $("#profileName").value = data.profileName || "";
    $("#profileUrl").value = data.profileUrl || "";
    $("#profileText").value = data.profileText || "";
    $("#date").value = data.date || todayBR();
    $("#author").value = data.author || state.config.defaultAuthor || "Redacao PopZun";
    $("#slug").value = data.slug || "";
    $("#tags").value = (data.tags || []).join(", ");
    $("#emoji").value = data.emoji || "🔥";
    $("#status").value = data.status || "draft";
    $("#trending").checked = !!data.trending;
    $("#recent").checked = data.recent !== false;
    $("#zunzun").checked = !!data.zunzun || data.category === "ZunZun";
    $("#featured").checked = !!data.featured;
    $("#articleContent").value = data.content || "";
    state.currentArticle = data;
    renderInternalImages();
    updateSlugWarning();
  }

  async function updateSlugWarning(){
    if(!state.root) return;
    const data = syncArticleFromForm();
    const inPosts = state.posts.some(post => post.slug === data.slug);
    const inFiles = data.slug ? await exists(["artigos", data.slug, "index.html"]) : false;
    const box = $("#slugWarning");
    if(!data.slug){
      box.className = "notice error";
      box.textContent = "Slug vazio nao e permitido.";
    }else if(inPosts || inFiles){
      box.className = "notice warn";
      box.textContent = "Atencao: este slug ja existe. Se publicar, o item do posts.js sera atualizado sem duplicar.";
    }else{
      box.className = "notice";
      box.textContent = "Slug disponivel para novo artigo.";
    }
  }

  async function selectProject(){
    if(!canUseFs){
      alert("Este navegador nao oferece a File System Access API. Use Chrome ou Edge.");
      return;
    }
    state.root = await window.showDirectoryPicker({ mode: "readwrite" });
    await saveProjectHandle(state.root);
    await hydrateProject(state.root);
  }

  function newArticle(){
    state.currentArticle = blankArticle();
    state.currentArticle.author = state.config.defaultAuthor || "Redacao PopZun";
    localStorage.setItem(storageKey, JSON.stringify(state.currentArticle));
    fillForm(state.currentArticle);
    showStep(1);
    log("Novo artigo iniciado.");
  }

  async function createStructure(){
    requireProject();
    const data = syncArticleFromForm();
    if(!data.title || !data.desc || !data.category || !data.date || !data.slug) throw new Error("Preencha titulo, resumo, categoria, data e slug.");
    await getDir(await getDir(state.root, "artigos", true), data.slug, true);
    await getDir(await getDir(await getDir(await getDir(state.root, "assets", true), "img", true), "posts", true), data.slug, true);
    if(await exists(["artigos", data.slug, "index.html"])){
      log("Estrutura ja existe. Continuando edicao.");
    }else{
      await writeText(["artigos", data.slug, "index.html"], buildDraftHtml(data));
      log(`Estrutura criada para ${data.slug}.`);
    }
    data.thumb = data.thumb || `/assets/img/posts/${data.slug}/thumb.jpg`;
    data.og = data.og || `/assets/img/posts/${data.slug}/og.jpg`;
    await saveDraftFile();
    showStep(2);
  }

  function buildDraftHtml(data){
    return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rascunho - ${escapeHtml(data.title)}</title>
  <meta name="description" content="${escapeHtml(data.desc)}">
  <meta name="robots" content="noindex">
</head>
<body data-slug="${escapeHtml(data.slug)}">
  <h1>${escapeHtml(data.title)}</h1>
  <p>Rascunho criado pelo PopZun Studio. Publique na etapa final para gerar o artigo completo.</p>
</body>
</html>
`;
  }

  function canvasBlob(canvas, quality=.9){
    return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
  }

  async function cropImage(file, width, height){
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    const sw = width / scale;
    const sh = height / scale;
    const sx = (bitmap.width - sw) / 2;
    const sy = (bitmap.height - sh) / 2;
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
    return canvasBlob(canvas);
  }

  async function generateThumb(){
    requireProject();
    const data = syncArticleFromForm();
    if(!data.slug) throw new Error("Informe o slug antes de gerar imagens.");
    const file = $("#thumbInput").files[0];
    if(!file) throw new Error("Escolha uma imagem principal.");
    const thumb = await cropImage(file, 1200, 675);
    const og = await cropImage(file, 1200, 630);
    await writeBlob(["assets", "img", "posts", data.slug, "thumb.jpg"], thumb);
    await writeBlob(["assets", "img", "posts", data.slug, "og.jpg"], og);
    data.thumb = `/assets/img/posts/${data.slug}/thumb.jpg`;
    data.og = `/assets/img/posts/${data.slug}/og.jpg`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    await saveDraftFile();
    await registerCard();
    els.thumbPreview.src = URL.createObjectURL(thumb);
    els.thumbPreview.style.display = "block";
    els.thumbInfo.textContent = data.thumb;
    showStep(2);
    log("Thumb gerada e card registrado/atualizado no posts.js.");
  }

  async function registerCard(){
    requireProject();
    const data = syncArticleFromForm();
    if(!data.title || !data.desc || !data.category || !data.date || !data.slug){
      throw new Error("Preencha titulo, resumo, categoria, data e slug antes de registrar o card.");
    }
    if(!(await exists(["assets", "img", "posts", data.slug, "thumb.jpg"]))){
      throw new Error("Gere a thumb antes de registrar o card no posts.js.");
    }
    const result = await upsertPost(data);
    await loadPosts();
    if(!state.posts.some(post => post.slug === data.slug)){
      throw new Error("Tentei registrar, mas o slug nao apareceu no posts.js.");
    }
    log(result.updated ? "Card existente atualizado no posts.js." : "Card registrado no posts.js.");
    return result;
  }

  async function saveInternalImages(){
    requireProject();
    const data = syncArticleFromForm();
    const files = Array.from($("#internalImages").files);
    if(!data.slug) throw new Error("Informe o slug antes de salvar imagens.");
    if(!files.length) throw new Error("Escolha uma ou mais imagens internas.");
    for(const file of files){
      const index = data.internalImages.length + 1;
      const name = `imagem-${String(index).padStart(2, "0")}.jpg`;
      const blob = await cropImage(file, 1200, 675);
      await writeBlob(["assets", "img", "posts", data.slug, name], blob);
      data.internalImages.push({ name, alt: "", caption: "", path: `/assets/img/posts/${data.slug}/${name}`, preview: URL.createObjectURL(blob) });
    }
    await saveDraftFile();
    renderInternalImages();
    log(`${files.length} imagem(ns) interna(s) salvas.`);
  }

  function renderInternalImages(){
    els.internalList.innerHTML = "";
    (state.currentArticle.internalImages || []).forEach((img, index) => {
      const row = document.createElement("div");
      row.className = "image-row";
      row.innerHTML = `
        <img src="${img.preview || img.path}" alt="">
        <div>
          <label>ALT <input data-img-alt="${index}" value="${escapeHtml(img.alt)}"></label>
          <label>Legenda <input data-img-caption="${index}" value="${escapeHtml(img.caption)}"></label>
          <textarea readonly>${figureHtml(img)}</textarea>
          <button type="button" data-copy-figure="${index}">Copiar figure</button>
        </div>`;
      els.internalList.appendChild(row);
    });
  }

  function figureHtml(img){
    const caption = img.caption ? `\n  <figcaption>${escapeHtml(img.caption)}</figcaption>` : "";
    return `<figure>\n  <img src="${img.path}" alt="${escapeHtml(img.alt)}">${caption}\n</figure>`;
  }

  function insertSnippet(type){
    const data = syncArticleFromForm();
    const snippets = {
      p: "<p>Texto do paragrafo.</p>",
      h2: "<h2>Subtitulo da secao</h2>",
      h3: "<h3>Subtitulo menor</h3>",
      image: `<figure>\n  <img src="/assets/img/posts/${data.slug || "slug"}/imagem-01.jpg" alt="Descricao da imagem">\n  <figcaption>Legenda opcional</figcaption>\n</figure>`,
      ad: '<div class="ad-box in-article-ad">\n  <span>ANUNCIO</span>\n  <strong>Espaco reservado</strong>\n</div>',
      readalso: '<div class="readalso"><strong>Leia tambem no PopZun</strong><a href="/artigos/slug/">Titulo relacionado</a></div>',
      list: "<ul>\n  <li>Item da lista</li>\n  <li>Outro item</li>\n</ul>",
      quote: "<blockquote>Trecho em destaque ou citacao curta.</blockquote>"
    };
    const textarea = $("#articleContent");
    const insert = snippets[type] || "";
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.slice(0, start) + insert + textarea.value.slice(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + insert.length;
    saveLocalDraft();
  }

  function articleInnerHtml(){
    let html = $("#articleContent").value.trim();
    if(!html) return "";
    const match = html.match(/<article\b[^>]*class=["'][^"']*article-content[^"']*["'][^>]*>([\s\S]*)<\/article>/i);
    if(match) return match[1].trim();
    return html;
  }


  function profileCardHtml(data){
    if(!data.profileName || !data.profileUrl) return "";
    const text = data.profileText || `Conheca mais detalhes sobre ${data.profileName}.`;
    return `<div class="profile-card">\n  <strong>Saiba mais</strong>\n  <h3>Quem foi ${escapeHtml(data.profileName)}?</h3>\n  <p>${escapeHtml(text)}</p>\n  <a href="${escapeHtml(data.profileUrl)}">Ver perfil completo</a>\n</div>`;
  }

  function insertProfileCard(content, data){
    const card = profileCardHtml(data);
    if(!card || !content || /class=["'][^"']*profile-card/i.test(content)) return content;
    const adMatch = content.match(/<div\s+class=["'][^"']*(?:article-ad|ad-box|ad\s+ad-in-article)[^"']*["'][\s\S]*?<\/div>/i);
    if(adMatch && typeof adMatch.index === "number"){
      return content.slice(0, adMatch.index) + card + "\n" + content.slice(adMatch.index);
    }
    const paragraphs = Array.from(content.matchAll(/<p[\s\S]*?<\/p>/gi));
    if(paragraphs.length >= 2){
      const second = paragraphs[1];
      const pos = second.index + second[0].length;
      return content.slice(0, pos) + "\n" + card + content.slice(pos);
    }
    return card + "\n" + content;
  }
  async function loadTemplate(){
    try{
      return await readText(["_modelos", "artigo-modelo-popzun-studio.html"]);
    }catch(e){
      return null;
    }
  }

  function buildTagsHtml(tags){
    return (tags || []).map(tag => `<a href="/tags/">#${escapeHtml(tag)}</a>`).join("");
  }

  function buildTrendingLinks(){
    return state.posts.slice(0, 5).map(post => `<a href="/artigos/${post.slug}/">${escapeHtml(post.title)}</a>`).join("");
  }

  async function buildArticleHtml(data){
    const template = await loadTemplate();
    if(!template) throw new Error("Modelo _modelos/artigo-modelo-popzun-studio.html nao encontrado.");
    const siteUrl = "https://popzun.com.br";
    const canonical = `${siteUrl}/artigos/${data.slug}/`;
    const thumb = `/assets/img/posts/${data.slug}/thumb.jpg`;
    const og = `${siteUrl}/assets/img/posts/${data.slug}/og.jpg`;
    const metaDescription = data.seoDescription || data.desc || "";
    const ogDescription = data.ogDescription || data.desc || metaDescription;
    const content = insertProfileCard(articleInnerHtml(), data);
    const articleContent = `<article class="article-content">\n${content}\n</article>`;
    const replacements = {
      "{{SLUG}}": data.slug,
      "{{TITLE}}": escapeHtml(data.title),
      "{{SEO_TITLE}}": escapeHtml(`${data.title} | PopZun`),
      "{{DESCRIPTION}}": escapeHtml(metaDescription),
      "{{OG_TITLE}}": escapeHtml(data.title),
      "{{OG_DESCRIPTION}}": escapeHtml(ogDescription),
      "{{OG_IMAGE}}": og,
      "{{OG_IMAGE_ALT}}": escapeHtml(`Imagem de compartilhamento do artigo ${data.title}`),
      "{{TWITTER_TITLE}}": escapeHtml(data.title),
      "{{TWITTER_DESCRIPTION}}": escapeHtml(ogDescription),
      "{{CANONICAL_URL}}": canonical,
      "{{CATEGORY}}": escapeHtml(data.category),
      "{{CATEGORY_URL}}": categoryUrl(data.category),
      "{{DATE}}": escapeHtml(data.date),
      "{{AUTHOR}}": escapeHtml(data.author),
      "{{EMOJI}}": escapeHtml(data.emoji),
      "{{THUMB}}": thumb,
      "{{ARTICLE_CONTENT}}": articleContent,
      "{{TAGS_HTML}}": buildTagsHtml(data.tags),
      "{{RELATED_POSTS}}": "",
      "{{TRENDING_LINKS}}": buildTrendingLinks()
    };
    return Object.entries(replacements).reduce((html, [key, value]) => html.split(key).join(value), template);
  }

  function looksLikeSlug(text){
    return /^[a-z0-9]+(?:-[a-z0-9]+){2,}$/.test(String(text || "").trim());
  }

  function countMatches(text, regex){
    return (String(text || "").match(regex) || []).length;
  }

  async function validatePublish(data, options={}){
    const checks = [];
    const add = (level, text) => checks.push({ level, text });
    const content = $("#articleContent").value.trim();
    const inner = articleInnerHtml();
    const siteUrl = normalizeSiteUrl($("#siteUrl").value || state.config.siteUrl);

    if(data.title){
      add("ok", "Título preenchido.");
      if(data.title.length < 35) add("warn", "Título parece curto. Talvez fique fraco para clique e SEO.");
      if(data.title.length > 95) add("warn", "Título parece longo. Pode cortar no Google ou no compartilhamento.");
    }else add("error", "Título obrigatório.");

    if(data.slug){
      add("ok", "Slug preenchido.");
      if(data.slug !== slugify(data.slug)) add("warn", "Slug será normalizado automaticamente.");
      const sameSlug = state.posts.find(post => post.slug === data.slug);
      add(sameSlug ? "warn" : "ok", sameSlug ? "Este slug já existe. Publicar vai atualizar o post existente." : "Slug novo no posts.js.");
    }else add("error", "Slug obrigatório.");

    if(data.category){
      add(categories[data.category] ? "ok" : "warn", categories[data.category] ? "Categoria reconhecida pelo site." : `Categoria desconhecida: ${data.category}.`);
      if(data.category !== "ZunZun" && data.category !== "Em Alta"){
        const catSlug = categories[data.category] || "";
        if(catSlug && !(await exists(["categoria", catSlug, "index.html"]))) add("warn", `Página da categoria não encontrada: /categoria/${catSlug}/`);
      }
    }else add("error", "Categoria obrigatória.");

    if(data.desc){
      add("ok", "Resumo preenchido para SEO e redes sociais.");
      if(looksLikeSlug(data.desc)) add("error", "Resumo parece um slug. Use uma frase normal para SEO/Open Graph.");
      if(data.desc.length < 70) add("warn", "Resumo parece curto. Uma frase mais explicativa ajuda no Google e no Facebook.");
      if(data.desc.length > 170) add("warn", "Resumo parece longo. Pode cortar nas buscas.");
    }else add("error", "Resumo obrigatório para meta description e Open Graph.");

    if(data.date) add("ok", "Data preenchida."); else add("error", "Data obrigatória.");
    if(data.author) add("ok", "Autor preenchido."); else add("warn", "Autor vazio. O padrão do Studio será usado se existir.");

    if(data.slug){
      if(await exists(["assets", "img", "posts", data.slug, "thumb.jpg"])) add("ok", "Thumb encontrada: 1200x675."); else add("error", "Thumb não encontrada. Gere a thumb antes de publicar.");
      if(await exists(["assets", "img", "posts", data.slug, "og.jpg"])) add("ok", "Imagem OG encontrada: 1200x630."); else add("error", "Imagem OG não encontrada. Gere a thumb/imagem social antes de publicar.");
    }

    if(content && inner) {
      add("ok", "Conteúdo HTML presente.");
      if(countMatches(inner, /<p[\s>]/gi) < 2) add("warn", "Conteúdo tem poucos parágrafos. Confira se o artigo não ficou curto demais.");
      const imgs = Array.from(inner.matchAll(/<img\b[^>]*>/gi));
      const missingAlt = imgs.filter(match => !/\salt=["'][^"']+["']/i.test(match[0]));
      if(missingAlt.length) add("warn", `${missingAlt.length} imagem(ns) interna(s) sem alt.`);
      const profileCards = countMatches(inner, /class=["'][^"']*profile-card/gi);
      if(profileCards > 1) add("warn", "Há mais de um card Saiba Mais no conteúdo. Confira para não duplicar.");
      else if(profileCards === 1) add("ok", "Card Saiba Mais já existe no conteúdo e não será duplicado.");
    }else add("error", "Conteúdo vazio.");

    const profileTouched = data.profileName || data.profileUrl || data.profileText;
    if(profileTouched && (!data.profileName || !data.profileUrl)) add("error", "Perfil relacionado incompleto. Preencha nome e URL, ou deixe tudo vazio.");
    else if(data.profileName && data.profileUrl) add("ok", "Perfil relacionado pronto para inserir card Saiba Mais.");

    if(!data.tags || !data.tags.length) add("warn", "Nenhuma tag preenchida. Tags ajudam busca interna e organização.");
    if(/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(siteUrl)) add("warn", "URL do site está local. Ótimo para teste; antes de subir, troque para o domínio final.");

    const hasErrors = checks.some(check => check.level === "error");
    if(options.showSummary !== false){
      checks.unshift({ level: hasErrors ? "error" : "ok", text: hasErrors ? "Ainda faltam ajustes antes de publicar." : "Pronto para publicar. Só revise o texto com olho humano antes do clique final." });
    }
    renderChecks(els.publishChecks, checks);
    return !hasErrors;
  }

  async function prepublishCheck(){
    requireProject();
    const data = syncArticleFromForm();
    const ok = await validatePublish(data);
    showStep(5);
    log(ok ? "Pré-publicação aprovada." : "Pré-publicação encontrou pendências.");
  }
  function renderChecks(container, checks){
    container.innerHTML = "";
    checks.forEach(check => {
      const div = document.createElement("div");
      div.className = `check ${check.level}`;
      const button = check.action ? `<button type="button" data-register-slug="${escapeHtml(check.slug)}">Registrar este artigo no posts.js</button>` : "";
      div.innerHTML = `<strong>${check.level.toUpperCase()}</strong><span>${escapeHtml(check.text)}</span>${button}`;
      container.appendChild(div);
    });
  }

  async function publish(){
    requireProject();
    const data = syncArticleFromForm();
    if(!(await validatePublish(data))) throw new Error("Corrija as validacoes antes de publicar.");
    const html = await buildArticleHtml(data);
    await writeText(["artigos", data.slug, "index.html"], html);
    const result = await upsertPost(data);
    await updateSitemap(data.slug);
    data.status = "published";
    data.publishedAt = new Date().toISOString();
    localStorage.setItem(storageKey, JSON.stringify(data));
    await saveDraftFile();
    await loadPosts();
    if(!state.posts.some(post => post.slug === data.slug)){
      throw new Error("O artigo foi gerado, mas nao apareceu no posts.js. Tente publicar novamente ou use Registrar no verificador.");
    }
    showStep(5);
    log(result.updated ? "Post existente atualizado no posts.js." : "Artigo publicado e registrado no posts.js.");
  }

  async function upsertPost(data){
    const post = {
      slug: data.slug,
      title: data.title,
      desc: data.desc,
      category: data.category,
      date: data.date,
      emoji: data.emoji || "🔥",
      trending: !!data.trending || !!data.zunzun,
      recent: !!data.recent,
      tags: data.tags || [],
      image: `/assets/img/posts/${data.slug}/thumb.jpg`,
      reactions: ["-", "-", "-", "-"]
    };
    const index = state.posts.findIndex(item => item.slug === data.slug);
    if(index >= 0){
      state.posts.splice(index, 1, Object.assign({}, state.posts[index], post));
    }else{
      state.posts.unshift(post);
    }
    await writeText(["assets", "js", "posts.js"], stringifyPosts(state.posts));
    return { updated: index >= 0, post };
  }

  async function updateSitemap(slug){
    const siteUrl = "https://popzun.com.br";
    const url = `${siteUrl}/artigos/${slug}/`;
    let xml = "";
    try{ xml = await readText(["sitemap.xml"]); }
    catch(e){ xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n'; }
    const articleUrlRegex = new RegExp(`<url><loc>https?://[^<]+/artigos/${slug}/</loc></url>`);
    if(articleUrlRegex.test(xml)){
      xml = xml.replace(articleUrlRegex, `<url><loc>${url}</loc></url>`);
    }else if(!xml.includes(url)){
      xml = xml.replace("</urlset>", `  <url><loc>${url}</loc></url>\n</urlset>`);
    }
    await writeText(["sitemap.xml"], xml);
    log("Sitemap atualizado.");
  }

  async function removeFromSitemap(slug){
    let xml = "";
    try{ xml = await readText(["sitemap.xml"]); }catch(e){ return; }
    const articleUrlRegex = new RegExp(`\\s*<url><loc>https?://[^<]+/artigos/${slug}/</loc></url>\\s*`, "g");
    xml = xml.replace(articleUrlRegex, "\n");
    await writeText(["sitemap.xml"], xml);
  }

  async function openExistingPanel(){
    requireProject();
    showPanel(els.existingPanel);
    els.existingList.innerHTML = "";
    state.posts.forEach(post => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <strong>${escapeHtml(post.title)}</strong>
        <span>${escapeHtml(post.slug)}</span>
        <div class="actions">
          <button type="button" data-open-slug="${post.slug}">Abrir</button>
          <button type="button" class="ghost-danger" data-delete-post="${post.slug}">Excluir post</button>
        </div>`;
      els.existingList.appendChild(item);
    });
  }

  async function openPost(slug){
    const post = state.posts.find(item => item.slug === slug);
    if(!post) return;
    const article = Object.assign(blankArticle(), post, { author: state.config.defaultAuthor || "Redacao PopZun", slugEdited: true });
    try{
      const html = await readText(["artigos", slug, "index.html"]);
      const wrapped = html.match(/<article class="article-content">([\s\S]*?)<\/article>/i);
      const legacy = html.match(/<div class="hero">[\s\S]*?<\/div>\s*([\s\S]*?)\s*<div class="quick-tags">/i);
      article.content = wrapped ? wrapped[1].trim() : (legacy ? legacy[1].trim() : "");
      log("HTML do artigo carregado para edicao simples.");
    }catch(e){
      log("Nao foi possivel carregar o HTML do artigo.");
    }
    state.currentArticle = article;
    fillForm(article);
    saveLocalDraft();
    showStep(1);
  }

  async function showDrafts(){
    requireProject();
    await loadDrafts();
    showPanel(els.draftsPanel);
  }

  async function continueDraft(slug){
    const draft = state.drafts.find(item => item.slug === slug) || await readDraft(slug);
    if(!draft) throw new Error("Rascunho nao encontrado.");
    state.currentArticle = Object.assign(blankArticle(), draft, { slugEdited: true });
    fillForm(state.currentArticle);
    saveLocalDraft();
    showStep(1);
    log(`Rascunho carregado: ${slug}.`);
  }

  async function readDraft(slug){
    try{
      return JSON.parse(await readText(["popzun-studio", "drafts", `${slug}.json`]));
    }catch(e){
      return null;
    }
  }

  async function deleteDraft(slug){
    await removePath(["popzun-studio", "drafts", `${slug}.json`]);
    await loadDrafts();
    log(`Rascunho excluido: ${slug}.`);
  }

  async function deletePost(slug){
    requireProject();
    if(!slug) throw new Error("Abra ou preencha um artigo antes de excluir.");
    const post = state.posts.find(item => item.slug === slug);
    const label = post ? post.title : slug;
    if(!confirm(`Excluir "${label}" do posts.js e do sitemap?`)) return;
    const deleteFiles = confirm("Tambem apagar a pasta do artigo e a pasta de imagens?\\nOK apaga arquivos. Cancelar remove apenas o registro.");
    const before = state.posts.length;
    state.posts = state.posts.filter(item => item.slug !== slug);
    if(state.posts.length !== before){
      await writeText(["assets", "js", "posts.js"], stringifyPosts(state.posts));
    }
    await removeFromSitemap(slug);
    if(deleteFiles){
      await removeEntry(["artigos", slug], true);
      await removeEntry(["assets", "img", "posts", slug], true);
      if(post && post.image){
        await removeEntry(String(post.image).replace(/^\//, "").split("/"), false);
      }
    }
    await removeEntry(["popzun-studio", "drafts", `${slug}.json`], false);
    if(state.currentArticle.slug === slug){
      state.currentArticle = blankArticle();
      localStorage.removeItem(storageKey);
      fillForm(state.currentArticle);
    }
    await loadPosts();
    await loadDrafts();
    log(`Post excluido: ${slug}.`);
    await openExistingPanel();
  }

  async function registerArticle(slug){
    requireProject();
    let data = await readDraft(slug);
    if(!data){
      data = await extractArticleMetadata(slug);
    }
    data = Object.assign(blankArticle(), data || {}, { slug, slugEdited: true });
    if(!data.title || !data.desc || !data.category){
      throw new Error(`Campos faltando para registrar ${slug}: titulo, resumo ou categoria.`);
    }
    if(!data.date) data.date = todayBR();
    if(!data.author) data.author = state.config.defaultAuthor || "Redacao PopZun";
    if(!data.thumb) data.thumb = `/assets/img/posts/${slug}/thumb.jpg`;
    state.currentArticle = data;
    fillForm(data);
    await upsertPost(data);
    await updateSitemap(slug);
    await loadPosts();
    await loadDrafts();
    log("Artigo registrado no posts.js a partir do rascunho/HTML.");
    await verifyProject();
  }

  async function extractArticleMetadata(slug){
    const html = await readText(["artigos", slug, "index.html"]);
    const title = (html.match(/<h1>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)(?: -| —| &mdash;| - PopZun)/i) || [])[1] || "";
    const desc = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [])[1] || "";
    const category = (html.match(/<a class=["']article-cat["'][^>]*>[\s\S]*?([A-Za-zÀ-ÿ ]+)<\/a>/i) || [])[1] || "";
    return {
      slug,
      title: title.replace(/<[^>]+>/g, "").trim(),
      desc,
      category: category.trim(),
      date: todayBR(),
      author: state.config.defaultAuthor || "Redacao PopZun",
      tags: [],
      content: ""
    };
  }

  async function verifyProject(){
    requireProject();
    const checks = [];
    const slugs = state.posts.map(post => post.slug);
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    duplicates.forEach(slug => checks.push({ level: "error", text: `Slug duplicado em posts.js: ${slug}` }));
    for(const post of state.posts){
      if(!categories[post.category]) checks.push({ level: "warn", text: `Categoria desconhecida: ${post.category} (${post.slug})` });
      if(!(await exists(["artigos", post.slug, "index.html"]))) checks.push({ level: "error", text: `Post sem artigo HTML: ${post.slug}` });
      const imgPath = String(post.image || "").replace(/^\//, "").split("/");
      if(!post.image) checks.push({ level: "error", text: `Post sem imagem: ${post.slug}` });
      else if(!(await exists(imgPath))) checks.push({ level: "error", text: `Imagem inexistente: ${post.image}` });
      try{
        const html = await readText(["artigos", post.slug, "index.html"]);
        if(!/<title>.+<\/title>/i.test(html)) checks.push({ level: "warn", text: `Artigo sem title: ${post.slug}` });
        if(!/<meta\s+name=["']description["']/i.test(html)) checks.push({ level: "warn", text: `Artigo sem meta description: ${post.slug}` });
        if(!/<meta\s+property=["']og:image["']/i.test(html)) checks.push({ level: "warn", text: `Artigo sem og:image: ${post.slug}` });
      }catch(e){}
    }
    let articleSlugs = [];
    try{ articleSlugs = await listDirs(["artigos"]); }catch(e){}
    articleSlugs.forEach(slug => {
      if(!slugs.includes(slug)) checks.push({ level: "warn", text: `Artigo HTML sem item no posts.js: ${slug}`, action: "register", slug });
    });
    let sitemap = "";
    try{ sitemap = await readText(["sitemap.xml"]); }catch(e){}
    const siteUrl = "https://popzun.com.br";
    state.posts.forEach(post => {
      if(!sitemap.includes(`${siteUrl}/artigos/${post.slug}/`)) checks.push({ level: "warn", text: `Sitemap sem artigo: ${post.slug}` });
    });
    if(!checks.length) checks.push({ level: "ok", text: "Tudo certo: posts, artigos, imagens e sitemap passaram na verificacao principal." });
    els.verifyPanel.classList.remove("hidden");
    renderChecks(els.verifyResults, checks);
    scrollToPanel(els.verifyPanel);
    log("Verificacao concluida.");
  }

  document.addEventListener("input", event => {
    const target = event.target;
    if(target.id === "title" && !state.currentArticle.slugEdited){
      $("#slug").value = slugify(target.value);
    }
    if(target.id === "slug"){
      state.currentArticle.slugEdited = true;
      $("#slug").value = slugify(target.value);
    }
    const alt = target.dataset.imgAlt;
    const caption = target.dataset.imgCaption;
    if(alt !== undefined){
      state.currentArticle.internalImages[alt].alt = target.value;
      saveLocalDraft();
      renderInternalImages();
      return;
    }
    if(caption !== undefined){
      state.currentArticle.internalImages[caption].caption = target.value;
      saveLocalDraft();
      renderInternalImages();
      return;
    }
    saveLocalDraft();
    if(target.id === "title" || target.id === "slug") updateSlugWarning();
  });

  document.addEventListener("change", event => {
    if(["category", "status", "trending", "recent", "zunzun", "featured"].includes(event.target.id)){
      saveLocalDraft();
    }
  });

  document.addEventListener("click", async event => {
    const button = event.target.closest("button");
    if(!button) return;
    event.preventDefault();
    event.stopPropagation();
    try{
      if(button.id === "selectProjectBtn") await selectProject();
      else if(button.id === "newArticleBtn") newArticle();
      else if(button.id === "openSiteBtn") openSite();
      else if(button.id === "openArticleBtn") await openExistingPanel();
      else if(button.id === "draftsBtn") await showDrafts();
      else if(button.id === "backToArticleBtn") showStep(1);
      else if(button.id === "verifyBtn" || button.dataset.openVerify) await verifyProject();
      else if(button.id === "saveConfigBtn") await saveConfig();
      else if(button.id === "createStructureBtn") await createStructure();
      else if(button.id === "generateThumbBtn") await generateThumb();
      else if(button.id === "registerCardBtn") await registerCard();
      else if(button.id === "saveInternalBtn") await saveInternalImages();
      else if(button.id === "prepublishCheckBtn") await prepublishCheck();
      else if(button.id === "publishBtn") await publish();
      else if(button.id === "deleteCurrentPostBtn") await deletePost(syncArticleFromForm().slug);
      else if(button.dataset.stepBtn) showStep(button.dataset.stepBtn);
      else if(button.dataset.insert) insertSnippet(button.dataset.insert);
      else if(button.dataset.openSlug) await openPost(button.dataset.openSlug);
      else if(button.dataset.continueDraft) await continueDraft(button.dataset.continueDraft);
      else if(button.dataset.publishDraft){ await continueDraft(button.dataset.publishDraft); showStep(5); await publish(); }
      else if(button.dataset.deleteDraft) await deleteDraft(button.dataset.deleteDraft);
      else if(button.dataset.deletePost) await deletePost(button.dataset.deletePost);
      else if(button.dataset.registerSlug) await registerArticle(button.dataset.registerSlug);
      else if(button.dataset.copy){
        const value = button.dataset.copy.replace("{slug}", syncArticleFromForm().slug);
        await navigator.clipboard.writeText(value);
        log(`Caminho copiado: ${value}`);
      }else if(button.dataset.copyFigure){
        await navigator.clipboard.writeText(figureHtml(state.currentArticle.internalImages[button.dataset.copyFigure]));
        log("HTML da imagem copiado.");
      }
    }catch(error){
      console.error(error);
      log(`Erro: ${error.message}`);
      alert(error.message);
    }
  });

  loadLocalDraft();
  $("#siteUrl").value = state.config.siteUrl;
  $("#defaultAuthor").value = state.config.defaultAuthor;
  fillForm(state.currentArticle);
  loadProjectHandle().then(async handle => {
    if(handle && await ensureHandlePermission(handle)){
      await hydrateProject(handle, true);
      log("Projeto restaurado automaticamente.");
    }
  }).catch(error => log(`Nao foi possivel restaurar o projeto: ${error.message}`));
  if(!canUseFs) log("Use Chrome ou Edge para selecionar pastas locais com permissao de escrita.");
})();
