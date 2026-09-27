// world.execute(me); — TUI MV renderer
var W=110,H=46,SH=' .:-=+*#%@';
var scr=document.getElementById('screen'),aud=document.getElementById('aud');
var L=[0,1,2,3,4,5].map(function(i){return document.getElementById('l'+i)});
var glow=document.getElementById('glow');
function G(){var g=[],y,x;for(y=0;y<H;y++){g.push(new Array(W).fill(' '))}return g}
function put(g,x,y,s,op){if(y<0||y>=H)return;for(var i=0;i<s.length;i++){var c=s[i];
  if(!op&&c===' ')continue;var X=x+i;if(X<0||X>=W)continue;g[y][X]=c}}
function box(g,x,y,w,h,ti){var t='+'+'-'.repeat(w-2)+'+';put(g,x,y,t,1);put(g,x,y+h-1,t,1);
  for(var j=1;j<h-1;j++){put(g,x,y+j,'|',1);put(g,x+w-1,y+j,'|',1)}
  if(ti)put(g,x+2,y,'['+ti+']',1)}
function join(g){var o='',y;for(y=0;y<H;y++){o+=g[y].join('');if(y<H-1)o+='\n'}return o}
function R(a,b){return a+Math.random()*(b-a)}
function pick(s){return s[(Math.random()*s.length)|0]}
// ---- timeline ----
var TL=[[0,'log'],[16,'cube'],[29.28,'sine'],[44.04,'polar'],[58.65,'rings'],
[73,'matrix'],[88,'cube'],[105.33,'rings'],[110.02,'sine'],[113.53,'matrix'],
[128.34,'frag'],[134.38,'log'],[147,'exec'],[167,'rings'],[186,'polar'],[200,'final']];
function sceneAt(t){var n='log';for(var i=0;i<TL.length;i++){if(t>=TL[i][0])n=TL[i][1]}return n}
var SC={};
// ---- lyrics ----
var LY=window.LYRICS||[];
function curLy(t){for(var i=0;i<LY.length;i++){if(t>=LY[i].t&&t<LY[i].e)return LY[i]}return null}
function nextLy(t){for(var i=0;i<LY.length;i++){if(LY[i].t>t&&LY[i].x)return LY[i]}return null}
// ---- state ----
var T=0,F=0,beat=0,shk=0,glitch=0,started=false;
var INFO='',INFO2='';
function frame(){
  requestAnimationFrame(frame);
  if(!started)return;
  T=aud.currentTime;F++;
  var lay=[G(),G(),G(),G(),G(),G()];
  INFO='';INFO2='';
  var f=SC[sceneAt(T)];if(f)f(lay,T);
  for(var li=0;li<6;li++){lay[li][1]=new Array(W).fill(' ');lay[li][2]=new Array(W).fill(' ')}
  hud(lay,T);lyrics(lay,T);
  if(glitch>0){glitchPass(lay);glitch-=0.06}
  for(var i=0;i<6;i++)L[i].textContent=join(lay[i]);
  glow.style.opacity=String(Math.max(0,beat*0.10));
  beat*=0.86;
  if(shk>0){scr.classList.add('shake');shk-=0.05}else scr.classList.remove('shake');
}
function pulse(a){beat=a||1}
function glitchPass(lay){var n=(3+Math.random()*7)|0;
  for(var k=0;k<n;k++){var y=1+((Math.random()*(H-2))|0),off=((Math.random()*14)|0)-7;
    var row=lay[0][y];var r2=new Array(W).fill(' ');
    for(var x=0;x<W;x++){var sx=x+off;if(sx>=0&&sx<W)r2[x]=row[sx]}lay[0][y]=r2;
    if(Math.random()<0.5)put(lay[5],(Math.random()*(W-10))|0,y,pick(['ERR','0x1F','NULL','SIGSEGV','##']))}}
// ---- fit ----
function fit(){var fs=Math.min(window.innerWidth/(W*0.60),window.innerHeight/(H*1.02));
  scr.style.fontSize=fs.toFixed(2)+'px';
  scr.style.width=(W*fs*0.6)+'px';scr.style.height=(H*fs)+'px'}
window.addEventListener('resize',fit);fit();
// cursor auto-hide: only while playing, and only after 2s of no mouse movement
var curT=0;
function wake(){curT=Date.now();document.body.classList.remove('hidecur')}
window.addEventListener('mousemove',wake);
window.addEventListener('mousedown',wake);
setInterval(function(){
  if(started&&!aud.paused&&Date.now()-curT>2000)document.body.classList.add('hidecur')
},500);
document.getElementById('go').onclick=function(){
  document.getElementById('boot').style.display='none';
  aud.play();started=true};
requestAnimationFrame(frame);
