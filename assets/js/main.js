/* main.js - simple interactive canvas background and minor UI helpers
   - Lightweight particle system that reacts to mouse movement
   - Respects prefers-reduced-motion
*/
console.log('[main.js] script loaded');
(function(){
  window.addEventListener('error', (ev) => { console.error('[main.js] runtime error:', ev.message, ev.filename + ':' + ev.lineno); });
  const canvas = document.getElementById('bg-canvas');
  console.log('[main.js] bg-canvas element:', !!canvas);
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w=0,h=0,particles=[];
  const config={count:60,color:'#2ad6c9',maxSize:2.5};
  const prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(min,max){return Math.random()*(max-min)+min}
  function create(){
    particles = [];
    for(let i=0;i<config.count;i++){
      particles.push({x:rand(0,w),y:rand(0,h),vx:rand(-0.3,0.3),vy:rand(-0.3,0.3),r:rand(0.7,config.maxSize)})
    }
  }
  create();

  const mouse = {x:w/2,y:h/2,active:false};
  window.addEventListener('mousemove', (e)=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true});
  window.addEventListener('mouseout', ()=>{mouse.active=false});

  function step(){
    // Always clear first
    ctx.clearRect(0,0,w,h);
    // If user prefers reduced motion, draw a single static background frame and stop.
    if(prefersReduced) {
      // draw a subtle static field of dots
      for(let i=0;i<Math.min(80, particles.length);i++){
        const p = particles[i];
        ctx.beginPath(); ctx.fillStyle = 'rgba(42,214,201,0.12)'; ctx.arc(p.x,p.y,Math.max(0.6,p.r*0.9),0,Math.PI*2); ctx.fill();
      }
      return;
    }
    // draw connections
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx *= -1;
      if(p.y<0||p.y>h) p.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = config.color;
      ctx.globalAlpha = 0.9;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();

      // connect to nearby
      for(let j=i+1;j<particles.length;j++){
        const q = particles[j];
        const dx = p.x-q.x, dy = p.y-q.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d<120){
          ctx.beginPath();
          ctx.strokeStyle = config.color;
          ctx.globalAlpha = 0.42*(1 - d/120);
          ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
    }

    // attraction to mouse
    if(mouse.active){
      particles.forEach(p=>{
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d<160){
          const s = (160-d)/160 * 0.9;
          p.vx += dx/d * s * 0.03;
          p.vy += dy/d * s * 0.03;
        }
      })
    }

    requestAnimationFrame(step);
  }
  step();
})();

