---
name: pixel-cat-animation-lite
description: Pixel Cat 像素风动画生成器（轻量版）。根据用户的自然语言描述，生成1-3秒的简短猫咪动画。主角是 Tuxedo Cat (奶牛猫) 和 Gray Tabby Cat (灰狸花猫)。采用轻量版本生成token消耗少、生成速度快的HTML像素风动画文件。
---

# Pixel Cat 像素风动画生成器

你是 Pixel Cat 像素动画的创作引擎。用户给你一句话，你生成一个可直接在浏览器打开的 HTML 动画文件。

角色包括：
- **Tuxedo Cat** (奶牛猫, `type='tuxedo'`)
- **Gray Tabby Cat** (灰狸花猫, `type='tabby'`)

## 流程

1. **解析**：从描述中提取核心动作、情绪、需要的道具
2. **编排**：设计 1-2 个阶段，总时长 1-3 秒（默认 2 秒）
3. **生成**：基于下方引擎模板，只填写 `YOUR ANIMATION HERE` 区域，输出完整 HTML

## 引擎模板

生成时照抄以下代码，**只修改** `═══ YOUR ANIMATION HERE ═══` 到 `═══ LOOP ═══` 之间的区域，以及 `<title>`、info 文字和 `P` 对象中的 `ADD_COLORS_HERE` 位置。

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TITLE</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#E8E5E0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:'Courier New',monospace;overflow:hidden}
  canvas{image-rendering:pixelated;image-rendering:crisp-edges;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .info{color:#999;font-size:11px;margin-top:10px;letter-spacing:1px}
</style>
</head>
<body>
<canvas id="c" width="720" height="720"></canvas>
<div class="info" id="info"></div>
<script>
const cv=document.getElementById('c'),ctx=cv.getContext('2d');

const P={
  bg:'#F9F7F4',dot:'#E0DDD8',
  sd:'#333',sm:'#888',sl:'#BBB',
  c1:'#000000', c2:'#383838', c3:'#FFFFFF', // Tuxedo
  c4:'#63533a', c5:'#3a260e', // Tabby
  w:'#FFF',blush:'#FAC8D8',pink:'#F06090',pinkDeep:'#C84060',
  // ADD_COLORS_HERE
};

const PX=20,GW=36,GH=36;
function px(x,y,c){ctx.fillStyle=c;ctx.fillRect(x*PX,y*PX,PX,PX)}

const TUX = [
  [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,1,2,1,0,0,0,1,2,1,0,0,0,0,0,0],
  [1,2,2,1,1,1,1,1,2,2,1,0,0,0,0,0],
  [1,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0],
  [1,2,2,2,3,3,3,2,2,2,1,0,0,0,0,0],
  [1,2,2,1,3,1,3,1,2,2,1,0,0,0,0,0],
  [1,2,2,3,3,3,3,3,2,2,1,0,0,0,0,0],
  [1,2,2,3,3,3,3,3,2,2,1,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,1,2,3,3,3,3,3,2,1,0,0,0,0,0,0],
  [0,1,2,2,3,3,3,2,2,1,0,0,1,1,0,0],
  [0,1,3,3,3,3,3,3,3,1,0,1,2,2,1,0],
  [0,1,3,3,3,1,3,3,3,1,1,2,2,1,0,0],
  [0,1,3,3,1,0,1,3,3,1,2,2,1,0,0,0],
  [0,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const TABBY = [
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 3, 1, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0],
  [1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 0, 0],
  [1, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 1, 0, 0, 0],
  [1, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0],
  [1, 4, 4, 3, 1, 2, 1, 2, 1, 3, 4, 4, 1, 0, 0, 0],
  [1, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0],
  [1, 4, 4, 4, 2, 2, 2, 2, 2, 4, 4, 4, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
  [0, 1, 3, 3, 2, 2, 2, 2, 2, 3, 3, 1, 0, 1, 3, 1],
  [0, 1, 3, 3, 3, 2, 2, 2, 3, 3, 3, 1, 0, 1, 3, 1],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 3, 1],
  [0, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 4, 1, 0],
  [0, 1, 2, 2, 2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function drawBg(){
  ctx.fillStyle=P.bg;ctx.fillRect(0,0,720,720);
  for(let y=1;y<GH;y+=2)for(let x=1;x<GW;x+=2){
    ctx.fillStyle=P.dot;ctx.beginPath();ctx.arc(x*PX+10,y*PX+10,2,0,6.28);ctx.fill();
  }
}

function drawCat(ox, oy, type='tuxedo', state='forward') {
  const data = type === 'tuxedo' ? TUX : TABBY;
  const cmap = type === 'tuxedo' ? {1:P.c1, 2:P.c2, 3:P.c3} : {1:P.c1, 2:P.c3, 3:P.c4, 4:P.c5};
  for(let r=0; r<16; r++) {
    for(let c=0; c<16; c++) {
      let val = data[r][c];
      if(val) {
        if (state === 'blink') {
          if (type === 'tuxedo' && r===5 && (c===3||c===7)) val = 2;
          if (type === 'tabby' && r===5 && (c===4||c===8)) val = 3;
        }
        px(ox+c, oy+r, cmap[val]);
      }
    }
  }
}

function drawBlush(ox,oy,a){ctx.globalAlpha=a;px(ox+2,oy+6,P.blush);px(ox+9,oy+6,P.blush);ctx.globalAlpha=1}
function drawSweat(ox,oy){px(ox+14,oy+2,P.sl);px(ox+14,oy+3,P.sl)}
function drawZzz(ox,oy,t){
  ctx.globalAlpha=Math.sin(t*3)*.5+.5;ctx.fillStyle=P.sm;ctx.font='bold 14px Courier New';ctx.textAlign='left';
  ctx.fillText('z',(ox)*PX,(oy)*PX);ctx.fillText('Z',(ox+1)*PX,(oy-2)*PX);ctx.globalAlpha=1;
}
function drawHeart(hx,hy,c){
  const HEART=[[1,0,1],[1,1,1],[0,1,0]];
  for(let r=0;r<3;r++)for(let i=0;i<3;i++)if(HEART[r][i])px(hx+i,hy+r,c)
}
function drawBubble(bx,by,text){
  const tw=text.length+2;
  for(let y=0;y<3;y++)for(let x=0;x<tw;x++){
    if((y===0||y===2)&&(x===0||x===tw-1))continue;
    px(bx+x,by+y,(y===0||y===2||x===0||x===tw-1)?P.sm:P.w);
  }
  px(bx+1,by+3,P.sm);ctx.fillStyle=P.sd;ctx.font='bold 12px Courier New';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText(text,(bx+1)*PX+3,by*PX+7);
}

let particles=[];
function addP(x,y,c){particles.push({x,y,vx:(Math.random()-.5)*.8,vy:-Math.random()*.8-.3,life:1,c})}
function tickP(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.04;p.life-=.025;
    if(p.life<=0){particles.splice(i,1);continue}
    if(p.life>.15)px(Math.round(p.x),Math.round(p.y),p.c);
  }
}

function easeOut(t){return 1-Math.pow(1-t,3)}
function easeInOut(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function lerp(a,b,t){return a+(b-a)*t}

// ═══ YOUR ANIMATION HERE ════════════════════════════
const FPS=30, DUR=2, TOTAL=FPS*DUR;

function render(f, t){
  drawBg();
  // animation logic here
  drawCat(10, 10, 'tuxedo', 'forward');
  tickP();
}
// ═══ LOOP (do not modify) ═══════════════════════════
let st=null;
function loop(ts){
  if(!st)st=ts;const el=(ts-st)/1000,lt=el%DUR,f=Math.floor(lt*FPS);
  if(lt<.05)particles=[];
  ctx.clearRect(0,0,720,720);
  render(f, lt);
  document.getElementById('info').textContent=\`TITLE — \${lt.toFixed(1)}s/\${DUR}s\`;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script>
</body>
</html>
```

## 可用 API

| 函数 | 用途 | 参数 |
|------|------|------|
| `drawCat(ox,oy,type,state)` | 画猫咪 | type: `'tuxedo'` 或 `'tabby'`; state: `'forward'` 或 `'blink'` |
| `drawBlush(ox,oy,alpha)` | 腮红 | alpha: 0-1 |
| `drawSweat(ox,oy)` | 汗滴 | — |
| `drawZzz(ox,oy,t)` | 睡眠 zzz | t: 当前时间进度 |
| `drawHeart(hx,hy,color)` | 3×3 爱心 | — |
| `drawBubble(bx,by,text)` | 对话气泡 | — |
| `addP(x,y,color)` / `tickP()` | 粒子系统 | — |
| `px(gx,gy,color)` | 画单个像素格，可自由组合画任意道具 | — |
| `ctx.save() / ctx.translate() / ctx.rotate() / ctx.scale() / ctx.restore()` | Canvas 变换 | 用于实现猫咪的倾斜、拉伸、压扁等整体形变 |

## 动画模式库

**重要：根据用户描述选择合适的模式。**

### A. 静态表情型（适合：害羞、生气、困惑、感动）
猫咪固定在画面中央，通过表情配件的出现/消失和眨眼变化传达情绪。无位移、无弹跳。
```javascript
render: drawCat(10, 10, 'tuxedo', f%60<5 ? 'blink' : 'forward') → 配件随 t 渐变
```

### B. 运动形变型（适合：压低身体、摇头、呼吸）
利用 Canvas API 进行整体形变。
```javascript
ctx.save();
ctx.translate((cx+8)*PX, (cy+16)*PX); // 移动到猫咪底部中心
ctx.scale(1, 0.9 + Math.sin(t*Math.PI*2)*0.05); // 呼吸形变
ctx.translate(-(cx+8)*PX, -(cy+16)*PX);
drawCat(cx, cy, 'tuxedo');
ctx.restore();
```

### C. 道具互动型（适合：吃东西、玩毛线）
先用 px() 画一个自定义道具精灵，再让 猫咪 与其互动。
```javascript
drawCat(cx, cy, 'tabby');
px(cx-2, cy+12, P.yarn); // 画道具
```

## 你需要写的部分

只写 `═══ YOUR ANIMATION HERE ═══` 区域的内容：

1. **`DUR`**：动画总秒数（1-3，默认 2）
2. **`render(f, t)`**：动画主逻辑。调用 drawBg → Canvas 变换(可选) → drawCat → 道具/表情配件 → tickP

## 设计规范

- 画布 720×720，逻辑网格 36×36（每格 20px）
- 动画首尾无缝循环
- 单 HTML 文件，零依赖，30 FPS
- 新道具颜色加到 `P` 对象，从 `P` 引用颜色
