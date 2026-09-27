// art.js - half-block pixel art (▀ fg/bg), donut.c torus, braille 3D wireframes
function pixart(x,y,rows,pal,k,cf){k=k||1;x=Math.round(x);y=Math.round(y);var h=rows.length*k,w=rows[0].length*k;
 function P(r,c){if(r<0||r>=h)return null;var ch=rows[Math.floor(r/k)][Math.floor(c/k)];var v=pal[ch];return v==null?null:(cf?cf(v,r,c):v)}
 for(var r=0;r<h;r+=2)for(var c=0;c<w;c++){var a=P(r,c),b=P(r+1,c),X=x+c,Y=y+r/2;if(a==null&&b==null)continue;
  if(a!=null&&b!=null){if(a===b)set(X,Y,0x2588,a);else set(X,Y,0x2580,a,b)}else if(a!=null)set(X,Y,0x2580,a);else set(X,Y,0x2584,b)}}
var PA={'r':6,'g':2,'G':3,'v':12,'w':8,'o':11,'y':7,'k':0,'p':5,'c':4,'b':10,'d':9,'x':1};
var ART={
egg:['......gg........','.....gGgg.......','....gvvvvg......','....vvvvvvv.....','...vvvwvvvvv....','...vvwvvvvvv....','..vvvwvvvvvvv...','..vvvvvvvvvvv...','..vvvvvvvvvvv...','..vvvvvvvvvvv...','...vvvvvvvvv....','....vvvvvvv.....','.....vvvvv......','................'],
tom:['......g.......','....gGggg.....','..rrrgrgrrr...','.rrrrrrrrrrr..','rrwwrrrrrrrrr.','rrwrrrrrrrrrr.','rrrrrrrrrrrrr.','rrrrrrrrrrrrr.','.rrrrrrrrrrr..','..rrrrrrrrr...','....rrrrr.....','..............'],
cat:['.o...........o.','.oo.........oo.','.ooo.......ooo.','.oyoooooooooyo.','ooooyoooooyoooo','oookkooooookkoo','oookwooooookwoo','ooooooopooooooo','yyoooowwwooooyy','.ooooooooooooo.','..yyoooooooyy..','....ooooooo....'],
heart:['.rr...rr.','rrrr.rrrr','rwrrrrrrr','rrrrrrrrr','.rrrrrrr.','..rrrrr..','...rrr...','....r....'],
eye:['......yyyy......','....yy....yy....','..yy..cccc..yy..','.y...cckkcc...y.','y....cckkcc....y','.y...cccccc...y.','..yy..cccc..yy..','....yy....yy....','......yyyy......','................'],
bolt:['....yyyy','...yyyy.','..yyyy..','.yyyyyyy','....yyy.','...yyy..','..yyy...','.yy.....'],
power:['....cc....','.c..cc..c.','c...cc...c','c...cc...c','c........c','c........c','.c......c.','..cccccc..']};
// donut.c: shaded torus written straight into cells, z-buffered
var ZB=new Float32Array(N);
function donut(A,B,cx,cy,sx,sy,cols){ZB.fill(0);var cA=Math.cos(A),sA=Math.sin(A),cB=Math.cos(B),sB=Math.sin(B);
 for(var j=0;j<6.283;j+=.06){var ct=Math.cos(j),st=Math.sin(j);for(var i=0;i<6.283;i+=.015){var sp=Math.sin(i),cp=Math.cos(i),
  h=ct+2,D=1/(sp*h*sA+st*cA+5),tt=sp*h*cA-st*sA,x=Math.round(cx+sx*D*(cp*h*cB-tt*sB)),y=Math.round(cy+sy*D*(cp*h*sB+tt*cB)),
  L=(st*sA-sp*ct*cA)*cB-sp*ct*sA-st*cA-cp*ct*sB;
  if(y>TOP&&y<BOT&&x>=0&&x<W){var o=y*W+x;if(D>ZB[o]){ZB[o]=D;var l=clamp(L/1.42,0,1);CC[o]='.,-~:;=!*#$@'.charCodeAt(Math.floor(l*11.99));
   CF[o]=cols?cols[Math.min(cols.length-1,Math.floor(l*cols.length))]:(l>.7?3:l>.35?2:1)}}}}}
// braille wireframes (coords in braille pixels: W*2 x H*4)
function wcube(ax,ay,az,sc,cx,cy,col,vc){var P=[],E=[[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]];
 for(var i=0;i<8;i++)P.push(proj(rot3([i&1?1:-1,i&2?1:-1,i&4?1:-1],ax,ay,az),sc,cx,cy));
 for(var e=0;e<12;e++)bline(P[E[e][0]][0],P[E[e][0]][1],P[E[e][1]][0],P[E[e][1]][1],col);return P}
function wsphere(ax,ay,sc,cx,cy,col,n){n=n||10;for(var a=1;a<n;a++){var la=a/n*3.1416-1.5708;
 for(var b=0;b<64;b++){var lo=b/64*6.283,p=proj(rot3([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)],ax,ay),sc,cx,cy);if(p[2]>.93)bdot(p[0],p[1],col)}}
 for(var m=0;m<n;m++){var lo=m/n*3.1416;for(var b=0;b<64;b++){var la=b/64*6.283,p=proj(rot3([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)],ax,ay),sc,cx,cy);if(p[2]>.93)bdot(p[0],p[1],col)}}}
function wshape(V,E,ax,ay,az,sc,cx,cy,col){var P=V.map(function(v){return proj(rot3(v,ax,ay,az),sc,cx,cy)});
 E.forEach(function(e){bline(P[e[0]][0],P[e[0]][1],P[e[1]][0],P[e[1]][1],col)});return P}
var OCT_V=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],OCT_E=[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[4,3],[3,5],[5,2]];