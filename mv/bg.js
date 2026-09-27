// bg.js - full-screen terminal backgrounds (all cell/braille based)
var RC=null;
function bgRain(t,dens,hc,tc){if(!RC){RC=[];for(var i=0;i<W;i++)RC.push({y:hash(i)*-40,v:.3+hash(i*3)*.9,l:4+(hash(i*7)*16|0)})}
 for(var x=0;x<W;x++){var c=RC[x];if(hash(x*1.3)>dens)continue;c.y+=c.v*(1+KICK*1.5);if(c.y-c.l>BOT){c.y=-hash(x+t)*20}
  for(var k=0;k<c.l;k++){var y=Math.floor(c.y)-k;if(y<=TOP||y>=BOT)continue;
   set(x,y,gch(x*31+y+Math.floor(t*8)*(k==0?1:0)),k==0?(hc||8):k<3?(tc||3):k<c.l*.6?2:1)}}}
function bgStars(t,sp,col){for(var i=0;i<260;i++){var a=hash(i)*6.283,z=(hash(i*2.1)-t*sp*.1)%1;if(z<0)z+=1;z=z*.95+.05;
 var r=(.05+hash(i*5.3))/z*18,x=CX+Math.cos(a)*r*2,y=CY+Math.sin(a)*r;
 if(y>TOP&&y<BOT)set(x,y,z<.2?'*':z<.5?'+':'.',z<.3?(col||8):z<.6?4:1)}}
function bgTunnel(t,col,sp){for(var y=TOP+1;y<BOT;y++)for(var x=0;x<W;x++){var dx=(x-CX)/2,dy=y-CY,d=Math.sqrt(dx*dx+dy*dy)+.01,
 a=Math.atan2(dy,dx),u=12/d+t*(sp||2),v=a/3.1416*4+t*.3,ch=((Math.floor(u)+Math.floor(v*2))&1);
 if(d<2.5)continue;var s=clamp(d/25,0,1);if(ch&&hash(Math.floor(u)*3+Math.floor(v*2))>.3)set(x,y,shade(s*.8+KICK*.2),s>.6?(col||2):1)}}
function bgPlasma(t,cols,thr){cols=cols||[1,2,3];thr=thr||.25;for(var y=TOP+1;y<BOT;y++)for(var x=0;x<W;x++){
 var v=Math.sin(x*.09+t)+Math.sin(y*.21-t*1.3)+Math.sin((x*.05+y*.12)+t*.7)+Math.sin(Math.sqrt((x-CX)*(x-CX)*.25+(y-CY)*(y-CY))*.35-t*2);
 v=(v+4)/8;if(v<thr)continue;set(x,y,shade((v-thr)/(1-thr)),cols[Math.min(cols.length-1,((v-thr)/(1-thr)*cols.length)|0)])}}
function bgGrid(t,col,hz){hz=hz||CY-2;for(var y=hz+1;y<BOT;y++){var z=(y-hz)/(BOT-hz),zz=1/z;
 if(Math.abs(((zz*2-t*4)%2+2)%2)<.3*z+.08)for(var x=0;x<W;x++)set(x,y,'─',z>.5?(col||5):15);
 for(var k=-14;k<=14;k++){var x=CX+k*8*z*2.2;set(x,y,k<0?'/':k>0?'\\':'│',z>.4?(col||5):15)}}
 for(var x=0;x<W;x++)set(x,hz,'━',col||5)}
function bgSun(cx,cy,r,col){for(var y=-r;y<=0;y++)for(var x=-r*2;x<=r*2;x++){var d=(x*x/4+y*y)/(r*r);if(d>1)continue;
 if(y>-r*.6&&((-y)%3==0))continue;set(cx+x,cy+y,'█',y<-r*.5?7:y<-r*.25?11:5)}}
function bgHex(t,col,sp){for(var y=TOP+1;y<BOT;y++){var ln=Math.floor(t*(sp||6))+y,s=pad((ln*16).toString(16),8)+'  ';
 for(var k=0;k<16;k++)s+=pad(Math.floor(hash(ln*16+k)*256).toString(16),2)+' ';
 txt(2,y,s,y===BOT-1?8:(col||1))}}
function bgDots(t,col){for(var y=TOP+1;y<BOT;y+=2)for(var x=2;x<W;x+=4)set(x,y,'·',col||1)}
function vignetteBars(t){var n=Math.floor(KICK*6);for(var i=0;i<n;i++){set(i,TOP+1+((t*20+i*7)%(BOT-TOP-1)),'▌',5);set(W-1-i,BOT-1-((t*20+i*7)%(BOT-TOP-1)),'▐',4)}}
function scanH(t,col){var y=TOP+1+Math.floor((t*30)%(BOT-TOP-1));for(var x=0;x<W;x++)if(CC[y*W+x]!==32)CF[y*W+x]=col||8;else set(x,y,'─',1)}