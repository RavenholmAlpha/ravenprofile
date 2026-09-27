// harness.js - headless verification: runs MV scene code in Node, reports errors, dumps frames as text
const fs=require('fs'),vm=require('vm'),path=require('path');const R=path.join(__dirname,'..');
const el=()=>({style:{},classList:{add(){},remove(){}},getContext:()=>null,addEventListener(){}});
const ctx={console,Math,Date,JSON,String,Number,Array,Object,Uint8Array,Uint16Array,Float32Array,URLSearchParams,
 document:{getElementById:el},addEventListener(){},requestAnimationFrame(){},setTimeout(){},innerWidth:1440,innerHeight:900,devicePixelRatio:1,location:{search:''}};
ctx.window=ctx;vm.createContext(ctx);
for(const f of ['envdata.js','lyrics.js','engine.js','font.js','bg.js','art.js','hud.js','s1.js','s2.js','s3.js','s4.js','s5.js','s6.js'])
 vm.runInContext(fs.readFileSync(path.join(R,f),'utf8'),ctx,{filename:f});
vm.runInContext("var aud={currentTime:0,paused:true},BI=0,KICK=0,BASS=0,AMP=0,LASTB=-9,FR=0,SHAKE=0,FLASH=0;"+
 "function envAt(t){var i=Math.floor(t*60);return i>=0&&i<ENV.B.length?[ENV.B[i]/255,ENV.A[i]/255]:[0,0]}"+
 "function updAudio(t){var e=envAt(t);BASS=e[0];AMP=e[1];while(BI<ENV.beats.length&&ENV.beats[BI]<=t){LASTB=ENV.beats[BI];BI++}KICK=Math.exp(-(t-LASTB)*7)}"+
 "function step(t){FR++;updAudio(t);cls();renderMV(t);bflush();post(t)}"+
 "function dump(){var o=[];for(var y=0;y<H;y++){var s='';for(var x=0;x<W;x++)s+=String.fromCharCode(CC[y*W+x]);o.push(s)}return o.join('\\n')}"+
 "function filled(){var n=0;for(var y=TOP+1;y<BOT;y++)for(var x=0;x<W;x++)if(CC[y*W+x]!==32)n++;return n}",ctx);
const mode=process.argv[2]||'scan';
if(mode==='scan'){const errs={};let empty=[];for(let t=0;t<211.9;t+=1/30){try{vm.runInContext('step('+t+')',ctx);
  if(Math.abs(t-Math.round(t))<0.02){const n=vm.runInContext('filled()',ctx);if(n<15)empty.push(Math.round(t))}}
 catch(e){const k=String(e&&e.stack||e).split('\n').slice(0,2).join(' | ');(errs[k]=errs[k]||[]).push(t.toFixed(2))}}
 for(const k in errs)console.log('ERR x'+errs[k].length+' first@'+errs[k][0]+' last@'+errs[k][errs[k].length-1]+' :: '+k);
 console.log('near-empty seconds:',empty.join(','));console.log('scan done');}
else{for(const t of process.argv.slice(3).map(Number)){for(let u=Math.max(0,t-1);u<t;u+=1/30)vm.runInContext('step('+u+')',ctx);vm.runInContext('step('+t+')',ctx);
 console.log('===== t='+t+' =====');console.log(vm.runInContext('dump()',ctx))}}