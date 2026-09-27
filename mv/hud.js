// hud.js - terminal chrome: title bar, stdout console with lyric prompt, spectrum, post glitch
var LY=window.LYRICS||[];
function cueAt(t){for(var i=LY.length-1;i>=0;i--)if(t>=LY[i].t)return i;return -1}
function nextCue(i){for(var j=i+1;j<LY.length;j++)if(LY[j].x)return LY[j];return null}
function fmt(t){t=Math.max(0,t);var m=Math.floor(t/60),s=t-m*60;return pad(m,2)+':'+(s<10?'0':'')+s.toFixed(2)}
function bar(p,w,a,b){var n=Math.round(clamp(p,0,1)*w);return (a||'█').repeat(n)+(b||'░').repeat(w-n)}
var SPK='▁▂▃▄▅▆▇█',HUDC=3;
function hud(t,ci){var cu=ci>=0?LY[ci]:null;
 fill(0,0,W,1,32,9,13);txt(1,0,'●',6,13);txt(3,0,'●',7,13);txt(5,0,'●',3,13);
 txt(8,0,'mili@simulation: ~/world $ ./world.execute(me);',9,13);
 var cpu=Math.round(clamp(12+AMP*70+KICK*18,0,99));
 txt(W-52,0,'CPU ['+bar(cpu/100,12,'|','.')+'] '+pad(cpu,2,' ')+'%',cpu>80?6:HUDC,13);
 var tc=fmt(t)+' / '+fmt(ENV.dur);txt(W-tc.length-2,0,tc,4,13);
 box(0,BOT,W,H-BOT,1,'stdout','s',0);
 var lt=cu?t-cu.t:0,s=cu&&cu.x?cu.x:'';
 txt(2,BOT+1,'root@world:~# ',HUDC);var sh=tw(s,lt,40);txt(16,BOT+1,sh,8);
 if(FR>>4&1)set(16+sh.length,BOT+1,0x2588,HUDC);
 var nx=nextCue(ci);if(nx)txt(2,BOT+2,'  queued> '+nx.x.toLowerCase(),1);
 // progress + stats
 var p=t/ENV.dur;txt(2,BOT+3,'exec ['+bar(p,40,'=','-')+'] '+pad(Math.floor(p*100),3,' ')+'%',2);
 txt(2,BOT+4,'pid 0x4D494C49  bpm 126.5  beat#'+pad(BI,4)+'  line '+pad(Math.max(0,ci),2)+'/'+LY.length,9);
 // spectrum (pseudo bands from bass/amp envelope)
 var sx=66,sw=W-sx-2;
 for(var i=0;i<sw;i++){var fq=i/sw,v=clamp((BASS*(1-fq)*1.2+AMP*(0.35+0.6*hash(i*3.7+Math.floor(t*14))*fq))*(0.7+KICK*0.5),0,1);
  var hgt=v*4;for(var r=0;r<4;r++){var lv=clamp(hgt-(3-r),0,1);if(lv<=0)continue;
   set(sx+i,BOT+1+r,SPK.charCodeAt(Math.min(7,Math.floor(lv*7.99))),r<1?5:r<2?4:HUDC)}}}
var GLITCH=0;
function post(t){var g=GLITCH;GLITCH=0;if(g<=0.02)return;var s=Math.floor(t*24);
 var n=Math.ceil(g*10);for(var k=0;k<n;k++){var y=TOP+Math.floor(hash(s*13.1+k)*(BOT-TOP)),hh=1+Math.floor(hash(k*5+s)*3),
  off=Math.round((hash(s*7.7+k*3)-.5)*36*g),tint=hash(k+s*.3)<.35;
  for(var yy=y;yy<Math.min(BOT,y+hh);yy++){var o=yy*W,rc=CC.slice(o,o+W),rf=CF.slice(o,o+W);
   for(var x=0;x<W;x++){var sx=(x-off+W*4)%W;CC[o+x]=rc[sx];CF[o+x]=tint&&rc[sx]!==32?5:rf[sx]}}}
 for(var k=0;k<g*70;k++){var i=W+Math.floor(hash(s*3.3+k*1.7)*(BOT-1)*W);CC[i]=gch(k+s);CF[i]=hash(k*9+s)<.5?5:4}}