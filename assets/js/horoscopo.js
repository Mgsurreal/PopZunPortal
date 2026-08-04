(function(){
  const signs=[["aries","Áries","♈","21 mar — 19 abr"],["touro","Touro","♉","20 abr — 20 mai"],["gemeos","Gêmeos","♊","21 mai — 20 jun"],["cancer","Câncer","♋","21 jun — 22 jul"],["leao","Leão","♌","23 jul — 22 ago"],["virgem","Virgem","♍","23 ago — 22 set"],["libra","Libra","♎","23 set — 22 out"],["escorpiao","Escorpião","♏","23 out — 21 nov"],["sagitario","Sagitário","♐","22 nov — 21 dez"],["capricornio","Capricórnio","♑","22 dez — 19 jan"],["aquario","Aquário","♒","20 jan — 18 fev"],["peixes","Peixes","♓","19 fev — 20 mar"]];
  const picker=document.querySelector('[data-zodiac-picker]');
  const dateLabel=document.querySelector('[data-horoscope-date]');
  const modal=document.querySelector('[data-horoscope-modal]');
  const dialog=modal?.querySelector('[data-horoscope-dialog]');
  const content=modal?.querySelector('[data-horoscope-modal-content]');
  let dailyData=null,selectedSign=null,lastTrigger=null,loadFailed=false;

  if(dateLabel) dateLabel.textContent=new Intl.DateTimeFormat('pt-BR',{dateStyle:'full'}).format(new Date());
  if(!picker||!modal||!dialog||!content) return;
  picker.innerHTML=signs.map(([id,name,,period])=>`<button type="button" class="zodiac-button" data-sign="${id}" aria-pressed="false"><span class="zodiac-art zodiac-art-${id}" aria-hidden="true"></span><strong>${name}</strong><small>${period}</small></button>`).join('');

  const escapeHtml=value=>String(value??'').replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
  const value=(item,key,fallback)=>item&&String(item[key]||'').trim()?String(item[key]):fallback;
  const safe=(item,key,fallback)=>escapeHtml(value(item,key,fallback));

  function openModal(trigger){
    if(trigger) lastTrigger=trigger;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('horoscope-modal-open');
    setTimeout(()=>dialog.focus(),20);
  }

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('horoscope-modal-open');
    lastTrigger?.focus();
  }

  function render(signId,trigger){
    const sign=signs.find(item=>item[0]===signId);if(!sign)return;
    selectedSign=signId;
    document.querySelectorAll('[data-sign]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sign===signId)));
    const item=dailyData?.signos?.[signId];
    if(!item){
      const message=loadFailed?'Não conseguimos carregar a previsão agora. Feche este card e tente novamente em instantes.':'Estamos buscando a leitura de hoje. Ela aparecerá aqui em poucos segundos.';
      content.innerHTML=`<div class="horoscope-modal-loading"><span>${sign[2]}</span><h2>${sign[1]}</h2><p>${message}</p></div>`;
      openModal(trigger);
      return;
    }
    const shareUrl=`${location.origin}${location.pathname}?signo=${signId}`;
    const shareText=encodeURIComponent(`${sign[1]} no PopZun: ${value(item,'geral','Confira a previsão do dia.')}`);
    content.innerHTML=`<div class="horoscope-modal-copy"><header><span class="horoscope-reading-symbol">${sign[2]}</span><div><span class="horoscope-reading-label">Previsão para</span><h2 id="horoscope-modal-title">${sign[1]}</h2><small>${sign[3]}</small></div></header><p class="horoscope-general">${safe(item,'geral','Observe o ritmo do dia e escolha com calma seus próximos passos.')}</p><div class="horoscope-topics"><section><strong>♡ Amor</strong><p>${safe(item,'amor','Valorize conversas sinceras e gestos simples.')}</p></section><section><strong>◇ Trabalho</strong><p>${safe(item,'trabalho','Organização e clareza ajudam a avançar.')}</p></section><section><strong>☼ Bem-estar</strong><p>${safe(item,'bemEstar','Respeite seus limites e cuide do seu ritmo.')}</p></section></div><blockquote>${safe(item,'conselho','Aproveite o que fizer sentido e deixe o restante passar.')}</blockquote><div class="horoscope-lucky"><span>Cor: <strong>${safe(item,'cor','azul')}</strong></span><span>Número: <strong>${safe(item,'numero','7')}</strong></span><span>Melhor período: <strong>${safe(item,'periodo','tarde')}</strong></span></div><div class="horoscope-share-actions"><button type="button" class="horoscope-share" data-share-horoscope>↗ Compartilhar</button><a class="horoscope-share-network whats" href="https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener">WhatsApp</a><a class="horoscope-share-network face" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener">Facebook</a><a class="horoscope-share-network x" href="https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener">X</a></div></div>`;
    history.replaceState(null,'',`?signo=${signId}`);
    openModal(trigger);
  }

  picker.addEventListener('click',event=>{const button=event.target.closest('[data-sign]');if(button)render(button.dataset.sign,button);});
  modal.addEventListener('click',async event=>{
    if(event.target.closest('[data-horoscope-close]')){closeModal();return;}
    const share=event.target.closest('[data-share-horoscope]');if(!share)return;
    const text=`${content.querySelector('h2')?.textContent||'Meu signo'} no PopZun: ${content.querySelector('.horoscope-general')?.textContent||''}`;
    if(navigator.share) await navigator.share({title:'Horóscopo de hoje',text,url:location.href});
    else{await navigator.clipboard.writeText(`${text} ${location.href}`);share.textContent='✓ Link copiado';}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('is-open'))closeModal();});

  const initialSign=new URLSearchParams(location.search).get('signo');
  if(signs.some(item=>item[0]===initialSign)) render(initialSign);
  fetch('https://popzun-horoscopo.surreal-marcosrg.workers.dev/api/horoscopo').then(response=>response.ok?response.json():Promise.reject()).then(data=>{dailyData=data;if(selectedSign)render(selectedSign,lastTrigger);}).catch(()=>{loadFailed=true;if(selectedSign)render(selectedSign,lastTrigger);});
})();
