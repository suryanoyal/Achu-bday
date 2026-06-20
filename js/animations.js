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

    document.querySelectorAll('.reveal-item').forEach(el => {
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

  /* ─── PUBLIC API ─────────────────────────────────────────── */
  return {
    ParticleSystem,
    StarField,
    FinaleParticles,
    animateCounter,
    initScrollReveal,
    initFinaleObserver,
  };
})();
