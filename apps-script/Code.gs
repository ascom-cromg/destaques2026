/** Destaques CRO-MG 2026. Autoria e participação restritas; votos somente em totais agregados. */
var PREMIO = Object.freeze({
  spreadsheetId:PropertiesService.getScriptProperties().getProperty('PREMIACAO_SPREADSHEET_ID'),
  domain:'cromg.org.br',year:'2026',
  people:'Colaboradores 2026',regionals:'Regionais 2026',
  results:'Apuração 2026',control:'Controle 2026',settings:'Configuração 2026'
});

function doGet(e) {
  var view=HtmlService.createTemplateFromFile('Index');view.authBase=ScriptApp.getService().getUrl();
  view.votingMode=!!(e&&e.parameter&&e.parameter.etapa==='votacao');
  return view.evaluate()
    .setTitle('Destaques CRO-MG 2026')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}

function authenticate_(payload) {
  var owner=String(Session.getEffectiveUser().getEmail()||'').trim().toLowerCase();
  var email=String(Session.getActiveUser().getEmail()||'').trim().toLowerCase();
  if(!owner || owner.split('@').length!==2 || owner.split('@')[1]!==PREMIO.domain)
    throw new Error('A implantação precisa ser feita por uma conta institucional do CRO-MG.');
  if(payload&&payload.authToken)return conviteSession_(payload.authToken);
  if(!email || email.split('@').length!==2 || email.split('@')[1]!==PREMIO.domain)
    throw new Error('Acesso restrito. Abra este link usando sua conta Google @cromg.org.br. Se já estiver conectado, confirme a conta selecionada no Google.');
  return email;
}
function assertAdmin_() {
  if(authenticate_()!==String(Session.getEffectiveUser().getEmail()).toLowerCase())
    throw new Error('Esta ação é exclusiva da conta responsável pela implantação.');
}
function book_(){return SpreadsheetApp.openById(PREMIO.spreadsheetId);}
function sheet_(book,name){var s=book.getSheetByName(name);if(!s)throw new Error('A organização ainda está preparando a votação.');return s;}
function yes_(value){return value===true || ['SIM','TRUE','VERDADEIRO'].indexOf(String(value).trim().toUpperCase())>=0;}
function settings_(book){
  var result={}; sheet_(book,PREMIO.settings).getDataRange().getValues().slice(1).forEach(function(r){if(r[0])result[String(r[0])]=r[1];});return result;
}
function catalog_(book){
  var employees=sheet_(book,PREMIO.people).getDataRange().getValues().slice(1).filter(function(r){return r[0]&&r[1];}).map(function(r){return {id:String(r[0]),name:String(r[1]),sector:String(r[2]),city:String(r[3]),regional:String(r[4]),role:String(r[5]),active:yes_(r[6]),revelation:yes_(r[7])};});
  var regionals=sheet_(book,PREMIO.regionals).getDataRange().getValues().slice(1).filter(function(r){return r[0]&&r[1];}).map(function(r){return {id:String(r[0]),city:String(r[1]),name:'Delegacia Regional de '+String(r[1]),active:yes_(r[2])};});
  var ids={}; employees.concat(regionals).forEach(function(p){if(ids[p.id])throw new Error('O cadastro contém IDs repetidos. A organização precisa revisar a planilha.');ids[p.id]=true;});
  return {employees:employees,regionals:regionals,stories:publishedStories_(book),revelationRestricted:yes_(settings_(book).REVELACAO_VALIDADA)};
}
function ready_(settings,catalog){
  return StoryCore.votingDate(Date.now()) && settings.STATUS==='ABERTA' && yes_(settings.CADASTRO_VALIDADO) && catalog.employees.some(function(p){return p.active;}) && (!catalog.revelationRestricted||catalog.employees.some(function(p){return p.active&&p.revelation;})) && catalog.regionals.some(function(r){return r.active;});
}
function participantHash_(email){
  var key=PropertiesService.getScriptProperties().getProperty('PREMIACAO_HMAC_KEY');
  if(!key) throw new Error('A organização ainda precisa concluir a configuração de privacidade.');
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(PREMIO.year+'|'+email,key)).replace(/=+$/,'');
}
function hasVoted_(book,hash){
  return sheet_(book,PREMIO.control).getDataRange().getValues().slice(1).some(function(r){return String(r[0])===hash;});
}
function getBootstrap(payload){
  return bootstrapElection_(payload);
}
function buscarIndicacoes(payload){
  try {
    var email=authenticate_(payload),hash=participantHash_(email);
    if(!payload || typeof payload.nonce!=='string' || payload.nonce.length>100 || CacheService.getScriptCache().get('premio-nonce:'+payload.nonce)!==hash)
      throw new Error('Sua sessão expirou. Recarregue a página para continuar.');
    if(!PremioCore.categories.some(function(c){return c.id===payload.category;}))throw new Error('Indicação inválida.');
    if(!PremioCore.canSearch(payload.query))return {ok:true,items:[],hasMore:false};
    var book=book_();
    if(hasVoted_(book,hash))throw new Error('A votação desta conta já foi concluída.');
    var catalog=catalog_(book),settings=settings_(book);
    if(!ready_(settings,catalog))throw new Error('A votação não está aberta para novas consultas.');
    var result=PremioCore.suggestions(payload.category,catalog,payload.query);
    return {ok:true,items:result.items,hasMore:result.hasMore};
  }catch(error){return {ok:false,message:safeError_(error)};}
}
function enviarVotos(payload){
  var lock=LockService.getScriptLock(),locked=false;
  try {
    var email=authenticate_(payload),hash=participantHash_(email);
    if(!lock.tryLock(20000))throw new Error('Há outros envios neste momento. Aguarde alguns segundos e tente novamente.');
    locked=true;
    var book=book_();
    // Verificação sob o mesmo lock que protege os totais, incluindo abas e duplo clique.
    if(hasVoted_(book,hash))return {ok:true,state:'already_voted'};
    if(!payload || typeof payload.nonce!=='string' || payload.nonce.length>100 || CacheService.getScriptCache().get('premio-nonce:'+payload.nonce)!==hash)
      throw new Error('Sua sessão expirou. Recarregue a página e refaça suas indicações. Nenhum novo voto foi registrado por esta tentativa.');
    var catalog=catalog_(book),settings=settings_(book);
    if(!ready_(settings,catalog))throw new Error('A votação não está aberta para novos envios.');
    var choices=PremioCore.validateBallot(payload.ballot,catalog);
    var tally=sheet_(book,PREMIO.results),control=sheet_(book,PREMIO.control);
    var rows=tally.getDataRange().getValues(),index={};
    rows.slice(1).forEach(function(r,i){if(!r[0])return;var key=r[0]+'|'+r[2];if(index[key])throw new Error('A apuração precisa de revisão pela organização.');index[key]={row:i+1,count:Number(r[6])};});
    var requests=[],newRows=[];
    choices.forEach(function(item){
      var c=item.category,p=item.target,id=p?p.id:'SEM_INDICACAO',key=c.id+'|'+id,existing=index[key];
      if(existing){
        if(!Number.isInteger(existing.count)||existing.count<0)throw new Error('A apuração precisa de revisão pela organização.');
        requests.push({updateCells:{start:{sheetId:tally.getSheetId(),rowIndex:existing.row,columnIndex:6},rows:[{values:[{userEnteredValue:{numberValue:existing.count+1}}]}],fields:'userEnteredValue'}});
      }else{
        var values=[c.id,c.award,id,p?p.name:'Sem indicação',p?(p.sector||'Delegacia Regional'):'',p?p.city:'',1];
        newRows.push({values:values.map(cell_)});
      }
    });
    if(newRows.length)requests.push({appendCells:{sheetId:tally.getSheetId(),rows:newRows,fields:'userEnteredValue'}});
    // Lista de participantes separada dos totais, sem referência a escolhas ou horários.
    requests.push({appendCells:{sheetId:control.getSheetId(),rows:[{values:[cell_(hash),cell_(true),cell_(email)]}],fields:'userEnteredValue'}});
    // Um único batch atômico: totais e bloqueio de duplicidade são gravados juntos.
    Sheets.Spreadsheets.batchUpdate({requests:requests},PREMIO.spreadsheetId);
    CacheService.getScriptCache().remove('premio-nonce:'+payload.nonce);
    return {ok:true,state:'submitted'};
  }catch(error){return {ok:false,message:safeError_(error)};}
  finally{if(locked)lock.releaseLock();}
}
function cell_(value){return {userEnteredValue:typeof value==='number'?{numberValue:value}:typeof value==='boolean'?{boolValue:value}:{stringValue:String(value)}};}
function safeError_(error){
  var message=String(error&&error.message||'');
  // Não transmitir erros de provedores, dados de requisição ou stack traces ao navegador.
  var allowed=['A implantação','Acesso restrito','Esta ação','A organização','O cadastro','Há outros','Sua sessão','A votação','Revise as seis','Uma das categorias','Indicação inválida','Uma indicação','A apuração','História:','Código:'];
  return allowed.some(function(prefix){return message.indexOf(prefix)===0;})?message:'Não foi possível confirmar o envio. Tente novamente. Se o envio anterior foi concluído, o sistema impedirá uma duplicidade.';
}

