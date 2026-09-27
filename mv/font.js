// font.js - 5x5 bitmap font rendered with terminal block glyphs (█ ▀ ▄)
var F5={A:[14,17,31,17,17],B:[30,17,30,17,30],C:[15,16,16,16,15],D:[30,17,17,17,30],E:[31,16,30,16,31],
F:[31,16,30,16,16],G:[15,16,19,17,15],H:[17,17,31,17,17],I:[31,4,4,4,31],J:[7,1,1,17,14],K:[17,18,28,18,17],
L:[16,16,16,16,31],M:[17,27,21,17,17],N:[17,25,21,19,17],O:[14,17,17,17,14],P:[30,17,30,16,16],Q:[14,17,21,18,13],
R:[30,17,30,18,17],S:[15,16,14,1,30],T:[31,4,4,4,4],U:[17,17,17,17,14],V:[17,17,17,10,4],W:[17,17,21,27,17],
X:[17,10,4,10,17],Y:[17,10,4,4,4],Z:[31,2,4,8,31],'0':[14,19,21,25,14],'1':[4,12,4,4,14],'2':[30,1,14,16,31],
'3':[30,1,6,1,30],'4':[18,18,31,2,2],'5':[31,16,30,1,30],'6':[14,16,30,17,14],'7':[31,1,2,4,4],'8':[14,17,14,17,14],
'9':[14,17,15,1,14],' ':[0,0,0,0,0],'.':[0,0,0,0,4],',':[0,0,0,4,8],"'":[4,4,0,0,0],'-':[0,0,14,0,0],'!':[4,4,4,0,4],
'?':[14,17,6,0,4],'(':[2,4,4,4,2],')':[8,4,4,4,8],';':[0,4,0,4,8],'_':[0,0,0,0,31],'=':[0,31,0,31,0],'>':[8,4,2,4,8],
'<':[2,4,8,4,2],'/':[1,2,4,8,16],'+':[0,4,14,4,0],':':[0,4,0,4,0],'*':[0,21,14,21,0],'#':[10,31,10,31,10],'&':[12,18,13,18,13]};
function glyph(ch){return F5[ch]||F5[String(ch).toUpperCase()]||F5[' ']}
function px5(g,r,c){return r<5&&(g[r]>>(4-c))&1}
// k=0: half-block mode (6 cols x 3 rows per char). k>=1: each pixel = 2k cols x k rows (12k x 5k).
function bigW(s,k){return k?s.length*12*k-2*k:s.length*6-1}
function bigH(k){return k?5*k:3}
// colf(i,col,row) -> color index; ch optional char code override
function big(x,y,s,k,colf,ch,shadow){s=String(s).toUpperCase();x=Math.round(x);y=Math.round(y);
 var cf=typeof colf==='function'?colf:function(){return colf};
 for(var i=0;i<s.length;i++){var g=glyph(s[i]);
  if(k){var ox=x+i*12*k;for(var r=0;r<5;r++)for(var c=0;c<5;c++)if(px5(g,r,c))
    for(var a=0;a<k;a++)for(var b=0;b<2*k;b++){var X=ox+c*2*k+b,Y=y+r*k+a;
     if(shadow!=null)set(X+1,Y+1,0x2591,shadow);}
   for(var r=0;r<5;r++)for(var c=0;c<5;c++)if(px5(g,r,c))
    for(var a=0;a<k;a++)for(var b=0;b<2*k;b++){var X=ox+c*2*k+b,Y=y+r*k+a;set(X,Y,ch||0x2588,cf(i,X,Y))}}
  else{var ox=x+i*6;for(var R=0;R<3;R++)for(var c=0;c<5;c++){var u=px5(g,R*2,c),d=px5(g,R*2+1,c);
    if(u||d)set(ox+c,y+R,ch||(u&&d?0x2588:u?0x2580:0x2584),cf(i,ox+c,y+R))}}}}
function bigc(y,s,k,colf,ch,shadow){big(Math.round((W-bigW(String(s),k))/2),y,s,k,colf,ch,shadow)}
// wrap a phrase into lines that fit maxw at size k
function wrapBig(s,k,maxw){var ws=s.split(' '),out=[],cur='';for(var i=0;i<ws.length;i++){var t=cur?cur+' '+ws[i]:ws[i];
 if(bigW(t,k)>maxw&&cur){out.push(cur);cur=ws[i]}else cur=t}if(cur)out.push(cur);return out}
// draw phrase centered, auto-choose biggest size that fits in maxLines
function bigPhrase(y,s,colf,opt){opt=opt||{};var maxw=opt.w||W-4,ks=opt.ks||[1,0],L,k;
 for(var j=0;j<ks.length;j++){k=ks[j];L=wrapBig(s,k,maxw);if(L.length<=(opt.lines||2)&&L.every(function(l){return bigW(l,k)<=maxw}))break}
 var hh=bigH(k)+1,y0=opt.mid?Math.round(y-(L.length*hh-1)/2):y;
 for(var i=0;i<L.length;i++){var ln=L[i];if(opt.reveal!=null){ln=ln.slice(0,Math.max(0,opt.reveal-(i?L.slice(0,i).join(' ').length+1:0)))}
  big(opt.x!=null?opt.x:Math.round((W-bigW(L[i],k))/2),y0+i*hh,ln,k,colf,opt.ch,opt.shadow)}
 return {k:k,lines:L.length,h:L.length*hh-1,y:y0}}