import fs from 'node:fs';
const root=new URL('.',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const template=read('index.template.html');
const css=read('app.css')+'\n'+read('stories.css'),core=read('Core.js'),storyCore=read('StoryCore.js'),storyUI=read('stories-ui.js'),js=read('app.js'),data=JSON.parse(read('data/cadastro.json'));
const logo='data:image/webp;base64,'+fs.readFileSync(new URL('assets/logo-destaques-2026.webp',root)).toString('base64');
const render=(demo,pages=false)=>template.replaceAll('__AWARD_LOGO__',logo).replace('__APP_CSS__',()=>css).replace('__PAGES_MODE__',()=>String(pages)).replace('__PAGES_CONFIG__',()=>pages?'<script src="config.js"></script>':'').replace('__DEMO_MODE__',()=>String(demo)).replace('__DEMO_ROSTER__',()=>demo?JSON.stringify(data).replace(/</g,'\\u003c'):'null').replace('__CORE_JS__',()=>core).replace('__STORY_CORE__',()=>storyCore).replace('__STORY_UI__',()=>storyUI).replace('__APP_JS__',()=>js).replaceAll('__AWARD_LOGO__',logo);
fs.mkdirSync(new URL('dist',root),{recursive:true});
fs.writeFileSync(new URL('dist/index.html',root),render(false,true));
fs.writeFileSync(new URL('apps-script/Index.html',root),render(false));
fs.writeFileSync(new URL('apps-script/Core.gs',root),core.replace(/if\(typeof module[\s\S]*$/,''));
fs.writeFileSync(new URL('apps-script/StoryCore.gs',root),storyCore.replace(/if\(typeof module[\s\S]*$/,''));
fs.copyFileSync(new URL('config.js',root),new URL('dist/config.js',root));
fs.writeFileSync(new URL('dist/.nojekyll',root),'');
console.log('Página GitHub e formulário institucional gerados.');


for(const file of ['mural.html','mural.css','mural.js','app.css','data/historias-publicadas.json','assets/logo-destaques-2026.webp']){fs.mkdirSync(new URL(file.includes('/')?'dist/'+file.slice(0,file.lastIndexOf('/')):'dist',root),{recursive:true});fs.copyFileSync(new URL(file,root),new URL('dist/'+file,root));}