/** Execute uma vez no editor, com a conta @cromg.org.br responsável. Não apaga dados. */
function prepararPremiacao(){
  assertAdmin_();var book=book_();
  var schemas={};
  schemas[PREMIO.people]=[['ID','Nome','Setor','Cidade','Regional','Cargo no PDF','Ativo','Revelação','Observações']].concat(CADASTRO_INICIAL.employees.map(function(p){return [p.id,p.name,p.sector,p.city,p.regional,p.role,'SIM','NÃO',p.note];}));
  schemas[PREMIO.regionals]=[['ID','Cidade','Ativa']].concat(CADASTRO_INICIAL.regionals.map(function(p){return [p.id,p.city,'SIM'];}));
  schemas[PREMIO.results]=[['Categoria ID','Homenagem','Indicado ID','Nome / Delegacia','Setor','Cidade','Votos']];
  schemas[PREMIO.control]=[['Código de participação (HMAC)','Participou','Participante: e-mail ou convite (restrito)']];
  schemas[PREMIO.settings]=[['Chave','Valor','Orientação'],['STATUS','PREPARAÇÃO','Use o menu da premiação para abrir ou encerrar.'],['CADASTRO_VALIDADO','NÃO','Revise nomes completos, setores, lotações e vínculos. Marque SIM após conferir.'],['REVELACAO_VALIDADA','NÃO','Opcional: SIM restringe Revelação aos nomes marcados nessa coluna. NÃO permite buscar todos, seguindo o critério de recém-chegados.'],['FONTE_CADASTRO',CADASTRO_INICIAL.source,'Cidades da sede atribuídas a Belo Horizonte; confirmar lotação.']];
  Object.keys(schemas).forEach(function(name){var sheet=book.getSheetByName(name);if(!sheet)sheet=book.insertSheet(name);if(sheet.getLastRow()===0){var values=schemas[name];sheet.getRange(1,1,values.length,values[0].length).setValues(values);sheet.setFrozenRows(1);sheet.getRange(1,1,1,values[0].length).setFontWeight('bold').setBackground('#eeeeee');sheet.getDataRange().setWrap(true);sheet.setColumnWidths(1,values[0].length,190);}});
  sheet_(book,PREMIO.control).getRange(1,3).setValue('Participante: e-mail ou convite (restrito)');
  sheet_(book,PREMIO.control).hideSheet();
  var properties=PropertiesService.getScriptProperties();
  if(!properties.getProperty('PREMIACAO_HMAC_KEY')){
    if(sheet_(book,PREMIO.control).getLastRow()>1)throw new Error('A organização precisa restaurar a chave original; já existem participações.');
    properties.setProperty('PREMIACAO_HMAC_KEY',Utilities.getUuid()+Utilities.getUuid());
  }
  prepararHistorias_(book);
  return 'Estrutura preparada. Revise o cadastro antes de abrir. O filtro de Revelação é opcional.';
}
function onOpen(){SpreadsheetApp.getUi().createMenu('Destaques 2026').addItem('Preparar estrutura','prepararPremiacao').addItem('Importar convites','importarConvites').addItem('Verificar autoria de história','verificarAutoriaHistoria').addItem('Abrir votação','abrirVotacao').addItem('Encerrar votação','encerrarVotacao').addToUi();}
function abrirVotacao(){
  assertAdmin_();if(!StoryCore.votingDate(Date.now()))throw new Error('A votação só pode ser aberta a partir de dezembro de 2026.');var book=book_(),s=settings_(book),catalog=catalog_(book);
  s.STATUS='ABERTA';if(!ready_(s,catalog))throw new Error('A organização precisa validar o cadastro. Se o filtro de Revelação estiver ativo, marque os elegíveis.');
  if(!PropertiesService.getScriptProperties().getProperty('PREMIACAO_HMAC_KEY'))throw new Error('A organização precisa executar prepararPremiacao primeiro.');
  setStatus_('ABERTA');
}
function encerrarVotacao(){assertAdmin_();setStatus_('ENCERRADA');}
function setStatus_(status){var s=sheet_(book_(),PREMIO.settings),rows=s.getDataRange().getValues();for(var i=1;i<rows.length;i++)if(rows[i][0]==='STATUS'){s.getRange(i+1,2).setValue(status);return;}throw new Error('A organização precisa configurar o status.');}


