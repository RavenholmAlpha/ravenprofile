// s3.js - chorus 1 (0:58-1:13), verse 2 (1:13-1:28), switch section (1:28-1:42)
function chorusBG(t,cols){bgPlasma(t*1.5,cols||[1,15,12,5],.3);if(KICK>.6){SHAKE=Math.max(SHAKE,.3)}}
S(58.65,function(t,lt){chorusBG(t);var n=CU.x.split(',').length;fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,5,'if (can)','h',0);
 LB(8,KICK>.5?8:3,{ks:[1,0],lines:2,rate:40});txt(8,20,' while (true) { if (i.can()) ... } ',9,0)});
S(60.57,function(t,lt){bgHex(t,1,14);var cols=6,rows=3;for(var i=0;i<cols*rows;i++){var x=4+(i%cols)*19,y=TOP+2+Math.floor(i/cols)*7,on=clamp(lt*6-i*.3,0,1)>=1;
 box(x,y,18,6,on?3:1,'sim#'+pad(i,2),'s',13);if(on){for(var k=0;k<14;k++)set(x+2+k,y+2+Math.round(Math.sin(k*.6+t*4+i)*1.2),'•',i%3?4:3)}}LB(24,8,{ks:[0]})});
S(62.41,function(t,lt){chorusBG(t,[1,1,4,10]);fill(6,6,W-12,15,32,2,0);box(6,6,W-12,15,4,'then','h',0);LB(8,KICK>.5?8:4,{ks:[1,0],lines:2,rate:40})});
S(64.29,function(t,lt){bgSun(CX,21,14,5);bgGrid(t,5,21);txtc(TOP+2,'satisfaction = 100%',7);LB(24,8,{ks:[0]})});
S(66.17,function(t,lt){for(var i=0;i<22;i++){var a=i/22*6.283+t*.8,r=18+KICK*4;pixart(CX+Math.cos(a)*r*2.2-4,CY-2+Math.sin(a)*r-2,ART.heart,PA,1,function(v){return i%2?5:6})}
 txtc(CY-2,'(^‿^)',7);LB(26,8,{ks:[0]})});
S(67.99,function(t,lt){var L=['$ sudo ./run --execution','[sudo] password for mili: ********','> loading payload... done','> EXECUTING'];
 for(var i=0;i<L.length;i++)txt(4,TOP+2+i,tw(L[i],lt-i*.35,50),i==3?6:3);
 if(lt>1.2){bigc(10,'RUN',1,function(){return FR%6<3?6:8},null,14);GLITCH=.5}LB(26,8,{ks:[0]})});
S(70.02,function(t,lt){var c=ease(lt/.8);for(var k=0;k<6;k++){var m=Math.round(k*4*c);box(m*2,TOP+1+m,W-m*4,BOT-TOP-1-m*2,k%2?6:1,k==0?'TRAPPED':'','d')}LB(CY-3,6,{ks:[1],lines:1})});
S(71.2,function(t,lt){wcube(t,t*.7,t*.3,70+KICK*10,PX,64,1);wcube(-t,t*.5,0,38,PX,64,4);wcube(t*1.5,-t,0,18,PX,64,8);LB(TOP+2,8,{ks:[0],lines:2})});
// verse 2: each object gets a pixel-art sprite + stat panel
function itemScene(sp,k,lines,col){return function(t,lt){bgDots(t,1);var bob=Math.round(Math.sin(t*4)*1),w=ART[sp][0].length*k;
 pixart(24-w/2,TOP+3+bob,ART[sp],PA,k);panel(52,TOP+3,W-58,lines.length+2,sp+'.inspect()',col,lines,lt);LB(24,8,{ks:[0]})}}
S(73.53,itemScene('egg',2,['class Eggplant extends Vegetable','color   = #6b2fa6','fiber   = 3.0g','state   = spawned'],12));
S(75.29,itemScene('egg',2,['nutrients[]:','  vitamin_K  '+bar(.7,16),'  folate     '+bar(.5,16),'  manganese  '+bar(.4,16),'> transfer(you)'],2));
S(77.16,itemScene('tom',2,['class Tomato extends Fruit','color   = #ff3348','lycopene= high','state   = spawned'],6));
S(78.93,itemScene('tom',2,['antioxidants[]:','  lycopene   '+bar(.9,16),'  vitamin_C  '+bar(.6,16),'  beta_car   '+bar(.4,16),'> transfer(you)'],6));
S(80.93,itemScene('cat',2,['class TabbyCat extends Animal','stripes = true','lives   = 9','mood    = curious'],11));
S(82.56,function(t,lt){itemScene('cat',2,['purr.freq = 25Hz','enjoyment += 1','> emit(purr)'],11)(t,lt);
 for(var x=0;x<W*2;x++)bdot(x,64+Math.sin(x*.3+t*25)*6*(0.5+BASS),11);txt(4,TOP+2,'~ purrrrrrr ~',7)});
S(84.6,function(t,lt){bgRain(t,.7,7,7);pixart(CX-8,TOP+2,ART.eye,PA,1);bigc(12,'GOD',1,function(){return 7},null,11);
 txtc(19,'uid=0(root) gid=0(root) groups=0(root)',9);LB(24,8,{ks:[0]})});
S(86.21,function(t,lt){bgRain(t,.7,8,3);var L=['assert(you != null);','assert(me.exists() == true);','// Q.E.D.'];
 for(var i=0;i<L.length;i++)txtc(8+i*2,tw(L[i],lt-i*.4,40),i==2?7:3);txtc(15,lt>1.2?'[ PASS ] existence proven by you':'',2);LB(24,8,{ks:[0]})});