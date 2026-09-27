const e=require('./env.json');const {B,A,n,dur}=e;
const fps=n/dur;
// onset flux on bass
const fl=B.map((v,i)=>i?Math.max(0,v-B[i-1]):0);
let best=[0,0];for(let bpm=70;bpm<=190;bpm+=0.5){const lag=60/bpm*fps;let s=0;for(let i=0;i+lag<n;i++){s+=fl[i]*fl[Math.round(i+lag)]}if(s>best[1])best=[bpm,s]}
console.log('dur',dur.toFixed(2),'fps',fps.toFixed(2),'bpm',best[0]);
const sec=[];for(let s=0;s<Math.ceil(dur);s+=4){let a=0,b=0,c=0;for(let i=Math.floor(s*fps);i<Math.min(n,(s+4)*fps);i++){a+=A[i];b+=B[i];c++}sec.push(s+':'+(a/c).toFixed(3)+'/'+(b/c).toFixed(3))}
console.log(sec.join('  '));
// phase: find offset maximizing flux on beat grid
const bpm=best[0],per=60/bpm;let bo=[0,0];for(let o=0;o<per;o+=0.005){let s=0;for(let t=o+30;t<120;t+=per){s+=fl[Math.round(t*fps)]||0}if(s>bo[1])bo=[o,s]}
console.log('phase',bo[0].toFixed(3));