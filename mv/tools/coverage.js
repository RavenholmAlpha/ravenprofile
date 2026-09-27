const fs=require('fs'),vm=require('vm'),path=require('path');const R=path.join(__dirname,'..');
const ctx={window:{},Math};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(R,'lyrics.js'),'utf8'),ctx);
const starts=[];for(const f of ['s1.js','s2.js','s3.js','s4.js','s5.js','s6.js']){const s=fs.readFileSync(path.join(R,f),'utf8');for(const m of s.matchAll(/\bS\(([0-9.]+),/g))starts.push(+m[1])}
starts.sort((a,b)=>a-b);const L=ctx.LYRICS.filter(l=>l.x);
const sceneOf=t=>{let s=null;for(const x of starts)if(t>=x-1e-6)s=x;return s};
const shared={};for(const l of L){const s=sceneOf(l.t);(shared[s]=shared[s]||[]).push(l.x)}
console.log('scenes',starts.length,'lyric lines',L.length);
for(const k in shared)if(shared[k].length>1)console.log('scene@'+k+' covers '+shared[k].length+': '+shared[k].join(' / '));