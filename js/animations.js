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

  /* ─── PUBLIC API ─────────────────────────────────────────── */
  return {
    ParticleSystem,
    StarField,
    FinaleParticles,
    Celebration,
    animateCounter,
    initScrollReveal,
    initFinaleObserver,
  };
})();
