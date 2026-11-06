/* Calendário e validações da dinâmica de histórias. Datas em Brasília. */
var StoryCore=(function(){
  'use strict';
  var deadline=Date.parse('2026-12-01T00:00:00-03:00');
  var earliestVote=deadline;
  function submissionOpen(now,status){return Number(now)<deadline && String(status||'ABERTO')==='ABERTO';}
  function votingDate(now){return Number(now)>=earliestVote;}
  function validate(payload){
    if(!payload||typeof payload!=='object'||payload.consent!==true)throw new Error('História: autorize a publicação anônima para continuar.');
    var title=String(payload.title||'').trim(),body=String(payload.body||'').trim();
    if(title.length<5||title.length>100)throw new Error('História: o título deve ter de 5 a 100 caracteres.');
    if(body.length<200||body.length>5000)throw new Error('História: escreva um relato de 200 a 5.000 caracteres.');
    if(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(title+' '+body)||/https?:\/\/|www\./i.test(title+' '+body)||/\b(?:\+?55\s*)?(?:\(?\d{2}\)?[\s.-]*)?9?\d{4}[\s.-]*\d{4}\b/.test(title+' '+body))throw new Error('História: retire e-mails, telefones e links do relato para preservar a privacidade.');
    if(!/^H-[A-F0-9]{12}$/.test(payload.id||''))throw new Error('História: código público inválido. Recarregue a página.');
    if(!/^[A-Za-z0-9_-]{40,100}$/.test(payload.authorKey||''))throw new Error('História: código de autoria inválido. Recarregue a página.');
    return {id:payload.id,title:title,body:body};
  }
  function publicStory(row){
    if(!row||row[4]!=='PUBLICADA')return null;
    var id=String(row[0]||''),title=String(row[1]||''),body=String(row[3]||'');
    if(!/^H-[A-F0-9]{12}$/.test(id)||!title||!body)return null;
    return {id:id,name:title,title:title,body:body,type:'story',active:true};
  }
  return {deadline:deadline,earliestVote:earliestVote,submissionOpen:submissionOpen,votingDate:votingDate,validate:validate,publicStory:publicStory};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=StoryCore;
