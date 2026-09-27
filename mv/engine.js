// engine.js - terminal cell buffer + primitives. Everything maps to a real terminal cell.
var W=120,H=45,N=W*H,TOP=1,BOT=H-6,CX=60,CY=20;
var CC=new Uint16Array(N),CF=new Uint8Array(N),CB=new Uint8Array(N);
// 0 bg 1 dimgreen 2 green 3 higreen 4 cyan 5 pink 6 red 7 yellow 8 white 9 gray 10 blue 11 orange 12 violet 13 panel 14 darkred 15 darkpink
var PAL=['#05070a','#0e4a33','#20a36b','#48ffb0','#3ad7ff','#ff5ad9','#ff3348','#ffd34d','#f4fff9','#5d6a78','#3a78ff','#ff8c3a','#a57dff','#141a22','#5a0f1a','#4a1640'];
function cls(){CC.fill(32);CF.fill(2);CB.fill(0)}
function set(x,y,c,f,b){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;var i=y*W+x;
 CC[i]=typeof c==='number'?c:c.charCodeAt(0);if(f!=null)CF[i]=f;if(b!=null)CB[i]=b}
function txt(x,y,s,f,b){s=String(s);for(var i=0;i<s.length;i++)set(x+i,y,s.charCodeAt(i),f,b)}
function txtc(y,s,f,b){s=String(s);txt(Math.round((W-s.length)/2),y,s,f,b)}
function fill(x,y,w,h,c,f,b){for(var j=0;j<h;j++)for(var i=0;i<w;i++)set(x+i,y+j,c,f,b)}
function bgr(x,y,w,h,b){x=Math.round(x);y=Math.round(y);for(var j=0;j<h;j++)for(var i=0;i<w;i++){var X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H)CB[Y*W+X]=b}}
var BX={s:'┌┐└┘─│',d:'╔╗╚╝═║',r:'╭╮╰╯─│',h:'┏┓┗┛━┃'};
function box(x,y,w,h,f,ti,st,bg){var k=BX[st||'s'];x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
 if(w<2||h<2)return;if(bg!=null)fill(x+1,y+1,w-2,h-2,32,f,bg);
 for(var i=1;i<w-1;i++){set(x+i,y,k[4],f);set(x+i,y+h-1,k[4],f)}
 for(var j=1;j<h-1;j++){set(x,y+j,k[5],f);set(x+w-1,y+j,k[5],f)}
 set(x,y,k[0],f);set(x+w-1,y,k[1],f);set(x,y+h-1,k[2],f);set(x+w-1,y+h-1,k[3],f);
 if(ti&&w>6)txt(x+2,y,(' '+ti+' ').slice(0,w-4),f)}
function hash(n){n=Math.sin(n*127.1+311.7)*43758.5453;return n-Math.floor(n)}
function h2(a,b){return hash(a*57.13+b*13.71)}
var GL='01<>{}[]/\\|=+*#%&$@;:ABCDEFabcdefx';
function gch(s){return GL.charCodeAt((hash(s)*GL.length)|0)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function ease(p){p=clamp(p,0,1);return p*p*(3-2*p)}
var RAMP=' .:-=+*#%@',BLK=' ░▒▓█';
function shade(v){return RAMP.charCodeAt(clamp((v*9.99)|0,0,9))}
// braille sub-pixel layer: 2x4 dots per cell -> (W*2)x(H*4) square-ish pixels
var BB=new Uint8Array(N),BF=new Uint8Array(N),BM=[[1,8],[2,16],[4,32],[64,128]];
function bdot(px,py,f){px=Math.round(px);py=Math.round(py);if(px<0||py<0||px>=W*2||py>=H*4)return;
 var i=(py>>2)*W+(px>>1);BB[i]|=BM[py&3][px&1];BF[i]=f}
function bline(x0,y0,x1,y1,f){var n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1));for(var i=0;i<=n;i++){var u=i/n;bdot(x0+(x1-x0)*u,y0+(y1-y0)*u,f)}}
function bcirc(cx,cy,r,f,a0,a1){a0=a0||0;a1=a1==null?6.2832:a1;var n=Math.max(12,r*7);for(var i=0;i<=n;i++){var a=a0+(a1-a0)*i/n;bdot(cx+Math.cos(a)*r,cy+Math.sin(a)*r,f)}}
function bflush(){for(var i=0;i<N;i++)if(BB[i]){CC[i]=0x2800+BB[i];CF[i]=BF[i]}BB.fill(0)}
var PX=W,PY=CY*4; // braille-space center
// 3D helpers
function rot3(p,ax,ay,az){var x=p[0],y=p[1],z=p[2],c,s,t;
 c=Math.cos(ax);s=Math.sin(ax);t=y*c-z*s;z=y*s+z*c;y=t;
 c=Math.cos(ay);s=Math.sin(ay);t=x*c+z*s;z=-x*s+z*c;x=t;
 if(az){c=Math.cos(az);s=Math.sin(az);t=x*c-y*s;y=x*s+y*c;x=t}return [x,y,z]}
function proj(p,sc,cx,cy){var k=3.2/(3.2+p[2]);return [(cx==null?PX:cx)+p[0]*sc*k,(cy==null?PY:cy)+p[1]*sc*k,k]}
function tw(s,lt,rate){return s.slice(0,Math.max(0,Math.floor(lt*(rate||40))))}
function scram(x,y,s,lt,f,spd){spd=spd||60;var n=lt*spd;for(var i=0;i<s.length;i++){if(s[i]===' ')continue;
 if(i<n-5)set(x+i,y,s.charCodeAt(i),f);else if(i<n)set(x+i,y,gch(i*7+Math.floor(lt*40)),4)}}
function scramc(y,s,lt,f,spd){scram(Math.round((W-s.length)/2),y,s,lt,f,spd)}
function pad(n,w,ch){n=String(n);while(n.length<w)n=(ch||'0')+n;return n}