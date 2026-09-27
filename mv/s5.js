// s5.js - erase/illegal args (1:57-2:27), EXECUTION (2:27-2:42), bridge + love (2:42-end)
S(117.95,function(t,lt){chorusBG(t,[1,14,6,6]);fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,6,'if (can)','h',0);LB(8,KICK>.5?8:6,{ks:[1,0],lines:2,rate:40})});
S(119.81,function(t,lt){for(var i=0;i<500;i++){var x=(hash(i)*W)|0,y=TOP+1+((hash(i*2)*(BOT-TOP-2))|0),d=hash(i*3)*1.6;if(lt<d)set(x,y,gch(i),hash(i*5)<.5?2:1);else if(lt<d+.15)set(x,y,'░',6)}
 txt(4,TOP+2,'$ rm -rf ./pointless_fragments/*',6);LB(26,8,{ks:[0]})});
S(121.8,function(t,lt){bgRain(t,.3,9,1);fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,9,'maybe','r',0);LB(8,KICK>.5?8:9,{ks:[1,0],lines:2,rate:40})});
S(123.55,function(t,lt){bgRain(t,.25,9,1);pixart(CX-9,6,ART.heart,PA,2,function(v,r,c){return (c+Math.floor(lt*6))%5==0?0:v});txtc(16,'heart.integrity = '+Math.max(0,100-Math.floor(lt*45))+'%',6);LB(24,8,{ks:[0]})});
S(125.33,function(t,lt){bgRain(t,.8,7,7);pixart(CX-16,TOP+2,ART.eye,PA,2);var s=clamp(lt/2,0,1);bigc(15,'GOD',1,function(){return FR%8<4?7:11},null,14);LB(26,8,{ks:[0]});SHAKE=Math.max(SHAKE,s*.5)});
S(128.42,function(t,lt){bgRain(t,.9,6,6);box(10,6,W-20,16,6,'kernel panic','h',14);txtc(9,'Traceback (most recent call last):',8,14);txtc(11,'  File "world.py", line 1337, in <module>',9,14);txtc(13,'    you.challenge(god)',7,14);LB(26,8,{ks:[0]})});
S(130.74,function(t,lt){fill(0,TOP+1,W,BOT-TOP-1,32,8,FR%10<5?14:0);bigc(6,'ILLEGAL',1,function(){return 8},null,6);bigc(13,'ARGUMENTS',1,function(){return FR%4<2?6:8},null,0);
 txtc(20,'IllegalArgumentException: love is not a valid parameter',7);GLITCH=Math.max(GLITCH,.4+KICK*.6);SHAKE=Math.max(SHAKE,.25)});
// 2:14 interlude - core dump + rebuild
S(134.38,function(t,lt){if(lt<6){bgHex(t,1,30);box(CX-26,CY-5,52,7,6,'segfault','h',0);txtc(CY-3,'Segmentation fault (core dumped)',6);txtc(CY-1,'rebooting simulation in '+Math.max(0,6-Math.floor(lt))+'...',9)}
 else{bgGrid(t,4,CY-4);wcube(t*1.2,t*.8,0,40+KICK*10,PX,PY-40,8);txtc(TOP+2,'[ reboot ] world.execute(me); // attempt #2',3)}if(lt>12.4)FLASH=1});
// 2:27 EXECUTION x6 - strobe, big type, zoom
S(147.48,function(t,lt){var k=CI-67,cols=[[6,8],[5,8],[4,8],[7,6],[3,5],[8,6]][clamp(k,0,5)],inv=KICK>.55;
 if(inv)fill(0,TOP+1,W,BOT-TOP-1,32,0,cols[0]==8?6:14);
 if(k%2)bgTunnel(t,cols[0],10);else bgRain(t,.9,8,cols[0]);
 var w=bigW('EXECUTION',1);var sc=1+Math.floor(LT*4)%2;fill(Math.round((W-w)/2)-2,9,w+4,7,32,2,0);
 bigc(10,'EXECUTION',1,function(i){return i<=Math.floor(LT*18)?(inv?8:cols[0]):1},null,cols[0]==6?14:15);
 txtc(17,'>>> execute(); '.repeat(6),cols[1]);if(KICK>.8){SHAKE=.6;FLASH=.3}});
S(158.79,function(t,lt){var n=CI-73;var ws=['EIN','DOS','TRIOS','NE','FEM','LIU'];bgStars(t,8,8);
 var c=LX().toUpperCase().replace(/,/g,'').split(' ');var idx=LT<(CU.e-CU.t)/2?0:1;bigc(9,c[Math.min(idx,c.length-1)]||'',1,function(){return [5,4,7,3,6,12][(n*2+idx)%6]},null,15);
 txtc(17,'count = '+(n*2+idx+1),9)});
S(161.31,function(t,lt){bgTunnel(t,6,16);fill(8,9,W-16,8,32,2,0);bigc(10,'EXECUTION',1,function(){return FR%4<2?8:6},null,14);GLITCH=.8;SHAKE=.6});