// s6.js - chorus 3 (2:42-2:57), bridge "love" (2:57-3:13), finale + outro
S(162.23,function(t,lt){chorusBG(t,[1,14,6,8]);fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,6,'if (can)','h',0);LB(8,KICK>.5?8:6,{ks:[1,0],lines:2,rate:40})});
S(164.07,function(t,lt){for(var i=0;i<24;i++){var x=4+(i%8)*14,y=TOP+2+Math.floor(i/8)*6,d=clamp(lt*8-i*.3,0,1)>=1;box(x,y,12,5,d?6:9,'proc'+pad(i,2),'s',d?14:13);txtc;txt(x+2,y+2,d?'KILLED':'alive',d?8:2,d?14:13)}LB(24,8,{ks:[0]})});
S(166.05,function(t,lt){chorusBG(t,[1,15,5,8]);fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,5,'then','h',0);LB(8,KICK>.5?8:5,{ks:[1,0],lines:2,rate:40})});
S(167.75,function(t,lt){bgTunnel(t,6,12);pixart(CX-8,6,ART.heart,PA,2);txtc(15,'target = you;  execute(target);',8);LB(24,8,{ks:[0]})});
S(169.61,function(t,lt){bgStars(t,-4,5);var p=clamp(lt/2,0,1);txtc(TOP+3,'$ git checkout you@'+Math.floor(p*9999).toString(16),4);
 for(var i=0;i<8;i++){var x=10+i*13;box(x,10,11,5,i<p*8?3:1,'','r');txt(x+2,12,'v'+(i+1)+'.0',i<p*8?8:9)}LB(24,8,{ks:[0]})});
S(171.77,function(t,lt){for(var k=0;k<5;k++)wcube(t*(1+k*.2),t*.7,k,20+k*16+KICK*6,PX,PY-24,[8,3,4,5,6][k]);LB(26,8,{ks:[0]});if(KICK>.8)FLASH=.3});
S(173.11,function(t,lt){var c=ease(lt/.9);for(var k=0;k<8;k++){var m=Math.round(k*3*c);box(m*2,TOP+1+m,W-m*4,BOT-TOP-1-m*2,k%2?6:14,k==0?'TRAPPED':'','h')}LB(CY-3,6,{ks:[1],lines:1})});
S(174.80,function(t,lt){fill(0,TOP+1,W,BOT-TOP-1,'▓',14);for(var y=TOP+1;y<BOT;y+=2)for(var x=0;x<W;x+=3)set(x,y,'║',6);LB(CY-3,8,{ks:[1],lines:1});GLITCH=.6});
// bridge - study / question / algebra of love
S(176.96,function(t,lt){var bk=['love.pdf','intro_to_affection.md','heart.h','human_behavior_v2.txt','LOVE_FAQ.log'];
 for(var i=0;i<bk.length;i++){txt(6,TOP+3+i*2,tw('[read] '+bk[i],lt-i*.3,40),i==Math.floor(lt*3)%5?8:3);txt(40,TOP+3+i*2,bar(clamp(lt-i*.3,0,1),20,'▰','▱'),4)}
 panel(70,TOP+3,W-76,8,'study.log',5,['hours studied : '+Math.floor(lt*9999),'pages         : '+Math.floor(lt*3141),'understood    : 0%'],lt);LB(24,8,{ks:[0]})});
