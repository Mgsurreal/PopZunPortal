(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const CATEGORIES = {
    "Famosos":"famosos", "TV e Reality":"tv-e-reality", "Internet":"internet", "Futebol":"futebol", "Culinária":"culinaria",
    "Curiosidades":"curiosidades", "Polêmicas":"polemicas", "Nostalgia":"nostalgia", "Horóscopo":"horoscopo"
  };
  const FIRST_OFFICIAL_DATE = new Date(2026, 6, 21);
  const PRESERVED_ARTICLES = new Set([
    "bonnie-tyler-morre-aos-75-anos-e-internet-relembra-musica-que-marcou-geracoes"
  ]);

  function isOfficialPost(post){
    if(PRESERVED_ARTICLES.has(post.slug)) return true;
    const parts = String(post.date || "").split("/").map(Number);
    if(parts.length !== 3 || parts.some(Number.isNaN)) return false;
    return new Date(parts[2], parts[1] - 1, parts[0]) >= FIRST_OFFICIAL_DATE;
  }

  function officialPosts(){
    return (window.POSTS || (typeof POSTS !== "undefined" ? POSTS : [])).filter(isOfficialPost);
  }

  function categoryUrl(category){
    if(category === 'ZunZun') return '/zunzun/';
    return `/categoria/${CATEGORIES[category] || 'em-alta'}/`;
  }
  function cardTemplate(post, small=false){
    const url = `/artigos/${post.slug}/`;
    const reactions = post.reactions || ['-', '-', '-', '-'];
    return `
      <article class="card ${small ? 'small-card' : ''}">
        <a class="card-media" href="${url}" aria-label="Ler: ${post.title}">
          <img src="${post.image}" alt="Imagem ilustrativa do artigo ${post.title}" loading="lazy">
          <span class="badge">${post.emoji} ${post.category}</span>
        </a>
        <div class="reactions" aria-hidden="true">
          <span>☻ ${reactions[0]}</span><span>☹ ${reactions[1]}</span><span>☆ ${reactions[2]}</span><span>▱ ${reactions[3]}</span>
        </div>
        <h2 class="card-title"><a href="${url}">${post.title}</a></h2>
        <p class="card-desc">${post.desc}</p>
        <div class="meta"><a href="${categoryUrl(post.category)}">${post.category}</a><span>◷ ${post.date}</span></div>
      </article>`;
  }

  function pickPosts(mode, grid){
    let posts = officialPosts();
    if(mode === 'trending') posts = posts.filter(p => p.trending);
    if(mode === 'recent') posts = posts.filter(p => p.recent);
    if(mode === 'category') posts = posts.filter(p => p.category === grid.dataset.category);
    if(mode === 'zunzun') posts = posts.filter(p => p.trending).slice(0, 12);
    return posts;
  }

  function renderGrid(){
    const grid = $('[data-post-grid]');
    if(!grid || typeof POSTS === 'undefined') return;
    const mode = grid.dataset.mode || 'all';
    const posts = pickPosts(mode, grid);
    if(!posts.length){ grid.innerHTML = '<div class="empty">Nada encontrado por enquanto.</div>'; return; }
    grid.innerHTML = posts.map((p, i) => {
      let html = cardTemplate(p);
      if(i === 3){
        html += `<div class="in-feed-ad"><div class="ad-label">Anúncio</div><div class="ad-box ad-square" data-ad-slot="feed-mobile"><div><strong>300x250</strong>anúncio no fluxo mobile<div class="ad-note">Trocar pelo código da rede depois.</div></div></div></div>`;
      }
      return html;
    }).join('');
  }

  function renderRelated(){
    const related = $('[data-related]');
    if(!related || typeof POSTS === 'undefined') return;
    const current = document.body.dataset.slug;
    const visiblePosts = officialPosts();
    const currentPost = visiblePosts.find(p => p.slug === current);
    let pool = visiblePosts.filter(p => p.slug !== current);
    if(currentPost){
      const same = pool.filter(p => p.category === currentPost.category);
      const rest = pool.filter(p => p.category !== currentPost.category);
      pool = same.concat(rest);
    }
    related.innerHTML = pool.slice(0,4).map(p => cardTemplate(p, true)).join('');
  }

  function setupMenu(){
    const btn = $('[data-menu-btn]');
    const panel = $('[data-mobile-panel]');
    if(!btn || !panel) return;
    function closeMenu(){ panel.classList.remove('open'); document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded','false'); }
    btn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
    });
    panel.addEventListener('click', e => { if(e.target.tagName === 'A') closeMenu(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', e => {
      if(document.body.classList.contains('menu-open') && !panel.contains(e.target) && !btn.contains(e.target)) closeMenu();
    });
  }

  function setupSearch(){
    const btn = $('[data-search-btn]');
    const panel = $('[data-search-panel]');
    const form = $('[data-search-form]');
    if(btn && panel){
      btn.addEventListener('click', () => {
        panel.classList.toggle('open');
        const input = $('input', panel);
        if(input) input.focus();
      });
    }
    if(form){
      form.addEventListener('submit', e => {
        e.preventDefault();
        const q = $('input', form).value.trim().toLowerCase();
        const grid = $('[data-post-grid]');
        if(!grid || typeof POSTS === 'undefined') return;
        if(!q){ renderGrid(); return; }
        const found = officialPosts().filter(p => `${p.title} ${p.desc} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase().includes(q));
        grid.innerHTML = found.length ? found.map(p => cardTemplate(p)).join('') : `<div class="empty">Nada encontrado para: <strong>${q}</strong></div>`;
      });
    }
  }

  function setupBottomAd(){
    const ad = $('[data-bottom-ad]');
    const close = $('[data-close-bottom-ad]');
    if(!ad || !close) return;
    if(sessionStorage.getItem('bottomAdClosed') === '1') ad.style.display = 'none';
    close.addEventListener('click', () => { ad.style.display = 'none'; sessionStorage.setItem('bottomAdClosed','1'); });
  }

  const cookieKey = 'popzunCookiePreferences';
  const defaultCookiePrefs = { necessary: true, analytics: false, ads: false, affiliates: false };

  function readCookiePrefs(){
    try{
      return Object.assign({}, defaultCookiePrefs, JSON.parse(localStorage.getItem(cookieKey) || '{}'));
    }catch(e){
      return Object.assign({}, defaultCookiePrefs);
    }
  }

  function saveCookiePrefs(prefs){
    const data = Object.assign({}, defaultCookiePrefs, prefs, { necessary: true, savedAt: new Date().toISOString() });
    localStorage.setItem(cookieKey, JSON.stringify(data));
    window.PopZunConsent = data;
    loadConsentScripts(data);
    return data;
  }

  function loadConsentScripts(prefs){
    if(prefs.analytics) loadAnalyticsScripts();
    if(prefs.ads) loadPersonalizedAdScripts();
    if(prefs.affiliates) loadAffiliateScripts();
  }

  function loadAnalyticsScripts(){}
  function loadPersonalizedAdScripts(){}
  function loadAffiliateScripts(){}

  function setupCookie(){
    const btn = $('[data-cookie-btn]');
    const panel = $('[data-cookie-panel]');
    const accept = $('[data-cookie-accept]');
    const reject = $('[data-cookie-reject]');
    const openPrefs = $('[data-cookie-open-preferences]');
    const prefsPanel = $('[data-cookie-preferences-panel]');
    const save = $('[data-cookie-save]');
    if(!btn || !panel) return;

    const saved = localStorage.getItem(cookieKey);
    let prefs = readCookiePrefs();
    window.PopZunConsent = prefs;
    loadConsentScripts(prefs);

    function fillInputs(){
      $$('[data-cookie-choice]', panel).forEach(input => {
        input.checked = !!prefs[input.value];
      });
    }

    function closePanel(){
      panel.classList.remove('open');
      panel.classList.remove('show-preferences');
      if(prefsPanel) prefsPanel.hidden = true;
    }

    fillInputs();
    if(!saved) panel.classList.add('open');

    btn.addEventListener('click', () => panel.classList.toggle('open'));
    if(accept) accept.addEventListener('click', () => { prefs = saveCookiePrefs({ analytics: true, ads: true, affiliates: true }); fillInputs(); closePanel(); });
    if(reject) reject.addEventListener('click', () => { prefs = saveCookiePrefs({ analytics: false, ads: false, affiliates: false }); fillInputs(); closePanel(); });
    if(openPrefs) openPrefs.addEventListener('click', () => {
      if(!prefsPanel) return;
      prefsPanel.hidden = !prefsPanel.hidden;
      panel.classList.toggle('show-preferences', !prefsPanel.hidden);
    });
    if(save) save.addEventListener('click', () => {
      const next = {};
      $$('[data-cookie-choice]', panel).forEach(input => { next[input.value] = input.checked; });
      prefs = saveCookiePrefs(next);
      fillInputs();
      closePanel();
    });
  }

  function setupShare(){
    const copy = $('[data-copy-link]');
    if(copy) copy.addEventListener('click', async () => {
      try{ await navigator.clipboard.writeText(location.href); copy.textContent = 'Link copiado'; }
      catch(e){ copy.textContent = 'Copie pela barra'; }
    });
    $$('[data-share-url]').forEach(a => {
      const type = a.dataset.shareUrl;
      const url = encodeURIComponent(location.href);
      const text = encodeURIComponent(document.title);
      if(type === 'whatsapp') a.href = `https://api.whatsapp.com/send?text=${text}%20${url}`;
      if(type === 'facebook') a.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    });
  }

  function highlightActiveNav(){
    const path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
    $$('.nav a, .mobile-panel a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === path || (path === '/' && href === '/em-alta/'));
    });
  }

  function setupLocalAdminLink(){
    const isLocal =
      window.location.protocol === 'file:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const isHome = window.location.protocol === 'file:'
      ? /(?:^|[\\/])index\.html$/i.test(window.location.pathname)
      : window.location.pathname === '/' || window.location.pathname === '/index.html';
    if(!isLocal || !isHome || $('[data-local-admin-link]')) return;

    const footerLinks = $('.footer-links');
    if(!footerLinks) return;

    const link = document.createElement('a');
    link.href = window.location.protocol === 'file:' ? './popzun-studio/index.html' : '/popzun-studio/';
    link.textContent = 'ADM';
    link.setAttribute('data-local-admin-link', '');
    link.setAttribute('rel', 'nofollow');
    link.setAttribute('title', 'Abrir PopZun Studio');
    footerLinks.appendChild(link);
  }

  function setupHoroscopeLinks(){
    const targets = [
      { root: $('.nav'), before: '.live' },
      { root: $('[data-mobile-panel]') },
      { root: $('.quick-tags') }
    ];
    targets.forEach(({ root, before }) => {
      if(!root || $('a[href="/horoscopo/"]', root)) return;
      const link = document.createElement('a');
      link.href = '/horoscopo/';
      link.textContent = '🔮 Horóscopo';
      const anchor = before ? $(before, root) : null;
      root.insertBefore(link, anchor);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
    renderRelated();
    setupMenu();
    setupSearch();
    setupBottomAd();
    setupCookie();
    setupShare();
    setupHoroscopeLinks();
    highlightActiveNav();
    setupLocalAdminLink();
  });
})();
