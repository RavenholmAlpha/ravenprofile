// s4.js - switch section (1:28-1:42), chorus 2 + isolation (1:42-2:14)
S(88.34,function(t,lt){var g=lt<.8?'F':'M';bigc(6,'F  M',1,function(i){return (i==0)==(lt<.8)?5:9});
 txtc(13,'gender = '+(lt<.8?'"F"':'"M"')+';   // switch()',8);for(var x=0;x<W;x++)set(x,15,x<W*clamp(lt/1.5,0,1)?'━':'─',x%2?5:4);LB(24,8,{ks:[0]})});
S(89.91,function(t,lt){var on=Math.floor(lt*4)%2;bigc(6,'F',1,function(){return on?5:15});bigc(15,'M',1,function(){return on?15:4});LB(24,8,{ks:[0]})});
S(91.44,function(t,lt){bgPlasma(t*2,[1,12,5,7],.35);fill(10,10,W-20,6,32,2,0);box(10,10,W-20,6,7,'do { whatever(); }','r',0);LB(12,8,{ks:[0],lines:1})});
S(93.52,function(t,lt){var h=(lt/1.7)*12;for(var i=0;i<12;i++){var a=i/12*6.283-1.57;txt(CX+Math.cos(a)*22-1,CY-5+Math.sin(a)*10,pad(i==0?12:i,2),9)}
 var a=h/12*6.283-1.57;for(var r=0;r<7;r++){set(CX+Math.cos(a)*r*2,CY-5+Math.sin(a)*r,'█',7)}var b=h*6.283-1.57;for(var r=0;r<9;r++)set(CX+Math.cos(b)*r*2,CY-5+Math.sin(b)*r,'▓',4);
 txt(4,TOP+2,lt<.9?'AM':'PM',7);LB(26,8,{ks:[0]})});
S(95.28,function(t,lt){for(var i=0;i<60;i++){var s=Math.floor(t*6)+i;txt((hash(s)*W)|0,TOP+1+((hash(s*2)*(BOT-TOP-2))|0),'role:=swap',hash(s*5)<.5?5:12)}LB(12,8,{ks:[1],lines:1})});
S(97.32,function(t,lt){var on=Math.floor(lt*5)%2;box(CX-40,6,34,14,on?6:9,'S','h',on?14:0);box(CX+6,6,34,14,on?9:12,'M','h',on?0:15);
 bigc(9,'S    M',1,function(i){return i==0?(on?8:9):(on?9:8)});LB(24,8,{ks:[0]})});
S(98.93,function(t,lt){bgTunnel(t,12,5);LB(CY-2,8,{ks:[1],lines:1})});
S(100.93,function(t,lt){bgTunnel(t*1.4,5,9+lt*6);for(var i=0;i<700;i++){var a=i*.31+t*3,r=(i%70)*1.6;bdot(PX+Math.cos(a)*r*2,PY+Math.sin(a)*r,i%2?5:12)}LB(CY-2,8,{ks:[1],lines:1});if(KICK>.7)FLASH=.3});
S(102.93,function(t,lt){chorusBG(t,[1,1,4,3]);fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,3,'if (can)','h',0);LB(8,KICK>.5?8:3,{ks:[1,0],lines:2,rate:40})});
S(104.92,function(t,lt){for(var k=0;k<7;k++)for(var x=0;x<W*2;x++){var y=PY+Math.sin(x*(.02+k*.008)+t*(3+k))*(8+k*5)*(0.4+BASS);bdot(x,y,[3,4,5,12,4,3,1][k])}LB(TOP+2,8,{ks:[0]})});
S(106.74,function(t,lt){chorusBG(t,[1,10,4,4]);fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,4,'then','h',0);LB(8,KICK>.5?8:4,{ks:[1,0],lines:2,rate:40})});
S(108.69,function(t,lt){var p=clamp(lt/1.4,0,1);for(var i=0;i<60;i++){var s=i/60;var x=6+(i%20)*5.5,y=TOP+3+Math.floor(i/20)*3;box(x,y,5,3,s<p?3:1,'','s',s<p?1:0)}
 txtc(15,'COMPLETION  '+bar(p,40,'█','░')+'  '+Math.floor(p*100)+'%',p>=1?8:3);LB(24,8,{ks:[0]})});
// "you have left" x5 -> stacking terminal windows closing
S(110.3,function(t,lt){var n=clamp(CI-53,0,5);bgDots(t,1);
 for(var i=0;i<=n;i++){var x=6+i*18,y=TOP+2+i*2,cl=i<n;box(x,y,40,12,cl?9:6,cl?'[ process exited ]':'you.pid','s',13);
  txt(x+2,y+2,cl?'Process terminated.':'> you have left',cl?9:8,13);txt(x+2,y+4,cl?'exit code: 0':tw('connection lost...',LT,30),cl?1:6,13)}
 LB(26,8,{ks:[0]})});
S(115.6,function(t,lt){var c=ease(lt/2);fill(0,TOP+1,W,BOT-TOP-1,32,0,0);var r=Math.round((1-c)*40)+3;
 set(CX,CY-2,'█',8);bcirc(PX,PY-8,r*2,9);txtc(CY+4,'isolation: 1 process remaining',9);bigc(CY-12,LX().split(' ').pop()||'',0,function(){return 9});LB(28,8,{ks:[0]})});