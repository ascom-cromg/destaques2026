/* Envio e leitura de histórias. Nenhum rascunho é persistido no dispositivo. */
var PremioStoriesUI=(function(){
  'use strict';
  const examples=[
    {id:'H-A10B20C30D40',name:'Um passo de cada vez',title:'Um passo de cada vez',type:'story',active:true,body:'Houve um período em que até as tarefas mais simples pareciam grandes demais. Eu tentava resolver tudo de uma vez e terminava o dia com a sensação de não ter avançado. A mudança começou quando aprendi a respeitar o meu tempo e a reconhecer as pequenas conquistas. Pedir apoio também fez parte do caminho. Aos poucos, voltei a confiar na minha capacidade de seguir em frente. Hoje, entendo que superar não é nunca sentir medo: é encontrar um próximo passo possível, mesmo quando o caminho ainda não está inteiro à vista.'},
    {id:'H-B20C30D40E50',name:'Aprender um novo caminho',title:'Aprender um novo caminho',type:'story',active:true,body:'Quando precisei aprender uma atividade que parecia muito distante do que eu sabia fazer, minha primeira reação foi achar que não conseguiria. Comecei anotando dúvidas, estudando um pouco todos os dias e aceitando que errar fazia parte do aprendizado. O apoio que encontrei me ajudou a transformar insegurança em curiosidade. O que antes parecia impossível passou a fazer parte da minha rotina. Essa experiência me ensinou a não confundir dificuldade com incapacidade e a valorizar cada pessoa que nos ajuda a crescer.'},
    {id:'H-C30D40E50F60',name:'Recomeçar também é avançar',title:'Recomeçar também é avançar',type:'story',active:true,body:'Eu havia organizado meus planos de uma forma, mas a vida pediu uma mudança de direção. Foi difícil aceitar que recomeçar não significava perder tudo o que eu já tinha construído. Passei a olhar para as experiências anteriores como recursos para uma nova etapa. Dei espaço a novas possibilidades, estabeleci metas menores e voltei a celebrar o processo. Ainda há desafios, mas hoje reconheço a coragem que existe em ajustar a rota. Recomeçar me mostrou que a nossa história pode continuar de um jeito diferente e ainda assim fazer sentido.'}
  ];
  function create(api){
    const {state,main,esc,icon,focusHeading}=api;
    let stories=null,request=0;
    function election(){return state.election||{submissionOpen:StoryCore.submissionOpen(Date.now(),'ABERTO'),votingOpen:false,alreadySubmitted:false,alreadyVoted:false};}
    function canVote(){return (APP_DEMO&&state.previewVoting)||election().votingOpen;}
    function setView(html){request++;main.innerHTML=html;api.bindPrivacy();focusHeading();}
    function home(){
      state.screen='intro';const e=election();
      setView('<div class="intro portal enter-animation"><section class="intro-copy"><div class="eyebrow">ALÉM DOS DESAFIOS</div><h1>Sua história de<br><em>superação merece<br>ser contada.</em></h1><p class="intro-description">Queremos conhecer histórias de quem enfrentou obstáculos significativos, pessoais ou profissionais, e encontrou coragem, resiliência e determinação para recomeçar e seguir em frente.</p><p class="intro-description">Não precisa ter relação com o trabalho. Pode ser uma experiência da sua vida que inspire outras pessoas a enfrentar os próprios desafios.</p><div class="deadline-chip">'+icon('clock')+'Conte até <strong>30 de novembro, às 23h59</strong></div><div class="portal-actions">'+(e.submissionOpen&&!e.alreadySubmitted?'<a class="primary" href="#enviar-historia">Quero contar minha história '+icon('arrow')+'</a>':'<span class="closed-pill">'+(e.alreadySubmitted?'Obrigado por compartilhar sua história':Date.now()>=StoryCore.deadline?'O prazo para enviar terminou':'Estamos preparando tudo para ouvir você')+'</span>')+'</div><p class="access-caption">'+icon('shield')+'Conte com suas palavras. A divulgação da sua história será anônima.</p></section><aside class="award-panel">'+api.trophy()+'<span class="panel-caption">DESTAQUES CRO-MG</span><span class="panel-year">2026</span></aside></div><section class="story-invitation"><div><span class="eyebrow">DO SEU JEITO</span><h2>Não precisa de palavras perfeitas.<br>Só da sua voz.</h2><p>Pense no caminho que você percorreu, no que ajudou a enfrentar esse momento e no que aprendeu com ele. Conte no seu ritmo e compartilhe apenas o que se sentir à vontade.</p></div><div class="privacy-card">'+icon('shield')+'<div><h2>Você escolhe o que contar.</h2><p>Deixe de fora nomes, setor, cidade e detalhes que revelem identidades. Antes de compartilhar, nossa equipe lê o relato com cuidado.</p><button class="inline-link" data-privacy>Como cuidamos da sua privacidade</button></div></div></section>');
    }
    function go(hash){if(location.hash!==hash)location.hash=hash;else route();}
    function route(){
      if(location.hash==='#enviar-historia')form();
      else if(location.hash==='#historias')home();
      else if(location.hash==='#votacao')home();
      else home();
    }
    function makeCodes(){
      const bytes=crypto.getRandomValues(new Uint8Array(32));
      return {id:'H-'+Array.from(bytes.slice(0,6),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase(),authorKey:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')};
    }
    function form(){
      if(APP_PAGES){
        const endpoint=String(window.PREMIO_CONFIG?.appsScriptUrl||'').trim();
        if(/^https:\/\/script\.google\.com\/(?:a\/macros\/cromg\.org\.br\/s|macros\/s)\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)){location.assign(endpoint);return;}
        state.screen='story-awaiting';setView('<section class="status-content"><h1>Estamos preparando<br>um espaço para ouvir você.</h1><p>O envio de histórias ainda não foi aberto. Volte em breve.</p><a class="secondary" href="#">Voltar ao início</a></section>');return;
      }
      state.screen='story-form';
      if(!election().submissionOpen||election().alreadySubmitted){setView('<section class="status-content"><div class="large-icon">'+icon('clock')+'</div><h1>'+(election().alreadySubmitted?'Sua história já foi recebida.':'O recebimento está fechado.')+'</h1><p>'+(election().alreadySubmitted?'Obrigado por dividir seu caminho com a gente. Guarde a chave que recebeu ao enviar.':Date.now()>=StoryCore.deadline?'O prazo de envio terminou em 30 de novembro de 2026, às 23h59.':'Estamos preparando tudo para ouvir você. Volte em breve.')+'</p><a class="secondary" href="#">Voltar ao início</a></section>');return;}
      if(!state.storyDraft)state.storyDraft={...makeCodes(),title:'',body:'',consent:false};const d=state.storyDraft;
      setView('<section class="story-form-page enter-animation"><a href="#" class="text-button">'+icon('back')+'Voltar ao início</a><div class="eyebrow">ESSE ESPAÇO É SEU</div><h1>Conte sua história<br><em>de superação.</em></h1><p class="story-lead">Sua história pode ser da vida pessoal ou profissional — não precisa ter relação com o trabalho. Conte um desafio significativo, como encontrou forças para enfrentá-lo e o que aprendeu ao recomeçar. Escreva com suas palavras.</p><div class="privacy-card">'+icon('shield')+'<div><h2>Vamos cuidar da sua privacidade?</h2><p>Deixe de fora seu nome, setor, cidade e contatos. Evite também nomes de outras pessoas e detalhes que permitam reconhecer alguém. Sua história pode dizer muito sem revelar quem você é.</p></div></div><form id="story-form"><label class="field-label" for="story-title">Dê um título à sua história</label><input class="story-input" id="story-title" minlength="5" maxlength="100" required autocomplete="off" placeholder="Como você chamaria essa história?" value="'+esc(d.title)+'"><label class="field-label" for="story-body">Sua história de superação</label><p class="search-help">Que desafio você enfrentou? Como encontrou forças? O que esse caminho ensinou a você?</p><textarea id="story-body" minlength="200" maxlength="5000" required placeholder="Escreva seu relato aqui…">'+esc(d.body)+'</textarea><div class="character-count" id="story-count">'+d.body.length+' / 5.000 caracteres · mínimo de 200</div><div id="story-form-error" role="alert"></div><div class="story-form-footer"><span>'+icon('clock')+'Até 30/11/2026, às 23h59 · Brasília</span><button class="primary" type="submit">Revisar meu relato '+icon('arrow')+'</button></div></form></section>');
      const title=document.querySelector('#story-title'),body=document.querySelector('#story-body');
      function save(){d.title=title.value;d.body=body.value;d.consent=false;document.querySelector('#story-count').textContent=body.value.length+' / 5.000 caracteres · mínimo de 200';}
      title.oninput=body.oninput=save;
      document.querySelector('#story-form').onsubmit=event=>{event.preventDefault();save();try{StoryCore.validate({...d,consent:true});reviewStory();}catch(error){document.querySelector('#story-form-error').innerHTML='<p class="error">'+esc(error.message.replace(/^História: /,''))+'</p>';}};
    }
    function reviewStory(){
      state.screen='story-review';const d=state.storyDraft;
      setView('<section class="story-form-page enter-animation"><div class="eyebrow">REVISE ANTES DE ENVIAR</div><h1>Sua história,<br><em>com suas palavras.</em></h1><p class="story-lead">Leia mais uma vez, com calma. Ficou do jeito que você queria? Confira se não há nomes ou detalhes que revelem identidades. Nossa equipe também vai ler antes de compartilhar.</p><article class="story-reading"><span class="story-code">'+esc(d.id)+'</span><h2>'+esc(d.title)+'</h2><div class="story-body">'+esc(d.body)+'</div></article><label class="consent"><input id="story-consent" type="checkbox" '+(d.consent?'checked':'')+'><span>Revisei o relato e <strong>autorizo sua publicação anônima</strong> na dinâmica Além dos Desafios, do Destaques CRO-MG 2026.</span></label><p class="search-help">A divulgação será anônima. Seu e-mail de acesso ficará restrito à organização para identificar a autoria.</p><div id="story-send-error" role="alert"></div><div class="actions"><button class="secondary" id="edit-story">Editar relato</button><button class="primary" id="send-story" '+(d.consent?'':'disabled')+'>'+(APP_DEMO?'Simular envio':'Enviar história')+icon('arrow')+'</button></div></section>');
      document.querySelector('#edit-story').onclick=form;
      document.querySelector('#story-consent').onchange=event=>{d.consent=event.target.checked;document.querySelector('#send-story').disabled=!d.consent;};
      document.querySelector('#send-story').onclick=async()=>{
        if(state.storySending||!d.consent)return;state.storySending=true;
        const button=document.querySelector('#send-story');button.disabled=true;document.querySelector('#edit-story').disabled=true;button.textContent='Enviando…';
        try{
          if(!APP_DEMO){const fresh=await api.rpc('getBootstrap');if(!fresh.ok)throw new Error(fresh.message||'Sua sessão expirou. Recarregue a página.');state.nonce=fresh.nonce;}
          const response=APP_DEMO?{ok:true,state:'submitted',id:d.id}:await api.rpc('enviarHistoria',{...d,nonce:state.nonce});
          if(!response.ok)throw new Error(response.message||'Não foi possível confirmar o envio. Tente novamente.');
          state.election={...election(),alreadySubmitted:true};state.storyDraft=null;
          receipt(response,d);
        }catch(error){document.querySelector('#story-send-error').innerHTML='<p class="error">'+esc(error.message)+'</p>';button.disabled=false;document.querySelector('#edit-story').disabled=false;button.textContent='Tentar novamente';}
        finally{state.storySending=false;}
      };
    }
    function receipt(response,d){
      state.screen='story-success';
      if(response.state==='already_submitted'){setView('<section class="status-content"><h1>Você já enviou uma história.</h1><p>Obrigado por dividir esse pedacinho do seu caminho. Cada pessoa pode enviar uma história. Guarde a chave que recebeu ao concluir o envio.</p><a href="#" class="secondary">Voltar ao início</a></section>');return;}
      setView('<section class="story-form-page story-receipt enter-animation"><div class="large-icon">'+icon('check')+'</div><div class="eyebrow">'+(APP_DEMO?'SIMULAÇÃO CONCLUÍDA':'HISTÓRIA RECEBIDA')+'</div><h1>'+ (APP_DEMO?'Seu relato está<br><em>pronto para enviar.</em>':'Obrigado por<br><em>compartilhar.</em>')+'</h1><p class="story-lead">'+(APP_DEMO?'Este foi um teste. O relato não foi enviado nem publicado.':'Que bom conhecer um pouco do seu caminho. Nossa equipe vai ler sua história com cuidado antes de compartilhá-la sem seu nome.')+'</p><div class="receipt-box"><span>Código público da história</span><strong>'+esc(response.id)+'</strong><p>Guarde um pedacinho dessa história com você. Baixe sua chave de autoria e mantenha em um lugar seguro. Só compartilhe com a equipe se quiser comprovar que o relato é seu.</p><button class="secondary" id="download-story-receipt">Guardar minha chave '+icon('arrow')+'</button><p class="search-help">'+(APP_DEMO?'Comprovante demonstrativo, sem validade de participação.':'A organização guarda seu e-mail para identificar a autoria. Ele não aparece na divulgação da história.')+'</p></div><a href="#" class="primary">Voltar ao início '+icon('arrow')+'</a></section>');
      document.querySelector('#download-story-receipt').onclick=()=>{
        const content=(APP_DEMO?'DEMONSTRAÇÃO — SEM VALIDADE DE PARTICIPAÇÃO\n\n':'')+'DESTAQUES CRO-MG 2026 — ALÉM DOS DESAFIOS\nHistória: '+response.id+'\nTítulo: '+d.title+'\nCódigo reservado de autoria: '+d.authorKey+'\n\nGuarde este arquivo. Não compartilhe a chave publicamente.\n';
        const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='comprovante-'+response.id+'.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      };
    }
    async function loadStories(force){
      if(stories&&!force)return stories;
      if(APP_DEMO){stories=examples;return stories;}
      const response=await api.rpc('listarHistorias',{nonce:state.nonce});
      if(!response.ok)throw new Error(response.message||'Não foi possível carregar as histórias.');
      stories=response.items||[];return stories;
    }
    function card(s,voting){return '<article class="story-card '+(voting&&state.ballot.superacao===s.id?'picked':'')+'"><span class="story-code">'+esc(s.id)+'</span><h2>'+esc(s.title)+'</h2><p>'+esc(s.body.slice(0,170))+'…</p><button class="'+(voting&&state.ballot.superacao===s.id?'primary':'text-button')+'" data-read-story="'+esc(s.id)+'">'+(voting&&state.ballot.superacao===s.id?'História escolhida':'Ler história completa')+icon('arrow')+'</button></article>';}
    function bindReaders(items,voting){document.querySelectorAll('[data-read-story]').forEach(button=>button.onclick=()=>readStory(items.find(s=>s.id===button.dataset.readStory),voting));}
    function readStory(s,voting){
      let dialog=document.querySelector('#story-reader');if(!dialog){dialog=document.createElement('dialog');dialog.id='story-reader';dialog.className='dialog story-dialog';document.body.appendChild(dialog);}
      dialog.setAttribute('aria-labelledby','reader-title');dialog.innerHTML='<span class="story-code">'+esc(s.id)+'</span><h2 id="reader-title">'+esc(s.title)+'</h2><div class="story-body">'+esc(s.body)+'</div><p class="search-help">Publicação sem identificação.'+(APP_DEMO?' Exemplo fictício de demonstração.':'')+'</p><div class="actions"><button class="secondary" id="close-story">Fechar</button>'+(voting?'<button class="primary" id="choose-story">Escolher esta história '+icon('check')+'</button>':'')+'</div>';
      document.querySelector('#close-story').onclick=()=>dialog.close();
      if(voting)document.querySelector('#choose-story').onclick=()=>{state.ballot.superacao=s.id;state.selected.superacao={...s,type:'story'};state.confirmed=false;dialog.close();ballotStep();};
      dialog.showModal();
    }
    async function gallery(force=false){
      state.screen='story-gallery';setView('<section class="story-gallery-page"><a class="text-button" href="#">'+icon('back')+'Voltar ao início</a><div class="eyebrow">ALÉM DOS DESAFIOS</div><h1>Histórias que<br><em>inspiram caminhos.</em></h1><p class="story-lead">Conheça relatos de coragem, perseverança e recomeço. Cada texto é publicado com um código, sem identificar quem o enviou.</p>'+(APP_DEMO?'<p class="demo-note">Exemplos fictícios para demonstração. Nenhum destes relatos foi enviado por colaboradores.</p>':'')+'<div class="gallery-toolbar"><span id="story-total">Carregando histórias…</span><button class="text-button" id="refresh-stories">Atualizar histórias</button></div><div class="story-grid" id="story-grid" aria-live="polite"></div></section>');
      const current=request;document.querySelector('#refresh-stories').onclick=()=>gallery(true);
      try{const items=await loadStories(force);if(current!==request)return;document.querySelector('#story-total').textContent=items.length+' histórias '+(APP_DEMO?'de exemplo':'publicadas');document.querySelector('#story-grid').innerHTML=items.length?items.map(s=>card(s,false)).join(''):'<div class="story-empty"><h2>As primeiras histórias chegam em breve.</h2><p>Os relatos aparecerão aqui após a revisão da organização. O envio fica disponível até 30 de novembro.</p></div>';bindReaders(items,false);}catch(error){if(current===request)document.querySelector('#story-grid').innerHTML='<p class="error">'+esc(error.message)+'</p>';}
    }
    async function ballotStep(){
      state.screen='step';const c=PremioCore.categories[0];
      setView('<div class="ballot-layout enter-animation">'+api.side(0)+'<section class="form-area">'+api.progress(0)+'<div class="step-heading"><div class="large-icon">'+icon('sunrise')+'</div><div><div class="eyebrow">CORAGEM QUE INSPIRA</div><h1>Além dos Desafios</h1><div class="step-subtitle">UMA HISTÓRIA DE SUPERAÇÃO</div></div></div><h2 class="question">Qual história mais inspirou você?</h2><p class="step-intro">Nesta categoria, seu voto é para a história. Leia os relatos e escolha aquele que representa força, perseverança e capacidade de recomeçar.</p><div class="criteria"><strong>Ao votar, considere:</strong> a trajetória de superação e o exemplo de coragem transmitido pelo relato, sem procurar identificar seu autor.</div>'+(APP_DEMO?'<p class="demo-note">Prévia da votação de dezembro. Relatos fictícios, sem votos reais.</p>':'')+'<div class="ballot-stories" id="ballot-stories" aria-live="polite">Carregando histórias…</div><button class="abstain '+(state.ballot.superacao===null?'checked':'')+'" id="story-abstain" role="radio" aria-checked="'+(state.ballot.superacao===null)+'"><span class="radio"></span>Prefiro não indicar uma história</button><div class="actions"><button class="text-button" id="story-ballot-back">'+icon('back')+'Voltar</button><button class="primary" id="story-ballot-next" '+(state.ballot.superacao===undefined?'disabled':'')+'>'+(state.edit?'Voltar à revisão':'Próxima categoria')+icon('arrow')+'</button></div><div class="saved-note">Sua escolha só será enviada na confirmação final.</div></section></div>');
      api.bindSide();const current=request;
      document.querySelector('#story-abstain').onclick=()=>{state.ballot.superacao=null;delete state.selected.superacao;state.confirmed=false;ballotStep();};
      document.querySelector('#story-ballot-next').onclick=()=>{if(state.ballot.superacao!==undefined)api.nextStory();};
      document.querySelector('#story-ballot-back').onclick=()=>api.backStory();
      try{const items=await loadStories(false);if(current!==request)return;document.querySelector('#ballot-stories').innerHTML=items.length?items.map(s=>card(s,true)).join(''):'<div class="story-empty"><p>Ainda não há histórias publicadas. Você pode seguir sem indicação nesta categoria.</p></div>';bindReaders(items,true);}catch(error){if(current===request)document.querySelector('#ballot-stories').innerHTML='<p class="error">'+esc(error.message)+'</p>';}
    }
    window.addEventListener('hashchange',()=>{if(state.ready&&!state.storySending)route();});
    return {home:home,route:route,go:go,ballotStep:ballotStep,canVote:canVote};
  }
  return {create:create,examples:examples};
})();
