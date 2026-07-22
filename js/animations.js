/* ╔══════════════════════════════════════════════════════════════╗
   ║  ANIMATIONS ENGINE                                         ║
   ║  Particles · Stars · Moon · Counters · Finale              ║
   ╚══════════════════════════════════════════════════════════════╝ */

const Animations = (() => {
  /* ─── AMBIENT PARTICLE SYSTEM ────────────────────────────── */
  const ParticleSystem = (() => {
    let canvas, ctx;
    let particles = [];
    let animId;
    const PARTICLE_COUNT = 45;

    function init() {
      canvas = document.getElementById('particle-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      createParticles();
      animate();
      window.addEventListener('resize', resize);
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: -Math.random() * 0.4 - 0.1,
          opacity: Math.random() * 0.4 + 0.1,
          opacitySpeed: (Math.random() - 0.5) * 0.005,
          hue: 40 + Math.random() * 15, // Gold hue range
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.opacitySpeed;

        if (p.opacity <= 0.05 || p.opacity >= 0.5) {
          p.opacitySpeed *= -1;
        }

        // Wrap around
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 65%, ${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 65%, ${p.opacity * 0.15})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    }

    function destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    }

    return { init, destroy };
  })();

  /* ─── STAR FIELD ─────────────────────────────────────────── */
  const StarField = (() => {
    let canvas, ctx;
    let stars = [];
    let animId;
    const STAR_COUNT = 200;

    function init() {
      canvas = document.getElementById('star-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      createStars();
      animate();
      window.addEventListener('resize', resize);
    }

    function resize() {
      const section = canvas.parentElement;
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          brightness: Math.random() * 0.5 + 0.3,
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const opacity = star.brightness + Math.sin(star.twinklePhase) * 0.2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 240, 232, ${Math.max(0, opacity)})`;
        ctx.fill();

        // Subtle cross glow for brighter stars
        if (star.size > 1.2) {
          ctx.strokeStyle = `rgba(245, 240, 232, ${opacity * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 3, star.y);
          ctx.lineTo(star.x + star.size * 3, star.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - star.size * 3);
          ctx.lineTo(star.x, star.y + star.size * 3);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(animate);
    }

    function destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    }

    return { init, destroy };
  })();

  /* ─── FINALE PARTICLES ──────────────────────────────────── */
  const FinaleParticles = (() => {
    let canvas, ctx;
    let particles = [];
    let animId;
    let active = false;

    function init() {
      canvas = document.getElementById('finale-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }

    function resize() {
      if (!canvas) return;
      const section = canvas.parentElement;
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    }

    function start() {
      if (active) return;
      active = true;
      createParticles();
      animate();
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3,
          opacity: 1,
          decay: Math.random() * 0.008 + 0.002,
          hue: 35 + Math.random() * 20,
          saturation: 50 + Math.random() * 30,
        });
      }

      // Add continuous slow particles
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: -Math.random() * 0.5 - 0.2,
          opacity: Math.random() * 0.5 + 0.2,
          decay: 0,
          hue: 35 + Math.random() * 20,
          saturation: 50 + Math.random() * 30,
          continuous: true,
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.continuous) {
          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          p.opacity += (Math.random() - 0.5) * 0.02;
          p.opacity = Math.max(0.1, Math.min(0.6, p.opacity));
        } else {
          p.opacity -= p.decay;
          p.speedX *= 0.995;
          p.speedY *= 0.995;
        }

        if (p.opacity <= 0) return;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 65%, ${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 65%, ${p.opacity * 0.1})`;
        ctx.fill();
      });

      // Remove dead non-continuous particles
      particles = particles.filter(p => p.continuous || p.opacity > 0);

      // Respawn continuous particles
      if (active && particles.filter(p => p.continuous).length < 25) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: -Math.random() * 0.5 - 0.2,
          opacity: 0.3,
          decay: 0,
          hue: 35 + Math.random() * 20,
          saturation: 50 + Math.random() * 30,
          continuous: true,
        });
      }

      animId = requestAnimationFrame(animate);
    }

    return { init, start };
  })();

  /* ─── COUNTER ANIMATION ─────────────────────────────────── */
  function animateCounter(element, target, duration = 2000, prefix = '', suffix = '') {
    const startTime = performance.now();
    const startVal = 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startVal + (target - startVal) * eased);

      element.textContent = prefix + current.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ─── REVEAL ON SCROLL (Intersection Observer) ──────────── */
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    document.querySelectorAll('.reveal-item:not(.revealed)').forEach(el => {
      observer.observe(el);
    });

    return observer;
  }


  /* ─── FINALE TRIGGER ────────────────────────────────────── */
  function initFinaleObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            FinaleParticles.start();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    const finale = document.getElementById('final-reveal');
    if (finale) observer.observe(finale);
  }

  /* ─── CELEBRATION CONFETTI (countdown completion blast) ──── */
  const Celebration = (() => {
    let canvas, ctx;
    let particles = [];
    let animId;
    let active = false;

    // Palette: Luxury golds, silver, champagne, rose gold
    const PALETTE = [
      { h: 42, s: 60, l: 65 },  // Gold
      { h: 36, s: 70, l: 75 },  // Champagne
      { h: 20, s: 35, l: 70 },  // Rose Gold
      { h: 45, s: 85, l: 55 },  // Bright Gold
      { h: 0, s: 0, l: 90 },    // Silver / Soft White
    ];

    function init() {
      canvas = document.getElementById('celebration-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function playConfettiSound() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        function triggerPop(delay, frequency, duration, gainVal) {
          const time = ctx.currentTime + delay;
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(frequency, time);
          osc.frequency.exponentialRampToValueAtTime(frequency * 0.1, time + duration);
          
          gainNode.gain.setValueAtTime(gainVal, time);
          gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
          
          osc.start(time);
          osc.stop(time + duration);
        }

        function triggerNoiseBurst(delay, duration, filterFreq, gainVal) {
          const time = ctx.currentTime + delay;
          const bufferSize = ctx.sampleRate * duration;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          
          const noiseNode = ctx.createBufferSource();
          noiseNode.buffer = buffer;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(filterFreq, time);
          filter.frequency.exponentialRampToValueAtTime(filterFreq * 0.5, time + duration);
          
          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(gainVal, time);
          gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);
          
          noiseNode.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          noiseNode.start(time);
          noiseNode.stop(time + duration);
        }

        // 1. Primary main pops (representing the two initial poppers blasting)
        triggerPop(0, 160, 0.25, 0.7);
        triggerNoiseBurst(0, 0.45, 1200, 0.5);

        triggerPop(0.02, 140, 0.22, 0.7);
        triggerNoiseBurst(0.02, 0.4, 1000, 0.5);

        // 2. Secondary scatter pops (creating the crackle/flutter sound of confetti spreading)
        triggerPop(0.08, 220, 0.12, 0.35);
        triggerNoiseBurst(0.08, 0.3, 1800, 0.25);

        triggerPop(0.14, 190, 0.15, 0.3);
        triggerNoiseBurst(0.14, 0.35, 1500, 0.25);
        
        triggerPop(0.22, 240, 0.1, 0.2);
        
      } catch (e) {
        console.warn("Confetti AudioContext warning:", e);
      }
    }

    function start() {
      if (active) return;
      if (!canvas) {
        init();
      }
      if (!canvas) return;

      active = true;
      particles = [];

      // Initial Popper Blast from bottom-left and bottom-right corners
      // Left popper: Origin (0, height), shoots up and right (approx -45 degrees)
      blast(0, canvas.height, -45, 120);
      // Right popper: Origin (width, height), shoots up and left (approx -135 degrees)
      blast(canvas.width, canvas.height, -135, 120);

      // Play synthesized confetti sound
      playConfettiSound();

      animate();
    }

    function blast(x, y, angleDeg, count) {
      const angleRad = (angleDeg * Math.PI) / 180;
      
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 0.45; // Spread around the main angle
        const currentAngle = angleRad + spread;
        const speed = Math.random() * 18 + 12; // High initial velocity

        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

        particles.push({
          x: x,
          y: y,
          vx: Math.cos(currentAngle) * speed,
          vy: Math.sin(currentAngle) * speed - (Math.random() * 4), // additional upward velocity bias
          width: Math.random() * 8 + 6,
          height: Math.random() * 12 + 8,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          color: color,
          opacity: 1.0,
          decay: Math.random() * 0.006 + 0.003,
          gravity: 0.35, // pull downwards
          friction: 0.985, // air resistance
          shape: Math.floor(Math.random() * 3), // 0: Rect, 1: Circle, 2: Triangle
        });
      }
    }

    function spawnRain() {
      // Spawn gentle drifting gold rain from top
      if (Math.random() > 0.4) return;

      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        width: Math.random() * 6 + 5,
        height: Math.random() * 10 + 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        color: color,
        opacity: 0.9,
        decay: Math.random() * 0.004 + 0.002,
        gravity: 0.15,
        friction: 0.99,
        shape: Math.floor(Math.random() * 3),
      });
    }

    function animate() {
      if (!active) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Physics update
        p.vx *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        ctx.fillStyle = `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${p.opacity})`;

        if (p.shape === 0) {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.height / 2);
          ctx.lineTo(p.width / 2, p.height / 2);
          ctx.lineTo(-p.width / 2, p.height / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // Remove faded out particles
      particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 20 && p.x > -20 && p.x < canvas.width + 20);

      spawnRain();

      animId = requestAnimationFrame(animate);
    }

    function burst(customX, customY) {
      if (!canvas) {
        init();
      }
      if (!canvas) return;

      const originX = customX !== undefined ? customX : canvas.width / 2;
      const originY = customY !== undefined ? customY : canvas.height;

      if (customX !== undefined && customY !== undefined) {
        blast(originX, originY, -90, 80);
      } else {
        blast(0, canvas.height, -45, 100);
        blast(canvas.width, canvas.height, -135, 100);
      }

      playConfettiSound();

      if (!active) {
        active = true;
        animate();
      }
    }

    function stop() {
      active = false;
      cancelAnimationFrame(animId);
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      window.removeEventListener('resize', resize);
    }

    return { init, start, burst, stop };
  })();

  /* ─── MATCHSTICK STRIKE ANIMATION ───────────────────────── */
  const MatchstickStrike = (() => {
    let animId;

    function play(onIgnite, onComplete) {
      let container = document.getElementById('matchstick-overlay');
      if (!container) {
        container = document.createElement('div');
        container.id = 'matchstick-overlay';
        container.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10000;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.3s ease;
        `;
        document.body.appendChild(container);
        requestAnimationFrame(() => {
          container.style.opacity = '1';
        });
      }

      container.innerHTML = `
        <canvas id="matchstick-canvas" width="${window.innerWidth}" height="${window.innerHeight}" style="width:100%;height:100%;display:block;"></canvas>
      `;

      const canvas = document.getElementById('matchstick-canvas');
      const ctx = canvas.getContext('2d');

      const W = canvas.width;
      const H = canvas.height;

      const strikeStartX = W * 0.28;
      const strikeStartY = H * 0.58;
      const strikeEndX = W * 0.62;
      const strikeEndY = H * 0.44;

      let startTime = null;
      const duration = 3600; // total animation ms for slow, realistic motion
      let ignited = false;
      let lit1 = false;
      let lit2 = false;
      let lit3 = false;
      let extinguished = false;
      let sparks = [];
      let smokePuffs = [];

      function createSparks(x, y, count = 35) {
        for (let i = 0; i < count; i++) {
          const angle = (Math.random() - 0.5) * Math.PI * 0.95 - Math.PI * 0.25;
          const speed = Math.random() * 12 + 3;
          sparks.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3.5 + 2,
            color: Math.random() > 0.3 ? '#ffb300' : (Math.random() > 0.5 ? '#ff3d00' : '#ffffff'),
            alpha: 1,
            decay: Math.random() * 0.035 + 0.015,
            gravity: 0.22
          });
        }
      }

      function createSmokePuffs(x, y) {
        for (let i = 0; i < 24; i++) {
          smokePuffs.push({
            x: x + (Math.random() - 0.5) * 14,
            y: y + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 1.5,
            size: Math.random() * 9 + 5,
            alpha: 0.85,
            decay: Math.random() * 0.02 + 0.012
          });
        }
      }

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        ctx.clearRect(0, 0, W, H);

        // Retrieve candle positions dynamically
        const f1 = document.getElementById('flame-1');
        const f2 = document.getElementById('flame-2');
        const f3 = document.getElementById('flame-3');

        const c1Pos = f1 ? { x: f1.getBoundingClientRect().left + 10, y: f1.getBoundingClientRect().top + 10 } : { x: W * 0.44, y: H * 0.48 };
        const c2Pos = f2 ? { x: f2.getBoundingClientRect().left + 10, y: f2.getBoundingClientRect().top + 10 } : { x: W * 0.50, y: H * 0.46 };
        const c3Pos = f3 ? { x: f3.getBoundingClientRect().left + 10, y: f3.getBoundingClientRect().top + 10 } : { x: W * 0.56, y: H * 0.48 };

        // Matchbox strip position (visible during strike phase)
        const boxX = W * 0.38;
        const boxY = H * 0.52;
        const boxW = Math.min(260, W * 0.28);
        const boxH = 32;

        if (progress < 0.24) {
          // Draw Matchbox friction strip
          ctx.save();
          ctx.translate(boxX + boxW / 2, boxY + boxH / 2);
          ctx.rotate(-0.2);
          ctx.fillStyle = '#2c1810';
          ctx.strokeStyle = '#c9a84c';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
          } else {
            ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH);
          }
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Phosphorus friction dots
          ctx.fillStyle = '#170c08';
          for (let bx = -boxW / 2 + 12; bx < boxW / 2 - 12; bx += 9) {
            for (let by = -boxH / 2 + 6; by < boxH / 2 - 6; by += 8) {
              ctx.beginPath();
              ctx.arc(bx + (by % 2), by, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }

        // Current matchstick tip position
        let matchX, matchY;
        let matchAngle = -0.32;

        if (progress < 0.16) {
          // Phase 1: Striking stroke across box
          const strokeP = progress / 0.16;
          const easeStroke = strokeP * strokeP;
          matchX = strikeStartX + (strikeEndX - strikeStartX) * easeStroke;
          matchY = strikeStartY + (strikeEndY - strikeStartY) * easeStroke;
          matchAngle = -0.32;
        } else if (progress < 0.32) {
          // Phase 2: Move lit matchstick to Candle 1
          const p = (progress - 0.16) / 0.16;
          const easeP = 0.5 - 0.5 * Math.cos(p * Math.PI);
          matchX = strikeEndX + (c1Pos.x - strikeEndX) * easeP;
          matchY = strikeEndY + (c1Pos.y - strikeEndY) * easeP;
          matchAngle = -0.22;
        } else if (progress < 0.48) {
          // Phase 3: Move from Candle 1 to Candle 2
          const p = (progress - 0.32) / 0.16;
          const easeP = 0.5 - 0.5 * Math.cos(p * Math.PI);
          matchX = c1Pos.x + (c2Pos.x - c1Pos.x) * easeP;
          matchY = c1Pos.y + (c2Pos.y - c1Pos.y) * easeP;
          matchAngle = -0.16;
        } else if (progress < 0.64) {
          // Phase 4: Move from Candle 2 to Candle 3
          const p = (progress - 0.48) / 0.16;
          const easeP = 0.5 - 0.5 * Math.cos(p * Math.PI);
          matchX = c2Pos.x + (c3Pos.x - c2Pos.x) * easeP;
          matchY = c2Pos.y + (c3Pos.y - c2Pos.y) * easeP;
          matchAngle = -0.10;
        } else if (progress < 0.84) {
          // Phase 5: SLOW, DELIBERATE HAND SHAKE / FLICK to extinguish flame!
          const p = (progress - 0.64) / 0.20;
          const shakeOffset = Math.sin(p * Math.PI * 3) * 28;
          const shakeRot = Math.sin(p * Math.PI * 3) * 0.55;
          matchX = c3Pos.x + 20 + shakeOffset;
          matchY = c3Pos.y - 15 + Math.sin(p * Math.PI * 6) * 6;
          matchAngle = -0.10 + shakeRot;
        } else {
          // Phase 6: Drop & tumble down off screen with gravity
          const p = (progress - 0.84) / 0.16;
          const gravityDrop = p * p * (H * 0.65);
          matchX = c3Pos.x + 20 + p * 55;
          matchY = c3Pos.y - 15 + gravityDrop;
          matchAngle = -0.10 + p * 2.8;
        }

        // Trigger match tip ignition sound & sparks at strike point (~15% progress)
        if (progress >= 0.15 && !ignited) {
          ignited = true;
          createSparks(strikeEndX, strikeEndY, 50);
          if (typeof onIgnite === 'function') onIgnite();
        }

        // Trigger Candle 1 Ignition at tip contact
        if (progress >= 0.31 && !lit1) {
          lit1 = true;
          if (typeof CakeBlowSystem !== 'undefined' && typeof CakeBlowSystem.lightCandle === 'function') {
            CakeBlowSystem.lightCandle(1);
          }
          createSparks(c1Pos.x, c1Pos.y, 25);
          if (typeof SFX !== 'undefined' && typeof SFX.digitBlip === 'function') SFX.digitBlip();
        }

        // Trigger Candle 2 Ignition at tip contact
        if (progress >= 0.47 && !lit2) {
          lit2 = true;
          if (typeof CakeBlowSystem !== 'undefined' && typeof CakeBlowSystem.lightCandle === 'function') {
            CakeBlowSystem.lightCandle(2);
          }
          createSparks(c2Pos.x, c2Pos.y, 25);
          if (typeof SFX !== 'undefined' && typeof SFX.digitBlip === 'function') SFX.digitBlip();
        }

        // Trigger Candle 3 Ignition at tip contact
        if (progress >= 0.63 && !lit3) {
          lit3 = true;
          if (typeof CakeBlowSystem !== 'undefined' && typeof CakeBlowSystem.lightCandle === 'function') {
            CakeBlowSystem.lightCandle(3);
          }
          createSparks(c3Pos.x, c3Pos.y, 25);
          if (typeof SFX !== 'undefined' && typeof SFX.digitBlip === 'function') SFX.digitBlip();
        }

        // Trigger Shake Extinguish (Puff of smoke + sound during slow wave)
        if (progress >= 0.70 && !extinguished) {
          extinguished = true;
          createSmokePuffs(matchX, matchY);
          if (typeof SFX !== 'undefined' && typeof SFX.digitBlip === 'function') SFX.digitBlip();
        }

        // Draw Sparks
        sparks.forEach(s => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += s.gravity;
          s.vx *= 0.96;
          s.alpha -= s.decay;

          if (s.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, s.alpha);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
          }
        });

        // Draw Smoke Puffs (from Extinguishing Shake)
        smokePuffs.forEach(sm => {
          sm.x += sm.vx;
          sm.y += sm.vy;
          sm.size += 0.4;
          sm.alpha -= sm.decay;

          if (sm.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, sm.alpha);
            ctx.beginPath();
            ctx.arc(sm.x, sm.y, sm.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
            ctx.shadowColor = 'rgba(100, 100, 100, 0.5)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          }
        });

        // Draw Wooden Matchstick
        ctx.save();
        ctx.translate(matchX, matchY);
        ctx.rotate(matchAngle);

        const stickLength = 170;
        const stickWidth = 11;

        // Stick body (wood gradient)
        const woodGrad = ctx.createLinearGradient(0, 0, stickLength, 0);
        woodGrad.addColorStop(0, extinguished ? '#d4b483' : '#f5d8a6');
        woodGrad.addColorStop(1, extinguished ? '#4a3828' : '#be945b');
        ctx.fillStyle = woodGrad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(0, -stickWidth / 2, stickLength, stickWidth, 3);
        } else {
          ctx.rect(0, -stickWidth / 2, stickLength, stickWidth);
        }
        ctx.fill();

        // Match head (Charred black tip after extinguish, or glowing red while lit)
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = extinguished ? '#1e1610' : (ignited ? '#ff3d00' : '#8b0000');
        ctx.fill();

        // Ignited Flame on Match Head (extinguishes during shake at progress 0.73)
        if (ignited && !extinguished) {
          const flameScale = Math.min(1.2, (progress - 0.19) / 0.15);
          const flicker = Math.sin(timestamp * 0.04) * 4;

          ctx.save();
          ctx.scale(flameScale, flameScale);

          // Outer flame glow
          ctx.beginPath();
          ctx.ellipse(-10 + flicker, -22, 24, 36, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 140, 0, 0.45)';
          ctx.shadowColor = '#ff6d00';
          ctx.shadowBlur = 30;
          ctx.fill();

          // Main flame body
          ctx.beginPath();
          ctx.ellipse(-8 + flicker * 0.5, -18, 16, 26, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ff9100';
          ctx.fill();

          // Flame core (bright yellow/white)
          ctx.beginPath();
          ctx.ellipse(-5, -13, 8, 15, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffff00';
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(-3, -9, 4, 9, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.restore();
        }

        ctx.restore();

        if (progress < 1) {
          animId = requestAnimationFrame(animate);
        } else {
          container.style.transition = 'opacity 0.4s ease';
          container.style.opacity = '0';
          setTimeout(() => {
            if (container && container.parentNode) {
              container.parentNode.removeChild(container);
            }
            if (typeof onComplete === 'function') onComplete();
          }, 400);
        }
      }

      animId = requestAnimationFrame(animate);
    }

    return { play };
  })();

  /* ─── PUBLIC API ─────────────────────────────────────────── */
  return {
    ParticleSystem,
    StarField,
    FinaleParticles,
    Celebration,
    MatchstickStrike,
    animateCounter,
    initScrollReveal,
    initFinaleObserver,
  };
})();
