/* main.js - simple interactive canvas background and minor UI helpers
   - Lightweight particle system that reacts to mouse movement
   - Respects prefers-reduced-motion
*/
(function(){
  const canvas = document.getElementById('bg-canvas');
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
    if(prefersReduced) { ctx.clearRect(0,0,w,h); return; }
    ctx.clearRect(0,0,w,h);
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
    if(prefersReduced) return;

    const globalMouse = {x:-9999,y:-9999};
    window.addEventListener('mousemove', (e)=>{ globalMouse.x = e.clientX; globalMouse.y = e.clientY; });

    document.querySelectorAll('.geom-canvas').forEach(canvas => {
      const ctx = canvas.getContext('2d');
      let dpr = Math.max(1, window.devicePixelRatio || 1);

      function resize(){
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }

      let particles = [];
      const N = 12; // slightly denser
      function initParticles(){
        particles = [];
        const rect = canvas.getBoundingClientRect();
        for(let i=0;i<N;i++){
          particles.push({
            theta: Math.random()*Math.PI*2,
            phi: Math.random()*Math.PI*2,
            R: Math.max(rect.width, rect.height)*0.16 + Math.random()*10,
            r: 1 + Math.random()*3,
            baseT: (0.5 + Math.random()*1.6) * (Math.random()<0.5?1:-1) * 0.004,
            baseP: (0.5 + Math.random()*1.6) * (Math.random()<0.5?1:-1) * 0.005,
            vx: (Math.random()-0.5)*0.6,
            vy: (Math.random()-0.5)*0.6,
            jitterAmp: 0.6 + Math.random()*1.4,
            damping: 0.86 + Math.random()*0.12
          });
        }
      }

      resize();
      initParticles();

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

      let rafId = null;
      function draw(){
        const rect = canvas.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        ctx.clearRect(0,0,w,h);
        const cx = w/2, cy = h/2;
        const pts = [];

        // compute proximity modifier based on mouse distance to canvas center
        const mx = globalMouse.x, my = globalMouse.y;
        const dxm = mx - (rect.left + cx), dym = my - (rect.top + cy);
        const dist = Math.hypot(dxm,dym);
        const maxDist = 520;
        const proximity = Math.max(0, 1 - dist / maxDist);

        for(let p of particles){
          // speed scales with proximity (add small randomized jitter)
          const jitterNoise = (Math.random()-0.5) * 0.0004;
          const speedT = p.baseT * (1 + proximity * 4) + jitterNoise;
          const speedP = p.baseP * (1 + proximity * 4) + jitterNoise;
          p.theta += speedT;
          p.phi += speedP;
          const x3 = (p.R + p.r*Math.cos(p.phi)) * Math.cos(p.theta);
          const y3 = (p.R + p.r*Math.cos(p.phi)) * Math.sin(p.theta);
          const z3 = p.r * Math.sin(p.phi);
          const f = Math.min(140, Math.max(60, Math.hypot(w,h)));
          const scale = f / (f + z3);
          let x2 = cx + x3 * scale;
          let y2 = cy + y3 * scale * 0.8;
          // velocity jitter affected by proximity for more dynamic motion (reduced)
          p.vx += (Math.random()-0.5) * 0.35 * p.jitterAmp * (0.6 + proximity);
          p.vy += (Math.random()-0.5) * 0.35 * p.jitterAmp * (0.6 + proximity);
          // occasional small burst for randomness (reduced)
          if(Math.random() < 0.002 + proximity*0.005){ p.vx += (Math.random()-0.5)*1.0; p.vy += (Math.random()-0.5)*1.0 }
          p.vx *= p.damping; p.vy *= p.damping;
          x2 += p.vx; y2 += p.vy;
          pts.push({x:x2,y:y2,s:Math.max(0.5, 1.4*scale)});
        }

        // stronger connections with accent color
        for(let i=0;i<pts.length;i++){
          for(let j=i+1;j<pts.length;j++){
            const a=pts[i], b=pts[j];
            const dx=a.x-b.x, dy=a.y-b.y; const d=Math.hypot(dx,dy);
            if(d<80){
              ctx.beginPath();
              const lineAlpha = 0.95*(1-d/80);
              ctx.strokeStyle = 'rgba(255,255,255,' + lineAlpha + ')';
              ctx.lineWidth = 1.8;
              ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
            }
          }
        }

        // particles
        for(let pt of pts){
          ctx.beginPath(); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.arc(pt.x,pt.y,pt.s,0,Math.PI*2); ctx.fill();
        }

        rafId = requestAnimationFrame(draw);
      }

      const ro = new ResizeObserver(() => { resize(); initParticles(); });
      ro.observe(canvas);

      // pause on hidden
      document.addEventListener('visibilitychange', () => {
        if(document.hidden && rafId) cancelAnimationFrame(rafId);
        if(!document.hidden) draw();
      });

      draw();
    });
  });
})();