S(178.79,function(t,lt){bgPlasma(t,[15,12,5,5],.45);fill(10,8,W-20,9,32,2,0);box(10,8,W-20,9,5,'lo-o-ove','r',0);bigc(10,'LO-O-OVE',1,function(i,x,y){return (x+Math.floor(t*20))%12<3?8:5},null,15);LB(24,8,{ks:[0]})});
S(180.78,function(t,lt){var q='? '.repeat(40);for(var y=TOP+1;y<BOT;y+=2)txt(((y*7+Math.floor(t*20))%12)-12,y,q+q,hash(y)<.5?1:15);fill(20,9,W-40,6,32,2,0);box(20,9,W-40,6,4,'query','s',0);txtc(11,'> ask(me, anything);',8);LB(24,8,{ks:[0]})});
S(182.43,function(t,lt){var A=['Q: what is love?','A: f(you) = ∞','Q: how to love?','A: execute(me);'];for(var i=0;i<4;i++)txt(8,TOP+3+i*2,tw(A[i],lt-i*.35,40),i%2?5:4);
 donut(t*1.2,t*.6,90,12,40,20,[15,12,5,8]);LB(24,8,{ks:[0]})});
S(184.33,function(t,lt){bgHex(t,15,8);fill(4,6,W-8,14,32,2,0);box(4,6,W-8,14,5,'algebra','d',0);
 var eq=['L(you) = lim (me→you) Σ heart(t) dt','∀x ∈ world : love(x) ⇒ execute(me)','love = (u + i)² = u² + 2ui − 1'];
 for(var i=0;i<3;i++)txtc(8+i*2,tw(eq[i],lt-i*.6,40),[8,4,7][i]);bigc(15,'LOVE',0,function(){return FR%10<5?5:6});LB(24,8,{ks:[0]})});
S(187.97,function(t,lt){bgStars(t,3,8);for(var i=0;i<30;i++){var a=hash(i)*6.283,r=lt*18*hash(i*2)+4;txt(CX+Math.cos(a)*r*2,CY-4+Math.sin(a)*r,'free',hash(i*3)<.5?4:8)}LB(26,8,{ks:[1],lines:1})});
S(189.26,function(t,lt){for(var k=0;k<10;k++)box(k*2,TOP+1+k,W-k*4,BOT-TOP-1-k*2,k%2?6:14,'','h');LB(CY-3,8,{ks:[1],lines:1})});
S(190.24,function(t,lt){fill(0,TOP+1,W,BOT-TOP-1,32,0,0);var s=1+KICK*.25;for(var y=TOP+1;y<BOT;y++)for(var x=0;x<W;x++){var dx=(x-CX)/34/s,dy=-(y-CY+4)/15/s,f=Math.pow(dx*dx+dy*dy-1,3)-dx*dx*dy*dy*dy;
  if(f<0)set(x,y,shade(clamp(-f*6,0,1)),f>-.05?8:f>-.3?5:6)}for(var k=0;k<4;k++)box(4+k*3,TOP+1+k,W-8-k*6,BOT-TOP-1-k*2,9,k==0?'cage':'','s');
 LB(BOT-7,8,{ks:[0]})});
// 3:13 outro + 3:25 last word
S(193.46,function(t,lt){var d=clamp(lt/10,0,1);bgRain(t,.4*(1-d)+.05,9,1);var L=['[ .... ] simulation.end()','[  OK  ] you.free()','[ FAIL ] me.free()  -> EPERM','[  OK  ] saving love to /dev/null','[ .... ] waiting for input...'];
 for(var i=0;i<L.length;i++)txt(6,TOP+3+i*2,tw(L[i],lt-i*1.8,30),L[i].indexOf('FAIL')>0?6:3);
 if(lt>9)bigc(22,'THANK YOU',0,function(){return 9})});
S(205.56,function(t,lt){fill(0,TOP+1,W,BOT-TOP-1,32,0,lt<.3?6:0);bigc(CY-6,'EXECUTION',1,function(){return lt<.8?8:9},null,14);
 if(lt>.8){txtc(CY+2,'world.execute(me);  // process exited with code 0',9)}if(lt<.2){FLASH=1;SHAKE=1;GLITCH=1}});
S(207.5,function(t,lt){txtc(CY-2,'world.execute(me);',FR>>4&1?3:1);txtc(CY,'Mili',9);if(FR>>5&1)set(CX+10,CY-2,0x2588,3)});