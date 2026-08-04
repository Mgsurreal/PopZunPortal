(function(){
  const signs = [["aries","Áries","♈","21 mar — 19 abr"],["touro","Touro","♉","20 abr — 20 mai"],["gemeos","Gêmeos","♊","21 mai — 20 jun"],["cancer","Câncer","♋","21 jun — 22 jul"],["leao","Leão","♌","23 jul — 22 ago"],["virgem","Virgem","♍","23 ago — 22 set"],["libra","Libra","♎","23 set — 22 out"],["escorpiao","Escorpião","♏","23 out — 21 nov"],["sagitario","Sagitário","♐","22 nov — 21 dez"],["capricornio","Capricórnio","♑","22 dez — 19 jan"],["aquario","Aquário","♒","20 jan — 18 fev"],["peixes","Peixes","♓","19 fev — 20 mar"]];
  const picker=document.querySelector('[data-zodiac-picker]'), reading=document.querySelector('[data-horoscope-reading]'), dateLabel=document.querySelector('[data-horoscope-date]');
  let dailyData=null, selectedSign=null;
  if(dateLabel) dateLabel.textContent=new Intl.DateTimeFormat('pt-BR',{dateStyle:'full'}).format(new Date());
  if(!picker||!reading) return;
  picker.innerHTML=signs.map(([id,name,symbol,period])=>`<button type="button" class="zodiac-button" data-sign="${id}" aria-pressed="false"><span>${symbol}</span><strong>${name}</strong><small>${period}</small></button>`).join('');
  const safe=(value,fallback)=>value&&String(value).trim()?String(value):fallback;
  function render(signId){
    const sign=signs.find(item=>item[0]===signId); if(!sign)return;
    selectedSign=signId;
    document.querySelectorAll('[data-sign]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sign===signId)));
    const item=dailyData&&dailyData.signos?dailyData.signos[signId]:null;
    if(!item){reading.innerHTML=`<div class="horoscope-reading-empty"><span>${sign[2]}</span><h2>${sign[1]}</h2><p>A previsão automática ainda não foi conectada. A estrutura da página está pronta para receber os dados diários da Cloudflare.</p></div>`;return;}
    reading.innerHTML=`<header><span class="horoscope-reading-symbol">${sign[2]}</span><div><span class="horoscope-reading-label">Previsão para</span><h2>${sign[1]}</h2><small>${sign[3]}</small></div></header><p class="horoscope-general">${safe(item.geral,'Observe o ritmo do dia e escolha com calma seus próximos passos.')}</p><div class="horoscope-topics"><section><strong>♡ Amor</strong><p>${safe(item.amor,'Valorize conversas sinceras e gestos simples.')}</p></section><section><strong>◇ Trabalho</strong><p>${safe(item.trabalho,'Organização e clareza ajudam a avançar.')}</p></section><section><strong>☼ Bem-estar</strong><p>${safe(item.bemEstar,'Respeite seus limites e cuide do seu ritmo.')}</p></section></div><blockquote>${safe(item.conselho,'Aproveite o que fizer sentido e deixe o restante passar.')}</blockquote><div class="horoscope-lucky"><span>Cor: <strong>${safe(item.cor,'azul')}</strong></span><span>Número: <strong>${safe(item.numero,'7')}</strong></span><span>Melhor período: <strong>${safe(item.periodo,'tarde')}</strong></span></div><button type="button" class="horoscope-share" data-share-horoscope>Compartilhar previsão</button>`;
  }
  picker.addEventListener('click',event=>{const button=event.target.closest('[data-sign]');if(button)render(button.dataset.sign);});
  reading.addEventListener('click',async event=>{if(!event.target.closest('[data-share-horoscope]'))return;const text=`${reading.querySelector('h2')?.textContent||'Meu signo'} no PopZun: ${reading.querySelector('.horoscope-general')?.textContent||''}`;if(navigator.share)await navigator.share({title:'Horóscopo de hoje',text,url:location.href});else await navigator.clipboard.writeText(`${text} ${location.href}`);});
  fetch('/api/horoscopo').then(response=>response.ok?response.json():Promise.reject()).then(data=>{dailyData=data;if(selectedSign)render(selectedSign);}).catch(()=>{dailyData=null;});
})();
