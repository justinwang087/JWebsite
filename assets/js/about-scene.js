(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const isAboutPage = document.body.classList.contains('about-page') || /about\.html$/i.test(location.pathname);

  let width = 0;
  let height = 0;
  let particles = [];
  let polyhedron = null;

  const mouse = { x: 0, y: 0, active: false };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.35, 0.35),
      r: rand(0.8, 2.4)
    };
  }

  function initializeParticles() {
    particles = Array.from({ length: 70 }, createParticle);
  }

  function initializeDodecahedron() {
    if (!isAboutPage) {
      polyhedron = null;
      return;
    }

    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [
      { x: -1, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: -1, y: -1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: -1, y: 1, z: -1 },
      { x: 1, y: 1, z: -1 },
      { x: -1, y: -1, z: -1 },
      { x: 1, y: -1, z: -1 },
      { x: 0, y: 1 / phi, z: phi },
      { x: 0, y: -1 / phi, z: phi },
      { x: 0, y: 1 / phi, z: -phi },
      { x: 0, y: -1 / phi, z: -phi },
      { x: phi, y: 0, z: 1 / phi },
      { x: -phi, y: 0, z: 1 / phi },
      { x: phi, y: 0, z: -1 / phi },
      { x: -phi, y: 0, z: -1 / phi },
      { x: 1 / phi, y: phi, z: 0 },
      { x: -1 / phi, y: phi, z: 0 },
      { x: 1 / phi, y: -phi, z: 0 },
      { x: -1 / phi, y: -phi, z: 0 }
    ];

    const targetLength = 2 * phi;
    const edges = [];

    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const a = vertices[i];
        const b = vertices[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (Math.abs(length - targetLength) < 0.01) {
          edges.push([i, j]);
        }
      }
    }

    const minDimension = Math.min(width, height);
    polyhedron = {
      x: width * 0.78,
      y: height * 0.45,
      radius: Math.min(280, Math.max(140, minDimension * 0.24)),
      vertices,
      edges
    };
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initializeParticles();
    initializeDodecahedron();
  }

  function rotatePoint(point, angleX, angleY, angleZ = 0) {
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);

    const y1 = point.y * cosX - point.z * sinX;
    const z1 = point.y * sinX + point.z * cosX;
    const x1 = point.x * cosY + z1 * sinY;
    const z2 = -point.x * sinY + z1 * cosY;
    const x2 = x1 * cosZ - y1 * sinZ;
    const y2 = x1 * sinZ + y1 * cosZ;

    return { x: x2, y: y2, z: z2 };
  }

  function projectPoints(rotatedPoints, radius) {
    return rotatedPoints.map((point) => {
      const depth = 1.6 + point.z / (radius * 0.9);
      return {
        x: point.x / depth,
        y: point.y / depth
      };
    });
  }

  function drawPolyhedron() {
    if (!polyhedron) return;

    const time = performance.now() * 0.00045;
    const layers = [
      { angleX: time * 0.9, angleY: time * 0.55, angleZ: time * 0.18, scale: 1, alpha: 0.95 },
      { angleX: time * 0.45 + 0.35, angleY: time * 0.32 - 0.4, angleZ: -time * 0.16 + 0.4, scale: 0.84, alpha: 0.65 },
      { angleX: -time * 0.36 + 0.8, angleY: time * 0.4 + 0.25, angleZ: time * 0.2 - 0.3, scale: 0.7, alpha: 0.45 },
      { angleX: time * 0.25 - 0.55, angleY: -time * 0.38 + 0.6, angleZ: -time * 0.22 + 0.2, scale: 0.56, alpha: 0.3 }
    ];

    ctx.save();
    ctx.translate(polyhedron.x, polyhedron.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';

    layers.forEach((layer) => {
      const rotatedPoints = polyhedron.vertices.map((vertex) => rotatePoint(vertex, layer.angleX, layer.angleY, layer.angleZ));
      const projectedPoints = projectPoints(rotatedPoints, polyhedron.radius);
      const scale = polyhedron.radius * 0.72 * layer.scale;

      ctx.globalAlpha = layer.alpha;
      polyhedron.edges.forEach(([from, to]) => {
        const start = projectedPoints[from];
        const end = projectedPoints[to];
        ctx.beginPath();
        ctx.moveTo(start.x * scale, start.y * scale);
        ctx.lineTo(end.x * scale, end.y * scale);
        ctx.stroke();
      });

      projectedPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x * scale, point.y * scale, 1.7 * layer.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();
      });
    });

    ctx.restore();
  }

  function applyMouseForce(particle) {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 160) {
      const strength = ((160 - dist) / 160) * 0.9;
      particle.vx += (dx / (dist || 1)) * strength * 0.03;
      particle.vy += (dy / (dist || 1)) * strength * 0.03;
    }
  }

  function applyPolyhedronGravity(particle) {
    if (!polyhedron) return;

    const dx = polyhedron.x - particle.x;
    const dy = polyhedron.y - particle.y;
    const dist = Math.hypot(dx, dy);
    const influence = polyhedron.radius * 1.8;

    if (dist < influence) {
      const strength = ((influence - dist) / influence) ** 1.6 * 0.046;
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      const tangentX = -ny;
      const tangentY = nx;

      particle.vx += nx * strength;
      particle.vy += ny * strength;
      particle.vx += tangentX * strength * 0.18;
      particle.vy += tangentY * strength * 0.18;
    }
  }

  function updateParticles() {
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) {
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.vx *= -1;
      }

      if (particle.y < 0 || particle.y > height) {
        particle.y = Math.max(0, Math.min(height, particle.y));
        particle.vy *= -1;
      }

      particle.vx *= 0.999;
      particle.vy *= 0.999;
    });

    if (mouse.active) {
      particles.forEach(applyMouseForce);
    }

    if (polyhedron) {
      particles.forEach(applyPolyhedronGravity);
    }
  }

  function drawConnections() {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.8;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 92) {
          const alpha = (1 - dist / 92) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(42, 214, 201, ${alpha})`;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalAlpha = 0.95;
    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.fillStyle = '#2ad6c9';
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (prefersReduced) {
      drawParticles();
      return;
    }

    updateParticles();
    drawConnections();
    drawParticles();
    drawPolyhedron();
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseout', () => {
    mouse.active = false;
  });

  resize();
  render();
})();
