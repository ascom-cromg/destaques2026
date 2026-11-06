const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../mural.js'),'utf8');
const fn=source.slice(source.indexOf('function publicItems('),source.indexOf('\nfunction state('));
const validate=vm.runInNewContext('('+fn+')');
const valid={id:'H-012345ABCDEF',title:'Coragem para recomeçar',body:'Uma história revisada.',status:'PUBLICADA',email:'privado@example.test',original:'original privado',authorKey:'segredo'};
const output=validate({items:[valid,{...valid,id:'H-000000000001',status:'PENDENTE'},{...valid,id:'H-000000000002',status:'REJEITADA'},valid,{...valid,id:'inválido'},{...valid,id:'H-000000000003',body:'x'.repeat(5001)}]});
assert.equal(output.length,1);assert.deepEqual(Object.keys(output[0]).sort(),['body','id','title']);assert(!JSON.stringify(output).includes('privado'));assert(!JSON.stringify(output).includes('segredo'));assert.throws(()=>validate({items:'errado'}));
const feed=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../data/historias-publicadas.json'),'utf8'));
for(const item of feed.items){assert.equal(item.status,'PUBLICADA');assert.deepEqual(Object.keys(item).sort(),['body','id','status','title']);}
console.log('OK mural: whitelist pública, estados não aprovados, duplicados, limites e arquivo publicado');
