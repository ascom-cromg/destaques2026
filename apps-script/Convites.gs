/** Códigos nunca são enviados ao navegador nem incluídos em arquivos públicos. */
function inviteRegistry_(){return JSON.parse(PropertiesService.getScriptProperties().getProperty('PREMIACAO_CONVITES')||'{}');}
function inviteDigest_(code){return participantHash_('convite|'+String(code||'').replace(/[\s-]/g,'').toUpperCase());}
function inviteIdentity_(record){return record.email||'convite:'+record.id;}
function conviteSession_(token){
  if(typeof token!=='string'||!/^[a-f0-9-]{72}$/i.test(token))throw new Error('Sua sessão expirou. Entre novamente.');
  var digest=CacheService.getScriptCache().get('premio-convite:'+token),record=digest&&inviteRegistry_()[digest];
  if(!record||record.ativo!==true)throw new Error('Sua sessão expirou. Entre novamente.');
  return inviteIdentity_(record);
}
function entrarComCodigo(payload){
  var lock=LockService.getScriptLock(),locked=false;
  try{
    var owner=String(Session.getEffectiveUser().getEmail()||'').toLowerCase();
    if(owner.split('@')[1]!==PREMIO.domain)throw new Error('A implantação precisa ser feita por uma conta institucional do CRO-MG.');
    if(!lock.tryLock(10000))throw new Error('Há outros acessos neste momento. Tente novamente em alguns segundos.');locked=true;
    // Limite global persistente de tentativas: não depende de IP ou de dados enviados pelo cliente.
    var props=PropertiesService.getScriptProperties(),minute=String(Math.floor(Date.now()/60000));
    var rate=JSON.parse(props.getProperty('PREMIACAO_CONVITES_TENTATIVAS')||'{}');
    if(rate.minute!==minute)rate={minute:minute,count:0};
    if(rate.count>=30)throw new Error('Código: muitas tentativas. Aguarde um minuto e tente novamente.');
    rate.count++;props.setProperty('PREMIACAO_CONVITES_TENTATIVAS',JSON.stringify(rate));
    var code=String(payload&&payload.code||'').replace(/[\s-]/g,'').toUpperCase();
    if(!/^[A-Z0-9]{6,16}$/.test(code))throw new Error('Código: convite inválido ou desativado.');
    var digest=inviteDigest_(code),record=inviteRegistry_()[digest];
    if(!record||record.ativo!==true)throw new Error('Código: convite inválido ou desativado.');
    var token=Utilities.getUuid()+Utilities.getUuid();
    CacheService.getScriptCache().put('premio-convite:'+token,digest,21600);
    lock.releaseLock();locked=false;
    var result=bootstrapElection_({authToken:token});if(result.ok&&result.state==='ready'){result.authToken=token;result.loginMethod='codigo';}return result;
  }catch(error){return {ok:false,message:safeError_(error)};}
  finally{if(locked)lock.releaseLock();}
}
/** Execute pelo menu administrativo; formato código;identificador;email(opcional). */
function importarConvites(){
  assertAdmin_();var ui=SpreadsheetApp.getUi(),answer=ui.prompt('Importar convites individuais','Uma linha por convite: CODIGO;IDENTIFICADOR;EMAIL opcional. O e-mail vincula o convite à mesma participação da conta Google. Não use um código coletivo.',ui.ButtonSet.OK_CANCEL);
  if(answer.getSelectedButton()!==ui.Button.OK)return;
  var lock=LockService.getScriptLock();if(!lock.tryLock(20000))throw new Error('Há outros acessos. Tente novamente.');
  try{var records=inviteRegistry_(),lines=answer.getResponseText().trim().split(/\r?\n/),seen={};
    lines.forEach(function(line){var p=line.split(';'),code=(p[0]||'').replace(/[\s-]/g,'').toUpperCase(),id=String(p[1]||'').trim(),email=String(p[2]||'').trim().toLowerCase();
      if(!/^[A-Z0-9]{6,16}$/.test(code)||!/^[A-Za-z0-9_-]{1,60}$/.test(id)||(email&&!/^[^@\s]+@cromg\.org\.br$/.test(email)))throw new Error('Código: formato inválido. Nenhum convite foi importado.');
      var digest=inviteDigest_(code);if(seen[digest])throw new Error('Código: repetido na importação.');seen[digest]=true;
      if(records[digest]){if(records[digest].id!==id||String(records[digest].email||'')!==email)throw new Error('Código: convite existente não pode mudar de identidade.');return;}
      Object.keys(records).forEach(function(key){if(records[key].id===id)throw new Error('Código: identificador já usado por outro convite.');});
      records[digest]={id:id,email:email,ativo:true};
    });PropertiesService.getScriptProperties().setProperty('PREMIACAO_CONVITES',JSON.stringify(records));ui.alert('Convites importados. Não divulgue os códigos em páginas públicas.');
  }finally{lock.releaseLock();}
}
