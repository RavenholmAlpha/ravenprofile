// scenes / hud / lyric typography for world.execute(me);
var CX=W/2, CY=H/2, AR=0.5;
function dot(lay,li,x,y,c){x=Math.round(x);y=Math.round(y);
  if(x<0||x>=W||y<0||y>=H)return;lay[li][y][x]=c}
function line3(lay,li,a,b,c){var st=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))|0;
  st=Math.max(st,1);for(var i=0;i<=st;i++){var u=i/st;
    dot(lay,li,a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,c)}}
// ================= HUD (frame chrome) =================
function pad(n,w){n=String(n);while(n.length<w)n='0'+n;return n}
function tc(t){var m=(t/60)|0,s2=t-m*60;return pad(m,2)+':'+(s2<10?'0':'')+s2.toFixed(2)}
function hud(lay,t){
  var g=lay[0];
  put(g,0,0,'+'+'-'.repeat(W-2)+'+',1);
  put(g,0,H-1,'+'+'-'.repeat(W-2)+'+',1);
  for(var y=1;y<H-1;y++){put(g,0,y,'|',1);put(g,W-1,y,'|',1)}
  put(lay[2],2,0,'[ mili@simulation:~/world ]');
  put(lay[1],W-30,0,'[ '+tc(t)+' / 03:30 ]');
  var dur=aud.duration||210,p=Math.min(1,t/dur),bw=W-26;
  var fillc=(bw*p)|0;
  put(lay[0],2,H-1,'['+'='.repeat(Math.max(0,fillc))+'>'+' '.repeat(Math.max(0,bw-fillc))+']',1);
  put(lay[2],W-20,H-1,'PID 1337 '+pad((p*100)|0,3)+'%');
  var sp=' '+'|/-\\'[(F>>2)%4]+' ';put(lay[1],W-24,H-1,sp);
  if(INFO)put(lay[1],4,1,INFO);
  if(INFO2)put(lay[1],4,2,INFO2);
}
// ================= LYRICS =================
var FT={
 'A':['##','# #','###','# #','# #'],'B':['###','# #','###','# #','###'],
 'C':['###','#  ','#  ','#  ','###'],'D':['## ','# #','# #','# #','## '],
 'E':['###','#  ','###','#  ','###'],'F':['###','#  ','###','#  ','#  '],
 'G':['###','#  ','# #','# #','###'],'H':['# #','# #','###','# #','# #'],
 'I':['###',' # ',' # ',' # ','###'],'J':['###','  #','  #','# #','###'],
 'K':['# #','# #','## ','# #','# #'],'L':['#  ','#  ','#  ','#  ','###'],
 'M':['# #','###','###','# #','# #'],'N':['## ','# #','# #','# #','  #'],
 'O':['###','# #','# #','# #','###'],'P':['###','# #','###','#  ','#  '],
 'Q':['###','# #','# #','###','  #'],'R':['###','# #','###','# #','# #'],
 'S':['###','#  ','###','  #','###'],'T':['###',' # ',' # ',' # ',' # '],
 'U':['# #','# #','# #','# #','###'],'V':['# #','# #','# #','# #',' # '],
 'W':['# #','# #','###','###','# #'],'X':['# #','# #',' # ','# #','# #'],
 'Y':['# #','# #','###',' # ',' # '],'Z':['###','  #',' # ','#  ','###'],
 ' ':['  ','  ','  ','  ','  '],'.':['  ','  ','  ','  ',' # '],
 ',':['  ','  ','  ',' # ','#  '],"'":[' #',' #','  ','  ','  '],
 '-':['   ','   ','###','   ','   '],'!':[' # ',' # ',' # ','   ',' # '],
 '?':['###','  #',' ##','   ',' # ']};
function bigWidth(s){var w=0;for(var i=0;i<s.length;i++){var c=FT[s[i]]||FT[' '];w+=c[0].length+1}return w-1}
function bigDraw(lay,li,s,x,y,ch){for(var i=0;i<s.length;i++){var gl=FT[s[i]]||FT[' '];
  for(var r=0;r<5;r++){var row=gl[r];for(var c2=0;c2<row.length;c2++){
    if(row[c2]!==' ')dot(lay,li,x+c2,y+r,ch)}}x+=gl[0].length+1}}
