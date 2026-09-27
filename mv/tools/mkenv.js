const e=require('./env.json');const fs=require('fs');const {B,A,n,dur}=e;const fps=60;
const mx=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length*0.98)]};
const bM=mx(B),aM=mx(A);
const b=B.map(v=>Math.min(255,Math.round(v/bM*255))),a=A.map(v=>Math.min(255,Math.round(v/aM*255)));
const fl=B.map((v,i)=>i?Math.max(0,v-B[i-1]):0);
const beats=[];let last=-1;
for(let i=2;i<n-2;i++){let s=0,c=0;for(let j=Math.max(0,i-30);j<Math.min(n,i+30);j++){s+=fl[j];c++}const m=s/c;
 if(fl[i]>m*2.2&&fl[i]>=fl[i-1]&&fl[i]>=fl[i+1]&&fl[i]>0.004&&(i-last)>=13){beats.push(+(i/fps).toFixed(3));last=i}}
fs.writeFileSync(__dirname+'/../envdata.js','window.ENV='+JSON.stringify({fps,dur,B:b,A:a,beats})+';');
console.log('beats',beats.length,'first',beats.slice(0,12).join(','));
const per=[];for(let s=0;s<212;s+=15)per.push(s+':'+beats.filter(x=>x>=s&&x<s+15).length);console.log(per.join(' '));