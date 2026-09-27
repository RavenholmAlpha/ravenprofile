// s2.js - verse 1 (0:29-0:58), one visual per lyric line
S(29.28,function(t,lt){for(var i=0;i<900;i++){var a=hash(i)*6.283,b=Math.acos(2*hash(i*1.7)-1),p=proj(rot3([Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)],t*.5,t*.8),60,PX,60);
 var sp=clamp(lt*1.2-hash(i*3)*.8,0,1);bdot(PX+(p[0]-PX)*sp+(hash(i*9)-.5)*200*(1-sp),60+(p[1]-60)*sp+(hash(i*4)-.5)*120*(1-sp),p[2]>1?8:4)}
 txt(4,TOP+2,'P = { (x,y,z) | x,y,z ∈ ℝ }',9);txt(4,TOP+3,'|P| = '+Math.floor(lt*611),4);LB(28,8)});
S(30.89,function(t,lt){var P=wcube(t*.6,t*.9,0,22,PX,50,2);var ax=[[1.8,0,0],[0,-1.8,0],[0,0,1.8]],nm=['x','y','z'],cl=[6,3,4];
 for(var i=0;i<3;i++){var q=proj(rot3(ax[i],t*.6,t*.9),22,PX,50),e=clamp(lt*2-i*.3,0,1);bline(PX,50,PX+(q[0]-PX)*e,50+(q[1]-50)*e,cl[i]);if(e>=1)txt(q[0]/2,q[1]/4,nm[i],cl[i])}
 var d=Math.min(3,1+Math.floor(lt*2));panel(W-30,TOP+2,26,6,'dim()',4,['dimension = '+d+'D','n_vertices = '+[2,4,8][d-1],'return this.dim;'],lt);LB(28,8)});
S(33.01,function(t,lt){var sw=clamp(lt/1.2,0,1)*6.283;for(var r=0;r<5;r++)bcirc(PX,58,20+r*9+KICK*6,r==0?8:r<2?3:1,t*(r%2?1:-1),t*(r%2?1:-1)+sw);
 bline(PX,58,PX+Math.cos(sw)*56,58+Math.sin(sw)*56,5);txt(4,TOP+2,'x² + y² = r²',9);LB(28,8)});
S(34.54,function(t,lt){var r=26,a=clamp(lt/1.8,0,1)*6.283;bcirc(PX-60+a*r,58,r,3);bline(PX-60+a*r,58,PX-60+a*r+Math.cos(-a)*r,58+Math.sin(-a)*r,5);
 bline(PX-60,58+r,PX-60+a*r,58+r,7);txtc(24,'C = 2πr = '+(a*r).toFixed(3),7);LB(28,8)});
S(36.77,function(t,lt){for(var k=0;k<5;k++)for(var x=0;x<W*2;x++){var y=60+Math.sin(x*.035+t*3+k*.7)*(28-k*5)*(0.6+BASS*.6);bdot(x,y,k==0?8:k<2?3:k<3?4:1)}
 txt(4,TOP+2,'f(x) = A·sin(ωx + φ)',9);LB(28,8)});
S(38.27,function(t,lt){for(var x=0;x<W*2;x++)bdot(x,60+Math.sin(x*.04+t)*30,3);for(var k=0;k<4;k++){var x0=(lt*60+k*60)%(W*2),y0=60+Math.sin(x0*.04+t)*30,m=Math.cos(x0*.04+t)*30*.04;
 bline(x0-40,y0-m*40,x0+40,y0+m*40,k?4:5);bcirc(x0,y0,3,8)}txt(4,TOP+2,"f'(x) = Aω·cos(ωx + φ)",9);LB(28,8)});
S(40.36,function(t,lt){bgTunnel(t,1,6);for(var i=0;i<400;i++){var a=i/400*6.283+t,d=1+Math.sin(a)*Math.sin(a),s=70*(1+KICK*.15);bdot(PX+s*Math.cos(a)/d,56+s*Math.sin(a)*Math.cos(a)/d,8)}
 txt(4,TOP+2,'n → ∞',7);txt(4,TOP+3,'n = '+Math.floor(Math.exp(lt*9)),9);LB(28,8)});
S(41.92,function(t,lt){var c=ease(lt/1.5);box(Math.round(c*40),TOP+1,Math.round(W-c*80),BOT-TOP-1,6,'LIMIT','h');
 bigc(8,'LIM',1,function(){return 7});txtc(14,'x → ∞   f(x) = you',8);LB(28,8)});
S(44.04,function(t,lt){for(var x=0;x<W;x++)set(x,CY-2,'─',1);var on=lt>.6;box(CX-10,6,20,9,on?7:9,'SWITCH','d');txtc(9,on?'[ ■ ON  ]':'[ OFF □ ]',on?7:9);
 if(on){pixart(CX-4,11,ART.bolt,PA,1)}LB(26,8)});
S(45.52,function(t,lt){var ac=CU.x.indexOf('DC')<0||lt<.8;box(4,TOP+2,W-8,20,4,'oscilloscope CH1','s');
 for(var x=12;x<W*2-12;x++){var s=Math.sin(x*.06-t*8),y=48+(lt<.8?s:(s>0?1:-1)*(x%80<40?1:1))*24;bdot(x,y,lt<.8?3:7)}
 txt(8,TOP+3,lt<.8?'MODE: AC ~ 60Hz':'MODE: DC ▬ 12V',lt<.8?3:7);LB(26,8)});
S(47.27,function(t,lt){pixart(CX-16,4,ART.eye,PA,2);var n=clamp(lt/1.4,0,1);for(var i=0;i<n*3000;i++){var o=W*(TOP+1)+Math.floor(hash(i+t*99)*W*(BOT-TOP-2));CC[o]=0x2591+Math.floor(hash(i*3+t)*3);CF[o]=9}
 if(n>.9)fill(0,TOP+1,W,BOT-TOP-1,0x2588,0);txtc(26,'vision.blind()',6);LB(28,8)});
S(49.11,function(t,lt){for(var i=0;i<1400;i++){var a=i*.08+t*4,r=i*.09;bdot(PX+Math.cos(a)*r*2,60+Math.sin(a)*r*.9,i%3?4:5)}LB(28,8,{shadow:12})});
S(50.95,function(t,lt){bgStars(t,6,8);LB(28,8)});
S(52.99,function(t,lt){bgStars(t,10,7);var y=Math.floor(2026-lt*1400);bigc(8,(y<0?-y+' BC':y+' AD'),1,function(){return y<0?5:4},null,15);
 txtc(15,bar(clamp(lt/1.7,0,1),60,'◆','·'),9);LB(28,8)});
S(54.74,function(t,lt){var d=60*(1-ease(lt/1.6));bcirc(PX-d-10,58,26,4);bcirc(PX+d+10,58,26,5);if(d<8)wsphere(t,t*.7,36,PX,58,8,8);LB(28,8)});
S(56.79,function(t,lt){donut(t*1.4,t*.8,CX,CY-2,70,34,[15,12,5,8]);LB(28,8)});