/** Autoria restrita à organização; somente texto revisado e código são públicos. */
var HISTORIAS={sheet:'Histórias 2026',control:'Participação histórias 2026'};
function storyRows_(book){return sheet_(book,HISTORIAS.sheet).getDataRange().getValues().slice(1);}
function publishedStories_(book){return storyRows_(book).map(StoryCore.publicStory).filter(function(s){return !!s;}).sort(function(a,b){return a.id.localeCompare(b.id);});}
function storyParticipantHash_(email){return participantHash_('historia|'+email);}
function hasStory_(book,hash){return sheet_(book,HISTORIAS.control).getDataRange().getValues().slice(1).some(function(r){return String(r[0])===hash;});}
function checkStorySession_(payload,email){
  if(!payload||typeof payload.nonce!=='string'||payload.nonce.length>100||CacheService.getScriptCache().get('premio-nonce:'+payload.nonce)!==participantHash_(email))throw new Error('Sua sessão expirou. Recarregue a página para continuar.');
}
function storyProof_(id,key){
  var secret=PropertiesService.getScriptProperties().getProperty('PREMIACAO_HMAC_KEY');
  if(!secret)throw new Error('A organização ainda precisa concluir a configuração de privacidade.');
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature('autoria|'+id+'|'+key,secret)).replace(/=+$/,'');
}
function bootstrapElection_(payload){
  try{
    var email=authenticate_(payload),book=book_(),hash=participantHash_(email),settings=settings_(book),catalog=catalog_(book),now=Date.now();
    var voted=hasVoted_(book,hash),sent=hasStory_(book,storyParticipantHash_(email));
    var nonce=Utilities.getUuid()+Utilities.getUuid();CacheService.getScriptCache().put('premio-nonce:'+nonce,hash,1800);
    var open=StoryCore.submissionOpen(now,settings.HISTORIAS_STATUS)&&yes_(settings.HISTORIAS_PRIVACIDADE_REVISADA);
    return {ok:true,state:'ready',nonce:nonce,election:{submissionOpen:open,votingOpen:ready_(settings,catalog),alreadyVoted:voted,alreadySubmitted:sent,deadline:'30/11/2026 às 23h59',phase:settings.STATUS==='ENCERRADA'?'closed':open?'collecting':ready_(settings,catalog)?'voting':'awaiting_vote'}};
  }catch(error){if(String(error.message||'').indexOf('Acesso restrito')===0)return {ok:true,state:'login'};return {ok:false,message:safeError_(error)};}
}
function listarHistorias(payload){
  try{var email=authenticate_(payload);checkStorySession_(payload,email);return {ok:true,items:publishedStories_(book_())};}
  catch(error){return {ok:false,message:safeError_(error)};}
}
function enviarHistoria(payload){
  var lock=LockService.getScriptLock(),locked=false;
  try{
    var email=authenticate_(payload);checkStorySession_(payload,email);
    var story=StoryCore.validate(payload),hash=storyParticipantHash_(email);
    if(!lock.tryLock(20000))throw new Error('Há outros envios neste momento. Tente novamente em alguns segundos.');
    locked=true;var book=book_(),rows=storyRows_(book),existing=rows.find(function(r){return r[0]===story.id;});
    if(hasStory_(book,hash)){
      // Resposta perdida: a chave conservada no navegador comprova um envio já concluído.
      if(existing&&existing[5]===storyProof_(story.id,payload.authorKey))return {ok:true,state:'submitted',id:story.id};
      return {ok:true,state:'already_submitted'};
    }
    var settings=settings_(book);
    if(!yes_(settings.HISTORIAS_PRIVACIDADE_REVISADA))throw new Error('A organização ainda está concluindo a preparação para receber relatos com privacidade.');
    if(!StoryCore.submissionOpen(Date.now(),settings.HISTORIAS_STATUS))throw new Error('História: o recebimento está fechado. O prazo final é 30/11/2026, às 23h59, horário de Brasília.');
    if(existing)throw new Error('História: este código já existe. Recarregue a página e tente novamente.');
    var texts=sheet_(book,HISTORIAS.sheet),control=sheet_(book,HISTORIAS.control);
    var storyValues=[story.id,story.title,story.body,story.body,'PENDENTE',storyProof_(story.id,payload.authorKey),email];
    var requests=[
      {appendCells:{sheetId:texts.getSheetId(),rows:[{values:storyValues.map(cell_)}],fields:'userEnteredValue'}},
      {appendCells:{sheetId:control.getSheetId(),rows:[{values:[cell_(hash),cell_(true)]}],fields:'userEnteredValue'}},
      // A autoria fica na coluna restrita; a galeria usa uma lista explícita de campos públicos.
      {sortRange:{range:{sheetId:texts.getSheetId(),startRowIndex:1,endRowIndex:Math.max(texts.getLastRow()+1,2),startColumnIndex:0,endColumnIndex:7},sortSpecs:[{dimensionIndex:0,sortOrder:'ASCENDING'}]}},
      {sortRange:{range:{sheetId:control.getSheetId(),startRowIndex:1,endRowIndex:Math.max(control.getLastRow()+1,2),startColumnIndex:0,endColumnIndex:2},sortSpecs:[{dimensionIndex:0,sortOrder:'ASCENDING'}]}}
    ];
    Sheets.Spreadsheets.batchUpdate({requests:requests},PREMIO.spreadsheetId);
    return {ok:true,state:'submitted',id:story.id};
  }catch(error){return {ok:false,message:safeError_(error)};}
  finally{if(locked)lock.releaseLock();}
}
function prepararHistorias_(book){
  var definitions={};definitions[HISTORIAS.sheet]=['Código público','Título','Relato original (restrito)','Relato para publicação','Status','Verificador de autoria (restrito)','Autor: e-mail ou convite (restrito)'];definitions[HISTORIAS.control]=['Código de participação (HMAC)','Enviou'];
  Object.keys(definitions).forEach(function(name){var s=book.getSheetByName(name);if(!s)s=book.insertSheet(name);if(!s.getLastRow()){s.getRange(1,1,1,definitions[name].length).setValues([definitions[name]]);s.setFrozenRows(1);s.getRange(1,1,1,definitions[name].length).setFontWeight('bold');s.getDataRange().setWrap(true);s.setColumnWidths(1,definitions[name].length,220);}});
  sheet_(book,HISTORIAS.sheet).getRange(1,7).setValue('Autor: e-mail ou convite (restrito)');
  sheet_(book,HISTORIAS.control).hideSheet();
  var config=sheet_(book,PREMIO.settings),keys=config.getDataRange().getValues().map(function(r){return r[0];});
  if(keys.indexOf('HISTORIAS_STATUS')<0)config.getRange(config.getLastRow()+1,1,1,3).setValues([['HISTORIAS_STATUS','ABERTO','Recebimento até 30/11/2026, às 23h59. Use ENCERRADO para antecipar o encerramento.']]);
  if(keys.indexOf('HISTORIAS_PRIVACIDADE_REVISADA')<0)config.getRange(config.getLastRow()+1,1,1,3).setValues([['HISTORIAS_PRIVACIDADE_REVISADA','NÃO','Antes de marcar SIM, restrinja a planilha e o editor do script somente à organização da premiação. Não deixe acesso por link, domínio ou público ao conteúdo original.']]);
}
/** Menu administrativo: a organização confere a chave que o autor apresentar voluntariamente. */
function verificarAutoriaHistoria(){
  assertAdmin_();var ui=SpreadsheetApp.getUi();
  var code=ui.prompt('Autoria da história','Informe o código público H-…',ui.ButtonSet.OK_CANCEL);if(code.getSelectedButton()!==ui.Button.OK)return;
  var secret=ui.prompt('Código de autoria','Informe a chave reservada apresentada pelo autor.',ui.ButtonSet.OK_CANCEL);if(secret.getSelectedButton()!==ui.Button.OK)return;
  var id=code.getResponseText().trim().toUpperCase(),key=secret.getResponseText().trim();
  var row=storyRows_(book_()).find(function(r){return r[0]===id;});
  ui.alert(row&&row[5]===storyProof_(id,key)?'Autoria comprovada pelo código reservado.':'Código de autoria não confere.');
}

