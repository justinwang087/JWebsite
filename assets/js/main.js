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
          ctx.globalAlpha = 0.12*(1 - d/120);
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
