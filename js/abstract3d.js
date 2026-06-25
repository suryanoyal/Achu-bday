/* ╔══════════════════════════════════════════════════════════════╗
   ║  ABSTRACT 3D ANIMATION ENGINE v2.0                         ║
   ║  Dodecahedron · Toroidal Knot · Volumetric Glow            ║
   ║  Mouse Orbit · Force Field · Bloom Rendering               ║
   ╚══════════════════════════════════════════════════════════════╝ */

const Abstract3D = (() => {
  let canvas, ctx;
  let animId;
  let active = false;
  let time = 0;

  // Mouse / camera state
  const mouse = { x: 0.5, y: 0.5, smoothX: 0.5, smoothY: 0.5 };
  const camera = { rotX: 0.3, rotY: 0, targetRotX: 0.3, targetRotY: 0 };

  // Color palette
  const GOLD = { r: 212, g: 175, b: 55 };
  const GOLD_LIGHT = { r: 232, g: 213, b: 163 };
  const ROSE_GOLD = { r: 210, g: 150, b: 120 };
  const CHAMPAGNE = { r: 220, g: 200, b: 150 };
  const WHITE_WARM = { r: 245, g: 240, b: 232 };

  // Scene objects
  let geometries = [];
  let volumetricRays = [];
  let floatingParticles = [];
  let glowPulse = 0;

  function init() {
    canvas = document.getElementById('abstract-3d-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createScene();
    bindEvents();
    active = true;
    animate();
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function bindEvents() {
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    });
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX / window.innerWidth;
        mouse.y = e.touches[0].clientY / window.innerHeight;
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════════
     3D MATH
     ═══════════════════════════════════════════════════════════════ */
  function rotateX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }
  function rotateY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
  }
  function rotateZ(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
  }

  function project(point, cx, cy, fov) {
    const scale = fov / (fov + point.z);
    return { x: point.x * scale + cx, y: point.y * scale + cy, scale, z: point.z };
  }

  function dist3D(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }

  /* ═══════════════════════════════════════════════════════════════
     GEOMETRY GENERATORS
     ═══════════════════════════════════════════════════════════════ */

  /** Dodecahedron — 12 pentagonal faces, 20 vertices */
  function generateDodecahedron(radius) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const invPhi = 1 / phi;

    const rawVertices = [
      // Cube vertices
      { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: -1 },
      { x: 1, y: -1, z: 1 }, { x: 1, y: -1, z: -1 },
      { x: -1, y: 1, z: 1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }, { x: -1, y: -1, z: -1 },
      // Rectangle vertices (0, ±1/φ, ±φ)
      { x: 0, y: invPhi, z: phi }, { x: 0, y: invPhi, z: -phi },
      { x: 0, y: -invPhi, z: phi }, { x: 0, y: -invPhi, z: -phi },
      // (±1/φ, ±φ, 0)
      { x: invPhi, y: phi, z: 0 }, { x: invPhi, y: -phi, z: 0 },
      { x: -invPhi, y: phi, z: 0 }, { x: -invPhi, y: -phi, z: 0 },
      // (±φ, 0, ±1/φ)
      { x: phi, y: 0, z: invPhi }, { x: phi, y: 0, z: -invPhi },
      { x: -phi, y: 0, z: invPhi }, { x: -phi, y: 0, z: -invPhi },
    ];

    // Normalize and scale
    const vertices = rawVertices.map(v => {
      const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return { x: (v.x / len) * radius, y: (v.y / len) * radius, z: (v.z / len) * radius };
    });

    // Edges for dodecahedron
    const edges = [];
    const edgeLen = 2 * invPhi * radius / Math.sqrt(invPhi * invPhi + phi * phi + 1);
    const threshold = edgeLen * 1.35;

    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const d = dist3D(vertices[i], vertices[j]);
        if (d < threshold) {
          edges.push([i, j]);
        }
      }
    }

    return { vertices, edges };
  }

  /** Toroidal Knot — parametric curve */
  function generateToroidalKnot(R, r, p, q, segments) {
    const vertices = [];
    const edges = [];

    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const rr = R + r * Math.cos(q * t);
      vertices.push({
        x: rr * Math.cos(p * t),
        y: rr * Math.sin(p * t),
        z: r * Math.sin(q * t),
      });
      edges.push([i, (i + 1) % segments]);
    }

    return { vertices, edges };
  }

  /** Icosahedron (kept as accent geometry) */
  function generateIcosahedron(radius) {
    const t = (1 + Math.sqrt(5)) / 2;
    const vertices = [
      { x: -1, y: t, z: 0 }, { x: 1, y: t, z: 0 },
      { x: -1, y: -t, z: 0 }, { x: 1, y: -t, z: 0 },
      { x: 0, y: -1, z: t }, { x: 0, y: 1, z: t },
      { x: 0, y: -1, z: -t }, { x: 0, y: 1, z: -t },
      { x: t, y: 0, z: -1 }, { x: t, y: 0, z: 1 },
      { x: -t, y: 0, z: -1 }, { x: -t, y: 0, z: 1 },
    ];
    const len = Math.sqrt(1 + t * t);
    vertices.forEach(v => { v.x = (v.x / len) * radius; v.y = (v.y / len) * radius; v.z = (v.z / len) * radius; });

    const edges = [
      [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
      [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
      [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],[7,8],[7,10],[8,9],[10,11],
    ];
    return { vertices, edges };
  }

  /** Octahedron */
  function generateOctahedron(radius) {
    const vertices = [
      { x: 0, y: radius, z: 0 }, { x: 0, y: -radius, z: 0 },
      { x: radius, y: 0, z: 0 }, { x: -radius, y: 0, z: 0 },
      { x: 0, y: 0, z: radius }, { x: 0, y: 0, z: -radius },
    ];
    const edges = [
      [0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[4,3],[3,5],[5,2],
    ];
    return { vertices, edges };
  }

  /* ═══════════════════════════════════════════════════════════════
     SCENE CREATION
     ═══════════════════════════════════════════════════════════════ */
  function createScene() {
    geometries = [];

    // ─── Hero: Toroidal Knot (center) ───
    const knot = generateToroidalKnot(70, 25, 2, 3, 120);
    geometries.push({
      ...knot,
      cx: 0.5, cy: 0.48,
      rotSpeed: { x: 0.004, y: 0.006, z: 0.002 },
      rotation: { x: 0.8, y: 0.3, z: 0 },
      opacity: 0.12,
      color: ROSE_GOLD,
      glowColor: CHAMPAGNE,
      lineWidth: 0.8,
      fov: 600,
      parallaxFactor: 0.04,
      vertexGlow: false,
      bloom: false,
    });

    // ─── Accent: Icosahedron (right) ───
    const ico = generateIcosahedron(45);
    geometries.push({
      ...ico,
      cx: 0.82, cy: 0.28,
      rotSpeed: { x: 0.007, y: 0.004, z: 0.005 },
      rotation: { x: 0, y: 0.5, z: 0.3 },
      opacity: 0.08,
      color: CHAMPAGNE,
      glowColor: GOLD_LIGHT,
      lineWidth: 0.6,
      fov: 400,
      parallaxFactor: 0.06,
      vertexGlow: true,
      vertexGlowSize: 2,
      bloom: false,
    });

    // ─── Accent: Octahedron (left) ───
    const oct = generateOctahedron(35);
    geometries.push({
      ...oct,
      cx: 0.15, cy: 0.7,
      rotSpeed: { x: -0.005, y: 0.008, z: 0.003 },
      rotation: { x: 1.2, y: 0.5, z: 0 },
      opacity: 0.06,
      color: WHITE_WARM,
      glowColor: GOLD,
      lineWidth: 0.5,
      fov: 350,
      parallaxFactor: 0.07,
      vertexGlow: true,
      vertexGlowSize: 2.5,
      bloom: false,
    });

    // ─── Create volumetric rays ───
    createVolumetricRays();

    // ─── Create enhanced particles ───
    createFloatingParticles();
  }

  function createVolumetricRays() {
    volumetricRays = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      volumetricRays.push({
        angle,
        length: 0.25 + Math.random() * 0.2,
        width: 1 + Math.random() * 1.5,
        opacity: 0.015 + Math.random() * 0.015,
        speed: 0.002 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function createFloatingParticles() {
    floatingParticles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      floatingParticles.push({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 300 - 150,
        size: Math.random() * 1.8 + 0.3,
        speedY: -(Math.random() * 0.0003 + 0.0001),
        speedX: (Math.random() - 0.5) * 0.0002,
        opacity: Math.random() * 0.3 + 0.05,
        opacityDir: (Math.random() - 0.5) * 0.002,
        hue: 35 + Math.random() * 15,
        saturation: 45 + Math.random() * 30,
        forceX: 0,
        forceY: 0,
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     ANIMATION LOOP
     ═══════════════════════════════════════════════════════════════ */
  function animate() {
    if (!active) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);
    time += 0.016;
    glowPulse = Math.sin(time * 0.8) * 0.5 + 0.5;

    // Smooth mouse
    mouse.smoothX += (mouse.x - mouse.smoothX) * 0.05;
    mouse.smoothY += (mouse.y - mouse.smoothY) * 0.05;

    // Camera orbit from mouse
    camera.targetRotY = (mouse.smoothX - 0.5) * 0.6;
    camera.targetRotX = 0.3 + (mouse.smoothY - 0.5) * 0.4;
    camera.rotX += (camera.targetRotX - camera.rotX) * 0.03;
    camera.rotY += (camera.targetRotY - camera.rotY) * 0.03;

    // Draw layers back to front
    drawVolumetricRays(w, h);
    drawFloatingParticles(w, h);
    drawGeometries(w, h);
    drawConstellationLines(w, h);
    drawCenterGlow(w, h);

    animId = requestAnimationFrame(animate);
  }

  /* ─── Center Glow (lightweight) ──────────────────────────────── */
  function drawCenterGlow(w, h) {
    const cx = w * 0.5;
    const cy = h * 0.48;
    const radius = Math.min(w, h) * 0.18;
    const alpha = 0.03 + glowPulse * 0.015;

    ctx.fillStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ─── Volumetric Rays ────────────────────────────────────────── */
  function drawVolumetricRays(w, h) {
    const cx = w * 0.5;
    const cy = h * 0.48;

    volumetricRays.forEach(ray => {
      ray.angle += ray.speed;
      const currentOpacity = ray.opacity * (0.7 + Math.sin(time * 1.5 + ray.phase) * 0.3);

      const len = Math.min(w, h) * ray.length;
      const endX = cx + Math.cos(ray.angle) * len;
      const endY = cy + Math.sin(ray.angle) * len;

      const grad = ctx.createLinearGradient(cx, cy, endX, endY);
      grad.addColorStop(0, `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${currentOpacity})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = ray.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
  }

  /* ─── Geometries ─────────────────────────────────────────────── */
  function drawGeometries(w, h) {
    geometries.forEach(geo => {
      // Update rotation
      geo.rotation.x += geo.rotSpeed.x;
      geo.rotation.y += geo.rotSpeed.y;
      geo.rotation.z += geo.rotSpeed.z;

      // Orbit (for toroidal knot)
      if (geo.orbitAngle !== undefined) {
        geo.orbitAngle += geo.orbitSpeed;
      }

      // Parallax + camera offset
      const px = (mouse.smoothX - 0.5) * geo.parallaxFactor * w;
      const py = (mouse.smoothY - 0.5) * geo.parallaxFactor * h;
      const cx = geo.cx * w + px;
      const cy = geo.cy * h + py;

      // Transform vertices
      const projected = geo.vertices.map(v => {
        // Self rotation
        let p = rotateX(v, geo.rotation.x);
        p = rotateY(p, geo.rotation.y);
        p = rotateZ(p, geo.rotation.z);

        // Camera rotation
        p = rotateX(p, camera.rotX * 0.3);
        p = rotateY(p, camera.rotY * 0.3);

        return project(p, cx, cy, geo.fov);
      });

      // Draw soft glow layer (wider, dimmer edges — no expensive blur filter)
      if (geo.bloom) {
        drawEdges(geo, projected, geo.glowColor || geo.color, geo.opacity * 0.3, geo.lineWidth * 2.5);
      }

      // Draw sharp edges
      drawEdges(geo, projected, geo.color, geo.opacity, geo.lineWidth);

      // Draw vertex glow dots
      if (geo.vertexGlow) {
        drawVertexGlow(projected, geo);
      }
    });
  }

  function drawEdges(geo, projected, color, opacity, lineWidth) {
    ctx.lineCap = 'round';

    geo.edges.forEach(([a, b]) => {
      const pa = projected[a];
      const pb = projected[b];
      if (!pa || !pb) return;

      const avgZ = (pa.z + pb.z) / 2;
      const depthFade = Math.max(0, Math.min(1, 1 - avgZ / 500));
      const alpha = opacity * depthFade;
      if (alpha < 0.005) return;

      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.lineWidth = lineWidth * Math.max(0.5, (pa.scale + pb.scale) / 2);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });
  }

  function drawVertexGlow(projected, geo) {
    const gc = geo.glowColor || geo.color;
    projected.forEach(p => {
      const depthFade = Math.max(0, Math.min(1, 1 - p.z / 500));
      const alpha = geo.opacity * depthFade * (0.8 + glowPulse * 0.4);
      if (alpha < 0.02) return;

      const size = (geo.vertexGlowSize || 2) * p.scale;

      // Simple dot (no expensive radial gradient)
      ctx.fillStyle = `rgba(${gc.r}, ${gc.g}, ${gc.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.8, size), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ─── Floating Particles (with mouse force field) ─────────── */
  function drawFloatingParticles(w, h) {
    const mouseWorldX = mouse.smoothX;
    const mouseWorldY = mouse.smoothY;
    const forceRadius = 0.12;

    floatingParticles.forEach(p => {
      // Mouse force field
      const dx = p.x - mouseWorldX;
      const dy = p.y - mouseWorldY;
      const distSq = dx * dx + dy * dy;
      const frSq = forceRadius * forceRadius;

      if (distSq < frSq && distSq > 0.000001) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / forceRadius) * 0.002;
        p.forceX += (dx / dist) * force;
        p.forceY += (dy / dist) * force;
      }

      // Apply forces with damping
      p.x += p.speedX + p.forceX;
      p.y += p.speedY + p.forceY;
      p.forceX *= 0.92;
      p.forceY *= 0.92;

      // Opacity breathing
      p.opacity += p.opacityDir;
      if (p.opacity <= 0.03 || p.opacity >= 0.35) p.opacityDir *= -1;

      // Wrap around
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      // Simple dot rendering (no radial gradients)
      ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 70%, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ─── Constellation Lines ────────────────────────────────────── */
  function drawConstellationLines(w, h) {
    const maxDist = 90;
    const maxDistSq = maxDist * maxDist;
    const maxLines = 10;
    let lineCount = 0;

    ctx.lineWidth = 0.4;
    for (let i = 0; i < floatingParticles.length && lineCount < maxLines; i++) {
      for (let j = i + 1; j < floatingParticles.length && lineCount < maxLines; j++) {
        const a = floatingParticles[i];
        const b = floatingParticles[j];

        const ddx = (a.x - b.x) * w;
        const ddy = (a.y - b.y) * h;
        const distSq = ddx * ddx + ddy * ddy;

        if (distSq < maxDistSq && distSq > 625) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / maxDist) * 0.04 * Math.min(a.opacity, b.opacity) * 10;
          if (alpha < 0.003) continue;

          ctx.strokeStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
          lineCount++;
        }
      }
    }
  }

  /* ─── Cleanup ────────────────────────────────────────────────── */
  function destroy() {
    active = false;
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  }

  return { init, destroy };
})();
