/* ╔══════════════════════════════════════════════════════════════╗
   ║  CUSTOM CURSOR — Glowing Gold Orb + Particle Trail        ║
   ║  Mouse-reactive · Touch-aware · Performance-optimized     ║
   ╚══════════════════════════════════════════════════════════════╝ */

const GoldCursor = (() => {
  let canvas, ctx;
  let animId;
  let active = false;
  let isMobile = false;

  // Cursor state
  const cursor = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    visible: false,
    scale: 1,
    targetScale: 1,
  };

  // Trail particles
  const trail = [];
  const MAX_TRAIL = 12;
  const TRAIL_SPAWN_RATE = 3; // frames between spawns
  let frameCount = 0;

  // Ripple effects
  const ripples = [];

  function init() {
    // Detect mobile
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
               || ('ontouchstart' in window && window.innerWidth < 1024);

    if (isMobile) return; // No custom cursor on mobile

    canvas = document.getElementById('cursor-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resize();
    bindEvents();
    active = true;

    // Hide default cursor on the countdown overlay
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) {
      overlay.style.cursor = 'none';
    }

    animate();
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function bindEvents() {
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
      cursor.targetX = e.clientX;
      cursor.targetY = e.clientY;
      cursor.visible = true;
    });

    document.addEventListener('mouseenter', () => {
      cursor.visible = true;
    });

    document.addEventListener('mouseleave', () => {
      cursor.visible = false;
    });

    // Scale up on interactive elements
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (target.closest('.countdown-value-wrapper') || 
          target.closest('.enter-capsule-btn') ||
          target.closest('.test-bypass-btn') ||
          target.closest('button') ||
          target.closest('a')) {
        cursor.targetScale = 1.8;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      if (target.closest('.countdown-value-wrapper') || 
          target.closest('.enter-capsule-btn') ||
          target.closest('.test-bypass-btn') ||
          target.closest('button') ||
          target.closest('a')) {
        cursor.targetScale = 1;
      }
    });

    // Click ripple
    document.addEventListener('click', (e) => {
      addRipple(e.clientX, e.clientY);
    });
  }

  function addRipple(x, y) {
    ripples.push({
      x, y,
      radius: 5,
      maxRadius: 60,
      opacity: 0.6,
      speed: 3,
    });
  }

  function spawnTrailParticle() {
    if (trail.length >= MAX_TRAIL) return;

    trail.push({
      x: cursor.x + (Math.random() - 0.5) * 4,
      y: cursor.y + (Math.random() - 0.5) * 4,
      size: Math.random() * 3 + 1.5,
      opacity: 0.5 + Math.random() * 0.3,
      decay: 0.015 + Math.random() * 0.01,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      hue: 38 + Math.random() * 10,
    });
  }

  function animate() {
    if (!active) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!cursor.visible) {
      animId = requestAnimationFrame(animate);
      return;
    }

    // Smooth cursor follow (eased)
    const ease = 0.15;
    cursor.x += (cursor.targetX - cursor.x) * ease;
    cursor.y += (cursor.targetY - cursor.y) * ease;
    cursor.scale += (cursor.targetScale - cursor.scale) * 0.1;

    frameCount++;

    // Spawn trail particles
    if (frameCount % TRAIL_SPAWN_RATE === 0) {
      spawnTrailParticle();
    }

    // ─── Draw trail particles ───
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= p.decay;
      p.size *= 0.97;

      if (p.opacity <= 0 || p.size < 0.3) {
        trail.splice(i, 1);
        continue;
      }

      // Simple glow dot (no radial gradient)
      ctx.globalAlpha = p.opacity * 0.15;
      ctx.fillStyle = `hsl(${p.hue}, 65%, 65%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = `hsl(${p.hue}, 65%, 75%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ─── Draw ripples ───
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.opacity -= 0.015;

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = `hsla(42, 60%, 65%, ${r.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ─── Draw main cursor orb (simplified) ───
    const orbSize = 8 * cursor.scale;

    // Outer glow (simple circle with low alpha)
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = 'hsl(42, 60%, 65%)';
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, orbSize * 4, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'hsl(42, 70%, 75%)';
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, orbSize * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Core orb
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'hsl(42, 75%, 85%)';
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, orbSize, 0, Math.PI * 2);
    ctx.fill();

    // Bright center dot
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'hsl(42, 80%, 95%)';
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 2 * cursor.scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;

    animId = requestAnimationFrame(animate);
  }

  function destroy() {
    active = false;
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);

    // Restore default cursor
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) {
      overlay.style.cursor = '';
    }
  }

  /** Get current cursor position (for other systems to react to) */
  function getPosition() {
    return { x: cursor.x, y: cursor.y };
  }

  return { init, destroy, getPosition };
})();
