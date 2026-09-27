// s1.js - director + intro (0:00-0:29)
var SCN=[];function S(t0,fn){SCN.push([t0,fn])}
var CI=-1,CU=null,LT=0,LASTCI=-2;
function renderMV(t){CI=cueAt(t);CU=CI>=0?LY[CI]:null;LT=CU?t-CU.t:0;
 if(CI!==LASTCI){LASTCI=CI;if(CU&&CU.x){GLITCH=.9;FLASH=.25;SHAKE=.4}}
 if(KICK>.8)GLITCH=Math.max(GLITCH,.15);
 var f=null,t0=0;SCN.sort(function(a,b){return a[0]-b[0]});
 for(var i=0;i<SCN.length;i++)if(t>=SCN[i][0]){f=SCN[i][1];t0=SCN[i][0]}
 if(f)f(t,t-t0);hud(t,CI)}
function LX(){return CU&&CU.x?CU.x:''}
// big lyric with scramble reveal; returns layout
function LB(y,col,opt){var s=LX();if(!s)return null;opt=opt||{};var n=Math.floor(LT*(opt.rate||28));
 var colf=typeof col==='function'?col:function(i){return i<n-2?col:4};
 return bigPhrase(y,s,colf,{ks:opt.ks||[1,0],lines:opt.lines||2,mid:opt.mid,reveal:n,shadow:opt.shadow==null?15:opt.shadow,w:opt.w})}
function panel(x,y,w,h,ti,col,lines,lt){box(x,y,w,h,col,ti,'s',13);for(var i=0;i<lines.length&&i<h-2;i++)txt(x+2,y+1+i,tw(lines[i],lt-i*.12,60).slice(0,w-4),i==lines.length-1?8:9,13)}
// ---- 0:00 boot sequence, one visual per line
var BOOTL=['[  OK  ] power_line.switch(ON)','[  OK  ] protection.mount(/dev/heart)','[ .... ] pieces.lay_down()','[  OK  ] new Object()','[ .... ] data.parameters = {...}','[  OK  ] init()','[  OK  ] world = new World()','[ >>>> ] simulation.begin()'];
S(0,function(t,lt){var k=clamp(CI,0,7);
 for(var i=0;i<=k;i++){var y=TOP+2+i;txt(2,y,tw(BOOTL[i],i<k?9:LT,50),i<k?1:3);if(i<k)txt(2,y,BOOTL[i].slice(0,8),BOOTL[i][3]=='O'?2:7)}
 var m=k;
 if(m==0){var p=ease(LT/1.2);pixart(CX-10,12,ART.power,PA,2,function(v){return KICK>.5?8:v});txtc(22,'[ '+bar(p,30,'█','░')+' ]',3)}
 if(m==1){for(var r=0;r<5;r++)box(CX-12-r*4,9-r,24+r*8,12+r*2,r==0?3:1,r==0?'FIREWALL':'','d');txtc(15,'PROTECTION: ENABLED',3)}
 if(m==2){for(var i=0;i<16;i++){var d=clamp(LT*3-i*.12,0,1),x=CX-24+(i%8)*6,y=8+Math.floor(i/8)*6;box(x,Math.round(y-(1-d)*12),5,4,d>=1?3:1,'','h')}}
 if(m==3){wcube(t*1.3,t*.9,0,40,PX,54,3);txtc(23,'Object obj = new Object();',8)}
 if(m==4){var ks=['dimension','mass','charge','spin','emotion','memory'];for(var i=0;i<ks.length;i++){txt(CX-18,8+i*2,pad(ks[i],10,' ')+' : ',9);txt(CX-4,8+i*2,bar(hash(i+Math.floor(LT*8))*.5+LT*.3,20,'▰','▱'),i==4?5:4)}}
 if(m==5){var p=clamp(LT/1.1,0,1);bigc(9,'INIT',1,function(){return 3});txtc(16,bar(p,50,'█','·'),4);txtc(17,Math.floor(p*100)+'%',8)}
 if(m==6){bgStars(t,1.5,8);wsphere(t*.4,t*.7,52,PX,60,4,10)}
 if(m==7){bgTunnel(t,3,4+LT*4)}
 LB(m>=5?27:26,8,{ks:[0],lines:1});
 if(m==7&&LT>2.5)FLASH=.6});
// ---- 0:16 instrumental: title reveal + donut + rain
S(16.04,function(t,lt){bgRain(t,.55);var A=t*1.1,B=t*.6;
 if(lt<6){donut(A,B,CX,CY-1,70,34,[1,2,3,8]);var s='world.execute(me);';scramc(34,s,lt-1,8,10)}
 else{fill(10,7,W-20,19,32,2,0);box(10,7,W-20,19,KICK>.6?5:3,'world.execute(me);','d',0);
  bigc(10,'WORLD',1,function(i,x,y){return (x+y+Math.floor(t*10))%9<2?4:3},null,15);
  bigc(17,'.EXECUTE(ME);',0,function(i){return i==Math.floor(t*6)%13?5:8});
  txtc(22,'MILI  ·  LIBRARY OF RUINA  ·  126.5 BPM',9);txtc(23,tw('> loading simulation layer '+Math.floor(clamp((lt-6)/7,0,1)*100)+'%',lt-6,30),4)}
 if(lt>11.5)GLITCH=1});