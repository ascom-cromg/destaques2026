(function(){
  'use strict';
  const $=s=>document.querySelector(s),main=$('#main'),cats=PremioCore.categories;
  const state={screen:'intro',step:0,ballot:{},selected:{},catalog:null,ready:false,nonce:'',busy:false,confirmed:false,completed:false,edit:false};
  let storyUi;
  const paths={shield:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6L12 3Z M8.5 12l2.5 2.5 4.5-5',arrow:'M5 12h14m-5-5 5 5-5 5',back:'M19 12H5m5-5-5 5 5 5',check:'m5 12 4 4L19 6',search:'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5-2L21 21',close:'m6 6 12 12M18 6 6 18',clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',lock:'M6 10h12v10H6V10Zm3 0V7a3 3 0 0 1 6 0v3m-3 4v2',star:'m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3L2.8 9.7l6.4-.9L12 3Z',sunrise:'M3 17h18M5 21h14M7 17a5 5 0 0 1 10 0M12 2v4M3.5 8.5l3 2M20.5 8.5l-3 2M9 5l3-3 3 3',people:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-6a3 3 0 0 1 0 6M3 20v-2a6 6 0 0 1 12 0v2M18 14a5 5 0 0 1 3 4v2',smile:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-8c1.5 4 6.5 4 8 0M8 8v1m8-1v1',sprout:'M12 21v-8M12 13C4 14 3 8 3 4c6 0 10 3 9 9Zm0 3c0-7 4-10 9-10 0 6-3 10-9 10Z',pin:'M12 22s8-7.7 8-13A8 8 0 1 0 4 9c0 5.3 8 13 8 13Zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',trophy:'M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4m-4 2v5m-4 2h8'};
  function icon(name){return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[name]||paths.star)+'"/></svg>';}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function hydrateIcons(){document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
  function announce(t){$('#announcer').textContent=t;}
  function focusHeading(){const h=main.querySelector('h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}window.scrollTo({top:0,behavior:'instant'});}
  function googleMark(){return '<svg class="google-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.3ZM12 22c2.7 0 5-.9 6.7-2.5L15.4 17c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.2H2.9v2.6A10 10 0 0 0 12 22ZM6.3 13.7a6 6 0 0 1 0-3.4V7.7H2.9a10 10 0 0 0 0 8.6l3.4-2.6ZM12 6.1c1.5 0 2.8.5 3.9 1.5L18.8 4A10 10 0 0 0 2.9 7.7l3.4 2.6A6 6 0 0 1 12 6.1Z"/></svg>';}
  function privacyCard(){return '<section class="privacy-card">'+icon('shield')+'<div><h2>Suas respostas são anônimas.</h2><p>Seu nome e e-mail não aparecem na apuração. O login Google confirma o acesso institucional e limita a participação a um envio por conta. <button class="inline-link" data-privacy>Entenda a privacidade</button></p></div></section>';}
  function trophy(){return '<img class="hero-symbol" src="__AWARD_LOGO__" alt="Logo Destaques CRO-MG: estrela prateada com a marca CRO-MG em dourado">';}
  function intro(){storyUi.home();}
  function votingIntro(){
    state.screen='intro';
    main.innerHTML='<div class="intro enter-animation"><section class="intro-copy"><div class="eyebrow">PREMIAÇÃO DOS COLABORADORES</div><h1>O nosso ano tem<br>muitos <em>destaques.</em><br>O seu voto os revela.</h1><p class="intro-description">Por trás de cada conquista, tem gente que faz a diferença. Vamos reconhecer quem inspirou, colaborou e transformou o nosso 2026.</p><div class="quickfacts"><span>'+icon('star')+'6 categorias</span><span>'+icon('clock')+'Cerca de 4 minutos</span><span>'+icon('check')+'1 único envio</span></div><button class="primary" id="start">'+(APP_DEMO?'':googleMark())+(APP_DEMO?'Explorar demonstração':'Começar minha votação')+icon('arrow')+'</button><div class="access-caption">'+icon('lock')+(APP_DEMO?'Simulação sem login e sem gravação de respostas.':'Acesso Google restrito a contas @cromg.org.br')+'</div></section><aside class="award-panel">'+trophy()+'<span class="panel-caption">O VALOR ESTÁ NAS PESSOAS</span><span class="panel-year">2026</span></aside></div>'+privacyCard()+'<section aria-label="Categorias da premiação"><div class="section-head"><h2>Seis formas de reconhecer.</h2><p>Cada categoria, uma razão para aplaudir.</p></div><div class="category-grid">'+cats.map((c,i)=>'<article class="category-card"><div class="icon-wrap">'+icon(c.icon)+'</div><div><small>0'+(i+1)+' / '+esc(c.short.toUpperCase())+'</small><h3>'+esc(c.title)+'</h3></div></article>').join('')+'</div></section>';
    $('#start').onclick=()=>{if(!storyUi.canVote())return;state.step=0;step();focusHeading();};bindPrivacy();
  }
  function side(current){return '<aside class="sidebar"><p class="side-title">SEU RECONHECIMENTO</p><nav class="steps" aria-label="Etapas da votação">'+cats.map((c,i)=>{const done=state.ballot[c.id]!==undefined;return '<button class="step-nav '+(current===i?'current':done?'done':'')+'" data-step="'+i+'" '+(!done&&current!==i?'disabled':'')+' '+(current===i?'aria-current="step"':'')+'><span class="step-num">'+(done&&current!==i?icon('check'):'0'+(i+1))+'</span><span>'+esc(c.short)+'</span></button>';}).join('')+'</nav><div class="sidebar-note">'+icon('shield')+'<span>Escolha com tranquilidade.<br>Seu voto é anônimo.</span></div></aside>';}
  function progress(n,review=false){return '<div class="progress-info"><strong>'+(review?'REVISÃO FINAL':'CATEGORIA '+String(n+1).padStart(2,'0')+' DE 06')+'</strong><span>'+(review?'Quase lá!':Math.round((n/6)*100)+'% do caminho')+'</span></div><div class="progress-track" aria-hidden="true">'+cats.map((_,i)=>'<span class="'+(review||i<=n?'filled':'')+'"></span>').join('')+'</div>';}
  function bindSide(){document.querySelectorAll('[data-step]').forEach(el=>el.onclick=()=>{state.step=Number(el.dataset.step);step();focusHeading();});}
  function selectedPerson(){const id=cats[state.step].id,p=state.selected[id];return p&&p.id===state.ballot[id]?p:null;}
  function personDetails(p){if(p.type==='story')return p.id+' · História sem identificação';return [p.sector||'Delegacia Regional',p.city].filter(Boolean).join(' · ');}
  function initials(p){return p.name.split(' ').filter(w=>w.length>2).slice(0,2).map(w=>w[0]).join('');}
  function step(){
    if(state.step===0){storyUi.ballotStep();return;}
    state.screen='step';const n=state.step,c=cats[n],p=selectedPerson();
    main.innerHTML='<div class="ballot-layout enter-animation">'+side(n)+'<section class="form-area">'+progress(n)+'<div class="step-heading"><div class="large-icon">'+icon(c.icon)+'</div><div><div class="eyebrow">'+esc(c.eyebrow)+'</div><h1>'+esc(c.title)+'</h1><div class="step-subtitle">'+esc(c.subtitle)+'</div></div></div><h2 class="question">'+esc(c.question)+'</h2><p class="step-intro">'+esc(c.intro)+'</p><div class="criteria"><strong>Ao votar, considere:</strong> '+esc(c.criteria.replace(/^Considere /,''))+'</div><details class="about-category"><summary>Conheça a homenagem</summary><p>'+esc(c.description)+'</p></details><label for="person-search" class="field-label">'+(c.id==='regional'?'Qual delegacia você indica?':'Quem você indica?')+'</label><div class="input-wrap">'+icon('search')+'<input id="person-search" type="search" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="suggestions" aria-describedby="search-help" autocomplete="off" placeholder="'+(c.id==='regional'?'Digite a cidade da delegacia':'Digite o nome de um colaborador')+'" value="'+esc(p?p.name:'')+'"><button class="input-clear" id="clear-search" aria-label="Limpar busca">'+icon('close')+'</button></div><div id="suggestions" class="suggestions" role="listbox" aria-label="Sugestões" hidden></div><p class="search-help" id="search-help">'+(c.id==='regional'?'Digite pelo menos 2 letras da cidade.':'Digite pelo menos 2 letras do nome. As sugestões aparecem conforme você escreve.')+'</p><div id="chosen"></div><button class="abstain" id="abstain" role="radio" aria-checked="false"><span class="radio"></span>Prefiro não indicar nesta categoria</button><div class="actions"><button class="text-button" id="back">'+icon('back')+(state.edit?'Voltar':n===0?'Início':'Voltar')+'</button><button class="primary" id="next" disabled>'+(state.edit?'Voltar à revisão':n===5?'Revisar indicações':'Próxima categoria')+icon('arrow')+'</button></div><div class="saved-note">Suas escolhas só serão enviadas na confirmação final.</div></section></div>';
    bindSide();
    const input=$('#person-search'),results=$('#suggestions');let matches=[],active=-1,requestVersion=0,searchTimer,blurTimer;
    function close(){clearTimeout(searchTimer);requestVersion++;results.hidden=true;results.innerHTML='';matches=[];input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');input.removeAttribute('aria-busy');active=-1;}
    function choose(p){state.ballot[c.id]=p.id;state.selected[c.id]=p;state.confirmed=false;input.value=p.name;close();updateSelection();announce('Indicação selecionada: '+p.name+', '+personDetails(p));}
    function updateSelection(){
      const person=selectedPerson(),abstained=state.ballot[c.id]===null;
      $('#chosen').innerHTML=person?'<div class="selected-card">'+icon('check')+'<span class="avatar">'+esc(initials(person))+'</span><div class="person-text"><strong>'+esc(person.name)+'</strong><small>'+esc(personDetails(person))+'</small></div></div>':'';
      $('#abstain').classList.toggle('checked',abstained);$('#abstain').setAttribute('aria-checked',String(abstained));$('#next').disabled=state.ballot[c.id]===undefined;
      $('#clear-search').hidden=!input.value;
    }
    function show(){
      close();const query=input.value;
      if(!PremioCore.canSearch(query))return;
      const version=requestVersion;input.setAttribute('aria-busy','true');
      searchTimer=setTimeout(async()=>{
        try{
          const response=APP_DEMO?{ok:true,...PremioCore.suggestions(c.id,state.catalog,query)}:await rpc('buscarIndicacoes',{nonce:state.nonce,category:c.id,query});
          if(version!==requestVersion||!input.isConnected||document.activeElement!==input)return;
          if(!response.ok)throw new Error(response.message||'Não foi possível buscar os nomes. Tente novamente.');
          matches=response.items||[];active=-1;
          results.innerHTML=matches.length?matches.map((person,i)=>'<div class="suggestion" role="option" id="option-'+i+'" aria-selected="false" data-option="'+i+'"><span class="avatar">'+(c.id==='regional'?icon('pin'):esc(initials(person)))+'</span><div class="person-text"><strong>'+esc(person.name)+'</strong><small>'+esc(personDetails(person))+'</small></div>'+icon('arrow')+'</div>').join('')+(response.hasMore?'<div class="results-empty" role="presentation">Digite mais letras para refinar a busca.</div>':''):'<div class="results-empty" role="presentation">Nenhum resultado encontrado. Confira o nome ou digite outra parte dele.</div>';
          results.hidden=false;input.setAttribute('aria-expanded','true');results.querySelectorAll('[data-option]').forEach(el=>{el.onmousedown=e=>e.preventDefault();el.onclick=()=>choose(matches[Number(el.dataset.option)]);});
          announce(matches.length+' opções encontradas.');
        }catch(error){
          if(version!==requestVersion||!input.isConnected||document.activeElement!==input)return;
          results.innerHTML='<div class="results-empty" role="presentation">'+esc(error.message)+'</div>';results.hidden=false;input.setAttribute('aria-expanded','true');announce(error.message);
        }finally{if(version===requestVersion)input.removeAttribute('aria-busy');}
      },220);
    }
    input.onfocus=()=>{clearTimeout(blurTimer);show();};
    input.oninput=()=>{delete state.ballot[c.id];delete state.selected[c.id];state.confirmed=false;updateSelection();show();};
    input.onkeydown=e=>{
      if(e.key==='Escape'){close();return;}
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        e.preventDefault();if(results.hidden){show();return;}if(!matches.length)return;
        active=(active+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;
        results.querySelectorAll('[role="option"]').forEach((el,i)=>{el.classList.toggle('active',i===active);el.setAttribute('aria-selected',String(i===active));});
        input.setAttribute('aria-activedescendant','option-'+active);$('#option-'+active).scrollIntoView({block:'nearest'});
      }else if(e.key==='Enter'&&!results.hidden&&active>=0){e.preventDefault();choose(matches[active]);}
    };
    input.onblur=()=>{blurTimer=setTimeout(close,140);};
    $('#clear-search').onclick=()=>{delete state.ballot[c.id];delete state.selected[c.id];state.confirmed=false;input.value='';close();updateSelection();input.focus();};
    $('#abstain').onclick=()=>{state.ballot[c.id]=null;delete state.selected[c.id];state.confirmed=false;input.value='';close();updateSelection();announce('Categoria respondida sem indicação.');};
    $('#back').onclick=()=>{if(state.edit){state.edit=false;review();}else if(n===0)intro();else{state.step--;step();}focusHeading();};
    $('#next').onclick=()=>{if(state.ballot[c.id]===undefined)return;state.confirmed=false;if(state.edit){state.edit=false;review();}else if(n===5)review();else{state.step++;step();}focusHeading();};
    updateSelection();
  }
  function review(){
    state.screen='review';
    const missing=cats.findIndex(c=>state.ballot[c.id]===undefined||(state.ballot[c.id]!==null&&state.selected[c.id]?.id!==state.ballot[c.id]));
    if(missing>=0){state.step=missing;step();return;}
    main.innerHTML='<div class="ballot-layout enter-animation">'+side(-1)+'<section class="form-area">'+progress(6,true)+'<div class="eyebrow">CADA INDICAÇÃO TEM VALOR</div><h1 class="review-heading">Um último olhar<br>antes do seu aplauso.</h1><p class="review-intro">Confira suas escolhas. Depois do envio, você não poderá alterar ou votar novamente com esta conta.</p><div class="review-list">'+cats.map((c,i)=>{const p=state.selected[c.id];return '<div class="review-row">'+icon(c.icon)+'<div class="review-copy"><small>'+esc(c.title)+'</small><strong>'+esc(p?p.name:'Sem indicação')+'</strong>'+(p?'<span>'+esc(personDetails(p))+'</span>':'')+'</div><button data-edit="'+i+'" aria-label="Alterar indicação em '+esc(c.short)+'">Alterar</button></div>';}).join('')+'</div><label class="consent"><input type="checkbox" id="confirm" '+(state.confirmed?'checked':'')+'><span>Conferi minhas indicações e entendo que terei <strong>um único envio</strong>, sem possibilidade de alteração.</span></label><div id="submit-error" role="alert"></div><div class="actions"><button class="text-button" id="review-back">'+icon('back')+'Voltar</button><button class="primary" id="submit" '+(state.confirmed?'':'disabled')+'>'+icon('check')+(APP_DEMO?'Concluir simulação':'Confirmar e enviar')+'</button></div><div class="saved-note">'+(APP_DEMO?'Demonstração: nenhuma resposta será gravada.':'Apuração anônima. Nenhum nome ou e-mail de votante será salvo com os resultados.')+'</div></section></div>';
    bindSide();document.querySelectorAll('[data-edit]').forEach(el=>el.onclick=()=>{state.step=Number(el.dataset.edit);state.confirmed=false;state.edit=true;step();focusHeading();});
    $('#confirm').onchange=e=>{state.confirmed=e.target.checked;$('#submit').disabled=!state.confirmed;};
    $('#review-back').onclick=()=>{state.step=5;step();focusHeading();};$('#submit').onclick=submit;
  }
  async function submit(){
    if(state.busy||!state.confirmed)return;state.busy=true;
    const button=$('#submit');button.disabled=true;button.innerHTML='<span class="loading-dot"></span>'+(APP_DEMO?'Concluindo…':'Enviando com segurança…');$('#submit-error').innerHTML='';
    document.querySelectorAll('[data-edit],[data-step],#review-back,#confirm').forEach(el=>el.disabled=true);
    try{
      const response=APP_DEMO?{ok:true,state:'demo_success'}:await rpc('enviarVotos',{nonce:state.nonce,ballot:state.ballot});
      if(!response.ok)throw new Error(response.message||'Não foi possível confirmar o envio. Tente novamente.');
      state.completed=true;state.ballot={};state.selected={};state.nonce='';state.screen='success';
      if(APP_DEMO)status('star','Tudo pronto para reconhecer.','Você percorreu a demonstração das seis categorias. Nenhum voto foi registrado e nenhum login Google foi realizado.','DEMONSTRAÇÃO CONCLUÍDA',true);
      else if(response.state==='already_voted')status('shield','Sua participação já foi registrada.','Esta conta já concluiu a votação. Obrigado por reconhecer as pessoas que fazem a diferença. Suas escolhas permanecem anônimas.','UM ENVIO POR CONTA');
      else status('trophy','Seu aplauso já está registrado.','Obrigado por reconhecer quem fez a diferença no nosso ano. Seu voto foi recebido e suas escolhas permanecem anônimas.','PARTICIPAÇÃO CONFIRMADA');
      focusHeading();
    }catch(error){
      if(state.screen==='review'){
        $('#submit-error').innerHTML='<p class="error">'+esc(error.message)+'</p>';
        button.disabled=false;button.innerHTML=icon('check')+'Tentar novamente';document.querySelectorAll('[data-edit],[data-step],#review-back,#confirm').forEach(el=>el.disabled=false);
        announce(error.message);
      }
    }finally{state.busy=false;}
  }
  function status(symbol,title,body,label,reset=false){main.innerHTML='<section class="status-content enter-animation"><div class="large-icon">'+icon(symbol)+'</div><span class="status-label">'+esc(label)+'</span><h1>'+esc(title)+'</h1><p>'+esc(body)+'</p>'+(reset?'<button class="primary" id="restart">Explorar novamente '+icon('arrow')+'</button>':'')+privacyCard()+'</section>';if(reset)$('#restart').onclick=()=>{state.ballot={};state.selected={};state.confirmed=false;state.completed=false;state.step=0;intro();focusHeading();};bindPrivacy();}
  function bindPrivacy(){document.querySelectorAll('[data-privacy]').forEach(el=>el.onclick=()=>$('#privacy-dialog').showModal());}
  function rpc(method,payload){payload={...(payload||{}),...(state.authToken?{authToken:state.authToken}:{})};return new Promise((resolve,reject)=>{if(!window.google||!google.script||!google.script.run){reject(new Error('Abra o link de envio das histórias para entrar com sua conta Google.'));return;}const runner=google.script.run.withSuccessHandler(resolve).withFailureHandler(()=>reject(new Error('A conexão falhou. Tente de novo: sua história não será duplicada.')));if(method==='getBootstrap')runner.getBootstrap(payload);else if(method==='entrarComCodigo')runner.entrarComCodigo(payload);else if(method==='buscarIndicacoes')runner.buscarIndicacoes(payload);else if(method==='listarHistorias')runner.listarHistorias(payload);else if(method==='enviarHistoria')runner.enviarHistoria(payload);else runner.enviarVotos(payload);});}
  function login(){
    state.screen='login';state.ready=false;
    const configured=APP_PAGES?String(window.PREMIO_CONFIG?.appsScriptUrl||''):APP_AUTH_BASE;
    const match=configured.match(/^https:\/\/script\.google\.com\/(?:a\/macros\/cromg\.org\.br\/s|macros\/s)\/([A-Za-z0-9_-]+)\/exec$/);
    const publicUrl=match?'https://script.google.com/macros/s/'+match[1]+'/exec':'';
    const googleUrl=match?'https://script.google.com/a/macros/cromg.org.br/s/'+match[1]+'/exec':'';
    main.innerHTML='<section class="login-page"><div class="eyebrow">ESSE ESPAÇO É SEU</div><h1>Entre do<br><em>seu jeito.</em></h1><p class="story-lead">Você só precisa de uma das duas opções para compartilhar sua história.</p><div class="login-grid"><article class="login-card"><span class="login-number">01</span><h2>Tenho e-mail do CRO-MG</h2><p>Use sua conta Google <strong>@cromg.org.br</strong>. Você não precisa de código de convite.</p>'+(googleUrl?'<a class="primary" target="_top" href="'+esc(googleUrl)+'">Entrar com Google '+icon('arrow')+'</a>':'<p class="error">O acesso Google está em preparação.</p>')+'</article><article class="login-card"><span class="login-number">02</span><h2>Tenho um código de convite</h2><p>Seu convite é individual. Você pode entrar mesmo sem uma conta Google.</p>'+(APP_PAGES?(publicUrl&&window.PREMIO_CONFIG?.inviteLoginEnabled===true?'<a class="secondary" href="'+esc(publicUrl)+'#codigo">Digitar meu código '+icon('arrow')+'</a>':'<p class="error">O acesso por convite está em ativação.</p>'):'<form id="invite-form"><label class="field-label" for="invite-code">Código de convite</label><input class="story-input invite-input" id="invite-code" required minlength="6" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Digite seu código"><p id="invite-error" role="alert"></p><button class="primary" type="submit">Entrar com código '+icon('arrow')+'</button></form>')+'</article></div><p class="search-help">A divulgação das histórias é anônima. Sua identificação fica restrita à organização.</p>'+(APP_PAGES?'<a class="text-button" href="./">Voltar ao início</a>':'')+'</section>';
    if(!APP_PAGES){const form=$('#invite-form');form.onsubmit=async event=>{event.preventDefault();const button=form.querySelector('button'),field=$('#invite-code');button.disabled=true;$('#invite-error').textContent='';try{const r=await rpc('entrarComCodigo',{code:field.value});field.value='';if(!r.ok||r.state!=='ready')throw new Error(r.message||'Não foi possível entrar. Tente novamente.');state.authToken=r.authToken;state.nonce=r.nonce;state.election=r.election;state.ready=true;storyUi.go('#enviar-historia');}catch(error){$('#invite-error').textContent=error.message;}finally{button.disabled=false;}};}
    focusHeading();
  }
  async function bootstrap(){
    if(APP_PAGES){state.ready=true;state.election={submissionOpen:Date.now()<StoryCore.deadline,alreadySubmitted:false,votingOpen:false};storyUi.route();return;}
    if(APP_DEMO){$('#demo-banner').hidden=false;state.catalog=DEMO_CATALOG;state.catalog.stories=PremioStoriesUI.examples;state.ready=true;storyUi.route();return;}
    try{
      const response=await rpc('getBootstrap');
      if(!response.ok)throw new Error(response.message);
      if(response.state==='login'){login();return;}
      if(response.state==='ready'){state.ready=true;state.nonce=response.nonce;state.election=response.election;storyUi.route();}
      else if(response.state==='already_voted'){state.completed=true;status('shield','Sua participação já foi registrada.','Obrigado por fazer parte deste reconhecimento. Cada conta institucional participa uma única vez.','VOTAÇÃO ANÔNIMA');}
      else if(response.state==='closed')status('trophy','A votação foi encerrada.','Obrigado por fazer parte do nosso ano. Aguarde a divulgação da premiação pela organização.','DESTAQUES CRO-MG 2026');
      else status('sprout','Estamos preparando tudo para ouvir você.','Em breve, este espaço vai receber as suas histórias. Volte daqui a pouco.','ALÉM DOS DESAFIOS');
    }catch(error){status('lock','Vamos entrar com a sua conta do CRO-MG?',''+error.message,'ESSE ESPAÇO É NOSSO');}
  }
  $('#close-privacy').onclick=()=>$('#privacy-dialog').close();
  $('#privacy-dialog').addEventListener('click',e=>{if(e.target===$('#privacy-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  $('#brand-home').onclick=()=>{if(state.busy||state.storySending)return;if(state.ready)storyUi.go('');};
  window.addEventListener('beforeunload',e=>{if(!APP_DEMO&&((!state.completed&&Object.keys(state.ballot).length)||(state.storyDraft&&state.storyDraft.body))){e.preventDefault();e.returnValue='';}});
  storyUi=PremioStoriesUI.create({state,main,esc,icon,focusHeading,bindPrivacy,trophy,rpc,side,progress,bindSide,votingIntro,login,
    nextStory:()=>{state.confirmed=false;if(state.edit){state.edit=false;review();}else{state.step=1;step();}focusHeading();},
    backStory:()=>{if(state.edit){state.edit=false;review();}else votingIntro();focusHeading();}
  });
  hydrateIcons();bindPrivacy();bootstrap();
})();