var lastCue=null;
function lyrics(lay,t){
  var cu=curLy(t);
  if(cu!==lastCue){lastCue=cu;if(cu&&cu.x){pulse(1);glitch=0.22}}
  var box0=H-6;
  put(lay[0],1,box0,'-'.repeat(W-2),1);
  var txt=cu&&cu.x?cu.x:'';
  var age=cu?t-cu.t:0;
  // typewriter reveal
  var n=Math.min(txt.length,Math.ceil(age/0.035));
  var shown=txt.slice(0,n);
  var cur=(F>>3)%2?'_':' ';
  put(lay[3],3,box0+2,'> '+shown+cur);
  var nx=nextLy(t);
  if(nx)put(lay[0],3,box0+3,'. '+nx.x.slice(0,W-10).toLowerCase());
  // BIG upper-center text for hook lines
  var up=txt.toUpperCase();
  if(txt&&sceneAt(t)!=='exec'&&sceneAt(t)!=='final'&&/EXECUTION|TRAPPED|LOVE|ISOLATION|GOD/.test(up)&&age<2.2){
    var word=up.match(/EXECUTION|TRAPPED|LO-O-OVE|LOVE|ISOLATION|GOD/)[0].replace(/-/g,'');
    var w=bigWidth(word);
    var li=(Math.floor(age*12)%2)?4:3;
    bigDraw(lay,li,word,Math.round(CX-w/2),4,(age<0.15)?'@':'#');
  }
}
// ================= SCENES =================
// 1. boot log
var logbuf=[],logT=0;
var LOGS=['[ok] switch_on(power_line)','[ok] protection.enable()','[..] pieces.lay_down()',
'[ok] object.create()','[..] data.parameters <- fill','[ok] initialization complete',
'[ok] world.new(seed=0x4d494c49)','[..] simulation.begin()','[warn] affection module unstable',
'[ok] mmap 0x0000 love.so','[ok] gender=NULL','[..] awaiting host input',
'[ok] heartbeat=120bpm','[warn] recursion depth exceeded','[ok] you.exists()==true'];
SC.log=function(lay,t){
  if(t-logT>0.42&&logbuf.length<26){logT=t;
    logbuf.push(LOGS[logbuf.length%LOGS.length]+'  '+pad(((Math.random()*9999)|0),4))}
  for(var i=0;i<logbuf.length;i++){
    var y=3+i;if(y>H-8)break;
    var li=logbuf[i].indexOf('[warn]')===0?5:(i===logbuf.length-1?3:2);
    put(lay[li],4,y,logbuf[i])}
  // side rain
  for(var k=0;k<40;k++){dot(lay,0,R(2,W-2),R(2,H-8),pick('01'))}
};
// 2. rotating wireframe cube
SC.cube=function(lay,t){
  var a=t*0.7,b=t*0.5,S=12;
  var V=[],i,j;
  var P=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  for(i=0;i<8;i++){var p=P[i],x=p[0],y=p[1],z=p[2];
    var x1=x*Math.cos(a)-z*Math.sin(a),z1=x*Math.sin(a)+z*Math.cos(a);
    var y1=y*Math.cos(b)-z1*Math.sin(b),z2=y*Math.sin(b)+z1*Math.cos(b);
    var pz=3/(3+z2*0.6);
    V.push([CX+x1*S*pz/AR*0.5,CY-4+y1*S*pz*0.5])}
  var E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  for(i=0;i<E.length;i++)line3(lay,2,V[E[i][0]],V[E[i][1]],'*');
  for(i=0;i<8;i++)dot(lay,3,V[i][0],V[i][1],'@');
  INFO='object Body { vertices: 8, edges: 12 }';
  INFO2='rotate(x='+(a%6.28).toFixed(2)+', y='+(b%6.28).toFixed(2)+')';
};
// 3. sine waves / tangents
SC.sine=function(lay,t){
  for(var k=0;k<4;k++){var amp=6-k,ph=t*(1.6+k*0.4),fr=0.11+k*0.03;
    for(var x=2;x<W-2;x++){var y=CY-3+Math.sin(x*fr+ph)*amp;
      dot(lay,k===0?3:2,x,y,k===0?'#':pick('~-=')) }}
  var tx=2+((t*26)%(W-4));
  for(var y2=3;y2<H-7;y2++)dot(lay,4,tx,y2,'|');
  INFO='f(x) = A*sin(w*x + phi)   d/dx -> tangent @ x='+tx.toFixed(1);
};
// 4. polar / circle-circumference
SC.polar=function(lay,t){
  for(var k=0;k<3;k++){var rr=8+k*4+Math.sin(t*2+k)*2;
    for(var i=0;i<160;i++){var th=i/160*6.2832;
      dot(lay,k?2:3,CX+Math.cos(th)*rr/AR,CY-3+Math.sin(th)*rr,k?'.':'o')}}
  var n=7;
  for(var i2=0;i2<n;i2++){var th2=t*1.2+i2/n*6.2832;
    line3(lay,4,[CX,CY-3],[CX+Math.cos(th2)*18/AR,CY-3+Math.sin(th2)*18],'+')}
  INFO='C = 2*pi*r   r='+(8+Math.sin(t*2)*2).toFixed(2);
};
// 5. concentric pulse rings (chorus)
SC.rings=function(lay,t){
  for(var y=2;y<H-7;y++)for(var x=2;x<W-2;x++){
    var dx=(x-CX)*AR,dy=y-(CY-3);var d=Math.sqrt(dx*dx+dy*dy);
    var v=Math.sin(d*0.85-t*7)*0.5+0.5;
    v*=Math.max(0,1-d/30);
    var ci=(v*9)|0;if(ci<2)continue;
    dot(lay,ci>6?3:2,x,y,SH[ci])}
  INFO='while(true) { if(can) execute(satisfaction); }';
};
// 6. matrix code rain
var cols=null;
SC.matrix=function(lay,t){
  if(!cols){cols=[];for(var i=0;i<W;i++)cols.push({y:R(-H,0),v:R(0.25,1.1),l:(R(5,16))|0})}
  for(var x=2;x<W-2;x++){var c=cols[x];c.y+=c.v;
    if(c.y-c.l>H-7){c.y=R(-12,0);c.v=R(0.25,1.1)}
    for(var k=0;k<c.l;k++){var y=(c.y-k)|0;if(y<2||y>H-8)continue;
      dot(lay,k===0?3:(k<3?2:0),x,y,pick('01ABCDEF<>/\\|{}[]$#*'))}}
  INFO='/* trapped in this strange, strange simulation */';
};
// 7. fragment erase
var frags=null;
SC.frag=function(lay,t){
  if(!frags){frags=[];for(var i=0;i<200;i++)frags.push({x:R(3,W-4),y:R(3,H-8),c:pick('#*+=%@'),a:1})}
  for(var i2=0;i2<frags.length;i2++){var f2=frags[i2];
    f2.x+=Math.sin(t+i2)*0.25;f2.y-=0.06;f2.a-=0.0035;
    if(f2.a>0.05)dot(lay,f2.a>0.6?3:(f2.a>0.3?2:0),f2.x,f2.y,f2.c)}
  INFO='rm -rf ./pointless_fragments/*   ILLEGAL ARGUMENT';
};
// 8. EXECUTION strobe
SC.exec=function(lay,t){
  var ph=(t*3.1)%1;
  if(ph<0.5){var w=bigWidth('EXECUTION');bigDraw(lay,(t*6|0)%2?4:3,'EXECUTION',Math.round(CX-w/2),CY-8,'#')}
  else{for(var i=0;i<400;i++)dot(lay,0,R(2,W-2),R(2,H-8),pick('01'))}
  for(var y=2;y<H-7;y+=3){if(y>=CY-9&&y<=CY-2)continue;
    put(lay[2],2+((t*40+y*7)%(W-30))|0,y,'>> execute() >>')}
  if(ph<0.06){pulse(1.4);shk=0.3}
};
// 9. finale: trapped heart
SC.final=function(lay,t){
  for(var y=2;y<H-7;y++)for(var x=2;x<W-2;x++){
    var dx=(x-CX)*AR/9,dy=(y-(CY-4))/7;
    var f3=Math.pow(dx*dx+dy*dy-1,3)-dx*dx*dy*dy*dy;
    if(f3<0){var e=Math.abs(f3);dot(lay,e<0.25?3:2,x,y,e<0.25?'#':'.')}}
  var w=bigWidth('LOVE');bigDraw(lay,4,'LOVE',Math.round(CX-w/2),H-14,'#');
  INFO='algebraic_expression_of(love) => trapped';
  if((t*2|0)%2===0)pulse(0.7);
};
