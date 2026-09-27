// render.js - draws the cell buffer to canvas as a fixed-grid terminal, main loop
var cv=document.getElementById('term'),cx2=cv.getContext('2d'),CW=10,CHh=20,DPR=1;
function fit(){DPR=window.devicePixelRatio||1;var s=Math.min(innerWidth/(W*0.6),innerHeight/H);
 CHh=Math.floor(s*DPR);CW=CHh*0.6;cv.width=Math.ceil(W*CW);cv.height=H*CHh;
 cv.style.width=(cv.width/DPR)+'px';cv.style.height=(cv.height/DPR)+'px'}
addEventListener('resize',fit);fit();
var FONT='"Cascadia Mono","Consolas","DejaVu Sans Mono",monospace';
function paint(){var g=cx2;g.fillStyle=PAL[0];g.fillRect(0,0,cv.width,cv.height);
 for(var y=0;y<H;y++){var x=0;while(x<W){var b=CB[y*W+x],s=x;while(x<W&&CB[y*W+x]===b)x++;
   if(b){g.fillStyle=PAL[b];g.fillRect(Math.floor(s*CW),y*CHh,Math.ceil((x-s)*CW)+1,CHh)}}}
 g.textBaseline='middle';g.font=CHh*0.92+'px '+FONT;
 for(var y=0;y<H;y++){for(var x=0;x<W;x++){var i=y*W+x,c=CC[i];if(c===32)continue;var f=CF[i];
   g.fillStyle=PAL[f];
   if(c===0x2588){g.fillRect(Math.floor(x*CW),y*CHh,Math.ceil(CW)+1,CHh);continue}
   if(c===0x2580){g.fillRect(Math.floor(x*CW),y*CHh,Math.ceil(CW)+1,CHh/2);continue}
   if(c===0x2584){g.fillRect(Math.floor(x*CW),y*CHh+CHh/2,Math.ceil(CW)+1,CHh/2);continue}
   if(c>=0x2591&&c<=0x2593){g.globalAlpha=(c-0x2590)*0.25;g.fillRect(Math.floor(x*CW),y*CHh,Math.ceil(CW)+1,CHh);g.globalAlpha=1;continue}
   if(c>=0x2800&&c<=0x28ff){var m=c-0x2800,dw=CW/2,dh=CHh/4,r=Math.max(1,dw*0.34);
     for(var k=0;k<8;k++)if(m&[1,2,4,64,8,16,32,128][k]){var col=k<4?0:1,row=k<4?k:k-4;
       g.fillRect(x*CW+col*dw+dw/2-r,y*CHh+row*dh+dh/2-r,r*2,r*2)}continue}
   g.fillText(String.fromCharCode(c),x*CW,y*CHh+CHh*0.54)}}}
// audio-reactive state
var aud=document.getElementById('aud'),T=0,FR=0,BI=0,KICK=0,BASS=0,AMP=0,LASTB=-9;
function envAt(t){var i=Math.floor(t*60);return i>=0&&i<ENV.B.length?[ENV.B[i]/255,ENV.A[i]/255]:[0,0]}
function updAudio(t){var e=envAt(t);BASS=e[0];AMP=e[1];
 while(BI<ENV.beats.length&&ENV.beats[BI]<=t){LASTB=ENV.beats[BI];BI++}
 if(BI>0&&ENV.beats[BI-1]>t+0.05){BI=0;LASTB=-9;while(BI<ENV.beats.length&&ENV.beats[BI]<=t){LASTB=ENV.beats[BI];BI++}}
 KICK=Math.exp(-(t-LASTB)*7)}
var started=false,SHAKE=0,FLASH=0;
function loop(){requestAnimationFrame(loop);if(!started)return;
 var t=aud.currentTime;if(t<T-0.5){BI=0}T=t;FR++;updAudio(t);cls();
 renderMV(t);bflush();post(t);paint();
 var st=document.getElementById('stage').style;
 if(SHAKE>0.02){st.transform='translate('+((Math.random()-.5)*SHAKE*14)+'px,'+((Math.random()-.5)*SHAKE*10)+'px)';SHAKE*=0.85}else st.transform='';
 document.getElementById('flash').style.opacity=FLASH>0.01?FLASH:0;FLASH*=0.82}
requestAnimationFrame(loop);
document.getElementById('go').onclick=function(){document.getElementById('boot').style.display='none';aud.play();started=true};
addEventListener('keydown',function(e){if(e.code==='Space'){aud.paused?aud.play():aud.pause();e.preventDefault()}
 if(e.code==='ArrowRight')aud.currentTime+=5;if(e.code==='ArrowLeft')aud.currentTime=Math.max(0,aud.currentTime-5)});
// dev: ?t=SECONDS seeks and starts, ?still=SECONDS renders a single frame without audio
(function(){var q=new URLSearchParams(location.search),s=q.get('still');
 if(s!=null){started=false;document.getElementById('boot').style.display='none';
  setTimeout(function(){var t=+s;BI=0;updAudio(t);KICK=0.6;cls();renderMV(t);bflush();post(t);paint();document.title='READY';
  if(q.get('probe')){var d=cx2.getImageData(0,0,cv.width,cv.height).data,lit=0;for(var i=0;i<d.length;i+=16)if(d[i]+d[i+1]+d[i+2]>60)lit++;
   fetch('/save?name=probe_'+s+'.json',{method:'POST',body:JSON.stringify({t:+s,errs:window.__errs,cw:cv.width,ch:cv.height,lit:lit,samples:d.length/16})})}},300)}
 var t0=q.get('t');if(t0!=null){var sk=function(){aud.currentTime=+t0};if(aud.readyState>=1)sk();else aud.addEventListener('loadedmetadata',sk,{once:true})}
 if(q.get('play')){var ps=q.get('play');setTimeout(function(){document.getElementById('go').click();var f0=FR;setTimeout(function(){
  fetch('/save?name=play_'+ps+'.json',{method:'POST',body:JSON.stringify({start:+(t0||0),now:aud.currentTime,paused:aud.paused,frames:FR-f0,errs:window.__errs,beat:BI})})},8000)},500)}})();