// Button label scramble animation triggered on first reveal
(function(){
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  function scrambleText(el){
    const text = el.textContent;
    let frame = 0;
    const totalFrames = Math.max(12, text.length * 3);
    const interval = setInterval(() => {
      const output = text.split('').map((c, i) => {
        if(i < (frame/totalFrames) * text.length) return text[i];
        return chars[Math.floor(Math.random()*chars.length)];
      }).join('');
      el.textContent = output;
      frame++;
      if(frame >= totalFrames){
        clearInterval(interval);
        el.textContent = text;
      }
    }, 30);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        scrambleText(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.5});

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.geom-label').forEach(el => {
      // ensure text is visible
      el.style.visibility = 'visible';
      observer.observe(el);
    });

    // Initialize geom canvases (small particle systems forming a torus-like shape)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    console.log('[geom] prefersReduced=', prefersReduced, 'geom-canvas count=', document.querySelectorAll('.geom-canvas').length);

    const globalMouse = {x:-9999,y:-9999};
    window.addEventListener('mousemove', (e)=>{ globalMouse.x = e.clientX; globalMouse.y = e.clientY; });

    document.querySelectorAll('.geom-canvas').forEach((canvas, index) => {
      const ctx = canvas.getContext('2d');
      let dpr = Math.max(1, window.devicePixelRatio || 1);

      function resize(){
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }

      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4ecdc4';
      function setAlpha(color, a){
        color = (color || '#4ecdc4').trim();
        if(color.charAt(0) === '#'){
          let c = color.slice(1);
          if(c.length === 3) c = c.split('').map(ch=>ch+ch).join('');
          const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
          return 'rgba('+r+','+g+','+b+','+a+')';
        }
        if(color.startsWith('rgba')){
          const parts = color.match(/rgba\(([^)]+)\)/)[1].split(',').map(s=>s.trim());
          return 'rgba('+parts[0]+','+parts[1]+','+parts[2]+','+a+')';
        }
        if(color.startsWith('rgb')){
          const parts = color.match(/rgb\(([^)]+)\)/)[1].split(',').map(s=>s.trim());
          return 'rgba('+parts[0]+','+parts[1]+','+parts[2]+','+a+')';
        }
        return color;
      }

      const solidTemplates = [
        {type:'star', sides:5, radiusScale:0.44, depth:0.16, speed:0.018, alpha:0.88, lineWidth:2.3, color:'#e8f9f5'},
        {type:'frame', sides:4, radiusScale:0.68, depth:0.12, speed:-0.011, alpha:0.72, lineWidth:2.0, color:'#c4f2e7'},
        {type:'complex', sides:6, radiusScale:0.86, depth:0.2, speed:0.008, alpha:0.58, lineWidth:1.7, color:'#abf0e3'},
        {type:'tesseract', sides:8, radiusScale:1.0, depth:0.24, speed:-0.005, alpha:0.45, lineWidth:1.5, color:'#84e7d9'}
      ];

      let solids = [];
      function initSolids(){
        const rect = canvas.getBoundingClientRect();
        const minDim = Math.min(rect.width, rect.height);
        const radius = minDim * 0.38; // smaller so shapes fit comfortably inside
        const radiusOuter = minDim * 0.46;
        const count = 2 + Math.floor(Math.random() * 4); // 2-5 layers
        solids = [];
        for(let i = 0; i < count; i++){
          const cfg = solidTemplates[Math.floor(Math.random() * solidTemplates.length)];
          const baseRadius = cfg.type === 'tesseract' ? radiusOuter : radius;
          solids.push({
            type: cfg.type,
            sides: cfg.sides,
            radius: baseRadius * cfg.radiusScale * (0.82 + Math.random() * 0.22),
            rotation: (Math.PI/6) * i + Math.random() * Math.PI,
            speed: cfg.speed * (index % 2 === 0 ? 1 : -1) * (0.7 + Math.random() * 0.5),
            alpha: Math.max(0.22, cfg.alpha * (0.7 + Math.random() * 0.28)),
            lineWidth: Math.max(0.8, cfg.lineWidth * (0.75 + Math.random() * 0.4)),
            color: cfg.color,
            depth: cfg.depth,
            skew: (Math.random() - 0.5) * 0.12, // reduced skew
            phase: Math.random() * Math.PI * 2,
            layer: i
          });
        }
      }

      function drawPolygon(shape, cx, cy, strokeStyle, offset=0){
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(shape.rotation + offset);
        ctx.beginPath();
        for(let p = 0; p < shape.sides; p++){
          const angle = (Math.PI*2 / shape.sides) * p - Math.PI/2;
          const r = shape.radius * (1 - offset * 0.08);
          const pulse = 1 + Math.sin(angle * 3 + shape.phase) * shape.skew * 0.28;
          const x = Math.cos(angle) * r * pulse;
          const y = Math.sin(angle) * r * (1 + Math.cos(angle * 2 + shape.phase) * shape.skew * 0.18);
          if(p === 0) ctx.moveTo(x,y);
          else ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = shape.lineWidth;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255,255,255,0.18)';
        ctx.stroke();
        ctx.restore();
      }

      function drawTesseract(shape, cx, cy, strokeStyle){
        const n = 8;
        const radius = shape.radius;
        const angleOffset = shape.rotation;
        const pts = [];
        for(let i = 0; i < n; i++){
          const a = (Math.PI*2/n)*i + angleOffset;
          const z4 = Math.sin(a) * radius * 0.32;
          const x = Math.cos(a*1.3) * (radius * 0.82);
          const y = Math.sin(a*1.1) * (radius * 0.82);
          const proj = 1 / (1 + z4 / (radius*2.2));
          pts.push({x: cx + x*proj, y: cy + y*proj - z4*0.04});
        }
        ctx.save();
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = shape.lineWidth;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255,255,255,0.14)';
        for(let i = 0; i < n; i++){
          const a = pts[i], b = pts[(i+1)%n];
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          const c = pts[i < 4 ? i+4 : i-4];
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(c.x,c.y); ctx.stroke();
        }
        ctx.restore();
      }

      function draw(){
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        ctx.clearRect(0,0,w,h);
        const cx = w/2, cy = h/2;

        const mx = globalMouse.x, my = globalMouse.y;
        const dxm = mx - (rect.left + cx), dym = my - (rect.top + cy);
        const dist = Math.hypot(dxm,dym);
        const proximity = Math.max(0, 1 - dist / 280);

        const phase = (performance.now() * 0.00014) % 1;
        const offsetX = w * (phase - 0.5);
        const gradient = ctx.createLinearGradient(offsetX, 0, w + offsetX, 0);
        gradient.addColorStop(0, setAlpha('#8fe1d5', 0.72));
        gradient.addColorStop(0.3, setAlpha(accent, 0.92));
        gradient.addColorStop(0.5, setAlpha('#d4fff5', 0.68));
        gradient.addColorStop(0.7, setAlpha('#8fe1d5', 0.72));
        gradient.addColorStop(1, setAlpha('#aef7e8', 0.62));

        solids.forEach((shape, idx) => {
          shape.rotation += shape.speed * (1 + proximity * 0.7);
          const offset = idx * 0.14;
          if(shape.type === 'tesseract'){
            drawTesseract(shape, cx, cy, gradient);
          } else {
            drawPolygon(shape, cx, cy, gradient, offset);
            if(shape.type === 'star'){
              drawPolygon({...shape, radius: shape.radius * 0.64, lineWidth: shape.lineWidth * 0.9}, cx, cy, gradient, offset + 0.38);
            }
            if(shape.type === 'frame'){
              drawPolygon({...shape, radius: shape.radius * 0.82, lineWidth: shape.lineWidth * 0.75}, cx, cy, gradient, offset + 0.28);
            }
            if(shape.type === 'complex'){
              for(let extra = 1; extra <= 2; extra++){
                drawPolygon({...shape, radius: shape.radius * (0.84 - extra*0.14), lineWidth: shape.lineWidth * 0.75}, cx, cy, gradient, offset + extra*0.22);
              }
            }
          }
        });

        if(!prefersReduced) requestAnimationFrame(draw);
      }

      resize();
      initSolids();
      const rectLog = canvas.getBoundingClientRect();
      console.log('[geom] canvas', index, 'size', rectLog.width, 'x', rectLog.height, 'dpr', dpr);

      const ro = new ResizeObserver(() => { resize(); initSolids(); });
      ro.observe(canvas);

      document.addEventListener('visibilitychange', () => {
        if(document.hidden) return;
        draw();
      });

      draw();
    });
  });
})();
