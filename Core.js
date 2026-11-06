/* Regras compartilhadas entre a interface e o servidor. */
var PremioCore = (function () {
  'use strict';
  var categories = [
    {id:'superacao',short:'Superação',title:'Além dos Desafios',subtitle:'Uma História de Superação',icon:'sunrise',eyebrow:'CORAGEM QUE INSPIRA',question:'Qual história mais inspirou você?',intro:'Reconheça uma história de coragem, resiliência e determinação, sem identificar seu autor.',criteria:'Considere a trajetória de superação e o exemplo de força e perseverança transmitido pelo relato.',description:'Esta homenagem é destinada ao colaborador cuja trajetória é marcada pela superação de obstáculos significativos, sejam eles pessoais ou profissionais. Busca reconhecer histórias de coragem, resiliência e determinação que demonstram a capacidade de enfrentar adversidades, recomeçar e seguir em frente, tornando-se uma inspiração para as pessoas ao seu redor.',award:'Além dos Desafios — Uma História de Superação.'},
    {id:'destaque',short:'Destaque do ano',title:'Funcionário Destaque',subtitle:'CRO-MG 2026',icon:'star',eyebrow:'EXCELÊNCIA EM CADA ENTREGA',question:'Quem fez a diferença nos resultados?',intro:'É hora de reconhecer o comprometimento e a qualidade do trabalho de quem esteve ao nosso lado.',criteria:'Considere o desempenho ao longo do ano, a qualidade das entregas, a responsabilidade e os resultados alcançados.',description:'Esta homenagem é destinada ao colaborador que mais se destacou ao longo do ano pela qualidade do trabalho realizado, pelo comprometimento com suas responsabilidades, pela iniciativa, pela proatividade e pela contribuição efetiva para os resultados do CRO-MG. Reconhece quem demonstra excelência na execução de suas atividades e contribui diretamente para o cumprimento dos objetivos institucionais.',award:'Funcionário Destaque CRO-MG 2026.'},
    {id:'equipe',short:'Espírito de equipe',title:'Espírito de Equipe',subtitle:'CRO-MG 2026',icon:'people',eyebrow:'JUNTOS, A GENTE VAI ALÉM',question:'Quem faz o time crescer junto?',intro:'Aquela pessoa que ajuda, compartilha e faz a colaboração acontecer merece o seu reconhecimento.',criteria:'Considere a atitude colaborativa, a disponibilidade para apoiar colegas, a integração com a equipe e a contribuição para o trabalho coletivo.',description:'Esta homenagem é destinada ao colaborador que se destaca pela disposição em ajudar, pela cooperação com os colegas, pelo compartilhamento de conhecimentos e pela capacidade de trabalhar em conjunto. Valoriza quem contribui para a integração entre as pessoas e os setores, oferecendo apoio e incentivando um ambiente de trabalho colaborativo, respeitoso e acolhedor. É uma forma de reconhecer não apenas quem entrega resultados, mas quem ajuda os outros a alcançá-los.',award:'Prêmio Espírito de Equipe — CRO-MG 2026.'},
    {id:'alegria',short:'Alegria e alto-astral',title:'A Energia que Contagia',subtitle:'CRO-MG 2026',icon:'smile',eyebrow:'LEVEZA QUE TRANSFORMA O DIA',question:'Quem deixa a rotina mais leve?',intro:'Sabe aquela presença que acolhe com gentileza e espalha bom humor? Este prêmio é para ela.',criteria:'Considere a energia positiva, a espontaneidade, a simpatia e a contribuição para um ambiente de convivência agradável.',description:'Esta homenagem é destinada ao colaborador que se destaca pela alegria, pelo bom humor, pela simpatia e pela capacidade de transmitir entusiasmo nas relações cotidianas. Reconhece aquela pessoa cuja presença contribui para um ambiente mais agradável, que acolhe os colegas com gentileza e ajuda a tornar a rotina de trabalho mais leve, mesmo nos dias mais desafiadores.',award:'A Energia que Contagia — CRO-MG 2026.'},
    {id:'revelacao',short:'Revelação do ano',title:'Talento em Ascensão',subtitle:'CRO-MG 2026',icon:'sprout',eyebrow:'UM COMEÇO QUE JÁ BRILHA',question:'Quem chegou para somar?',intro:'Reconheça quem está começando sua trajetória no CRO-MG e já mostra iniciativa e potencial.',criteria:'Considere o destaque desde a chegada, a iniciativa, a vontade de aprender, a adaptação e o potencial, levando em conta o pouco tempo de instituição.',description:'Esta homenagem é destinada ao colaborador recém-chegado ao CRO-MG que, mesmo com pouco tempo de instituição, vem se destacando pela iniciativa, dedicação, vontade de aprender, facilidade de adaptação e contribuição para a equipe. Reconhece quem está construindo sua trajetória no CRO-MG e já demonstra potencial de crescimento, comprometimento e desenvolvimento profissional.',award:'Talento em Ascensão — CRO-MG 2026.'},
    {id:'regional',short:'Regional destaque',title:'Delegacia Regional Destaque',subtitle:'CRO-MG 2026',icon:'pin',eyebrow:'RECONHECIMENTO POR TODA MINAS',question:'Qual regional merece esse aplauso?',intro:'Celebre a equipe que aproxima o CRO-MG dos profissionais e da comunidade em sua região.',criteria:'Considere o atendimento, o envolvimento nas ações institucionais, a organização, a iniciativa, a proximidade com os profissionais e a contribuição para a Odontologia da região.',description:'Esta homenagem é destinada à Delegacia Regional que mais se destacou ao longo do ano pela qualidade do atendimento aos profissionais da Odontologia, pelo comprometimento com as ações e orientações do CRO-MG, pela participação nas iniciativas institucionais e pela atuação próxima e colaborativa com os inscritos e a comunidade local. Reconhece o trabalho conjunto da equipe da delegacia, considerando sua dedicação, organização, iniciativa e contribuição para fortalecer a presença do CRO-MG nas diferentes regiões de Minas Gerais.',award:'Delegacia Regional de Odontologia do CROMG destaque — CRO-MG 2026.'}
  ];
  function normalize(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim(); }
  function listFor(categoryId,catalog) {
    if(categoryId==='superacao')return (catalog.stories||[]).filter(function(s){return s.active===true&&s.type==='story';});
    if (categoryId==='regional') return catalog.regionals.filter(function(p){return p.active;});
    return catalog.employees.filter(function(p){return p.active && (categoryId!=='revelacao'||!catalog.revelationRestricted||p.revelation);});
  }
  function search(items,query) {
    if(!canSearch(query))return [];
    var tokens=normalize(query).split(' ').filter(Boolean);
    return items.filter(function(p){var hay=normalize(p.name);return tokens.every(function(t){return hay.indexOf(t)>=0;});}).sort(function(a,b){return a.name.localeCompare(b.name,'pt-BR');});
  }
  function canSearch(query){return typeof query==='string' && query.length<=80 && normalize(query).replace(/[^a-z]/g,'').length>=2;}
  function suggestions(categoryId,catalog,query){
    if(!canSearch(query))return {items:[],hasMore:false};
    var matches=search(listFor(categoryId,catalog),query);
    return {items:matches.slice(0,8).map(function(p){if(p.type==='story')return {id:p.id,name:p.name,title:p.title,body:p.body,type:'story'};return {id:p.id,name:p.name,sector:p.sector||'Delegacia Regional',city:p.city,regional:p.regional||p.city};}),hasMore:matches.length>8};
  }
  function validateBallot(ballot,catalog) {
    if(!ballot || typeof ballot!=='object' || Array.isArray(ballot) || Object.keys(ballot).length!==categories.length) throw new Error('Revise as seis categorias antes de enviar.');
    return categories.map(function(c){
      if(!Object.prototype.hasOwnProperty.call(ballot,c.id)) throw new Error('Uma das categorias não foi respondida.');
      var id=ballot[c.id];
      if(id===null) return {category:c,target:null};
      if(typeof id!=='string' || id.length>140) throw new Error('Indicação inválida.');
      var target=listFor(c.id,catalog).find(function(p){return p.id===id;});
      if(!target) throw new Error('Uma indicação não está mais disponível. Volte à categoria e escolha novamente.');
      return {category:c,target:target};
    });
  }
  return {categories:categories,normalize:normalize,listFor:listFor,search:search,canSearch:canSearch,suggestions:suggestions,validateBallot:validateBallot};
})();
if(typeof module!=='undefined' && module.exports) module.exports=PremioCore;
