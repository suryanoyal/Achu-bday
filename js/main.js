/* ╔══════════════════════════════════════════════════════════════╗
   ║  MAIN.JS — App Orchestration                               ║
   ║  Initialization · Data Rendering · Section Assembly         ║
   ╚══════════════════════════════════════════════════════════════╝ */

(function () {
  'use strict';

  // Global references for YouTube hover preview players
  const previewPlayers = {};

  // Handle YouTube Iframe API initialization
  window.onYouTubeIframeAPIReady = function () {
    const tamilSongs = BIRTHDAY_DATA?.music?.tamil;
    const popup = document.getElementById('youtube-hover-preview');
    if (!popup || !tamilSongs) return;

    tamilSongs.forEach(song => {
      if (!song.youtubeId) return;

      const wrapper = document.createElement('div');
      wrapper.id = `player-wrapper-${song.youtubeId}`;
      wrapper.className = 'preview-player-wrapper';
      wrapper.style.display = 'none';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';

      const playerDiv = document.createElement('div');
      playerDiv.id = `yt-player-${song.youtubeId}`;
      wrapper.appendChild(playerDiv);
      popup.appendChild(wrapper);

      previewPlayers[song.youtubeId] = new YT.Player(`yt-player-${song.youtubeId}`, {
        height: '100%',
        width: '100%',
        videoId: song.youtubeId,
        playerVars: {
          start: song.previewStart || 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          autoplay: 0,
          mute: 0
        },
        events: {
          onReady: (event) => {
            // Seek to start position and pause to cache the buffer
            event.target.seekTo(song.previewStart || 0, true);
            event.target.pauseVideo();
          }
        }
      });
    });
  };

  /* ─── INITIALIZATION ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // Create the global hover preview popup container early
    let popup = document.getElementById('youtube-hover-preview');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'youtube-hover-preview';
      popup.className = 'youtube-preview-popup';
      document.body.appendChild(popup);
    }

    // Load YouTube Iframe Player API script dynamically
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Initialize particles (always visible, even during countdown)
    Animations.ParticleSystem.init();

    // Initialize countdown
    CountdownTimer.init(onBirthdayReached);

    // If birthday already, show content immediately
    if (CountdownTimer.isBirthdayTime()) {
      onBirthdayReached();
    }

    // SFX toggle button
    const sfxToggle = document.getElementById('sfx-toggle');
    const sfxIcon = document.getElementById('sfx-icon');
    if (sfxToggle) {
      let sfxMuted = false;
      sfxToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sfxMuted = !sfxMuted;
        if (typeof SFX !== 'undefined') {
          SFX.setVolume(sfxMuted ? 0 : 0.5);
          SFX.setTickEnabled(!sfxMuted);
        }
        sfxToggle.classList.toggle('muted', sfxMuted);
        if (sfxIcon) sfxIcon.textContent = sfxMuted ? '🔇' : '🔊';
      });
    }
  });

  function onBirthdayReached() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.style.display = 'block';

      // Short delay to allow DOM to render before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initAllSections();
        });
      });
    }
  }

  let _initialized = false;

  function initAllSections() {
    if (_initialized) return;
    _initialized = true;
    renderSnapshot();
    initLiveCounters();
    renderSkyFacts();
    initInteractiveSky();
    renderLeaders();
    renderSoundtrack();
    renderCinema();
    renderTamilNadu();
    renderEvents();
    loadLetter();
    loadPhotos();

    // Initialize animations
    Animations.StarField.init();
    Animations.FinaleParticles.init();
    Animations.initScrollReveal();
    Animations.initFinaleObserver();
    initScrollProgress();
    initMusicControl();
    initScrollToBottomModal();
  }

  /* ─── SCROLL PROGRESS ───────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      bar.style.width = scrolled + '%';
    }, { passive: true });
  }

  /* ─── MUSIC CONTROL ─────────────────────────────────────── */
  window.playMusic = function () {
    const audio = document.getElementById('bg-music');
    const toggle = document.getElementById('music-toggle');
    const icon = document.getElementById('music-icon');
    if (!audio) return;

    audio.volume = 0.3;
    audio.play().then(() => {
      if (toggle) toggle.classList.add('playing');
      if (icon) icon.textContent = '♪';
    }).catch(err => {
      console.warn('Music play failed:', err);
    });
  };

  window.pauseMusic = function () {
    const audio = document.getElementById('bg-music');
    const toggle = document.getElementById('music-toggle');
    if (!audio) return;
    audio.pause();
    if (toggle) toggle.classList.remove('playing');
  };

  function initMusicControl() {
    const toggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    const icon = document.getElementById('music-icon');

    if (!toggle || !audio) return;

    // Show the toggle button
    setTimeout(() => toggle.classList.add('visible'), 1000);

    let userInteracted = false;

    // Try to play on first user interaction
    function tryAutoPlay() {
      if (userInteracted) return;
      userInteracted = true;
      window.playMusic();
      document.removeEventListener('click', tryAutoPlay);
    }

    document.addEventListener('click', tryAutoPlay, { once: false });

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!audio.paused) {
        window.pauseMusic();
      } else {
        window.playMusic();
      }
    });
  }


  /* ─── RENDER: BIRTHDAY SNAPSHOT ─────────────────────────── */
  function renderSnapshot() {
    const grid = document.getElementById('snapshot-grid');
    if (!grid) return;

    const data = BIRTHDAY_DATA;
    const cards = [
      { icon: '📅', label: 'Date of Birth', value: 'August 2, 2003' },
      { icon: '📆', label: 'Day of Week', value: data.birthDay },
      { icon: data.zodiac.symbol, label: 'Zodiac Sign', value: `${data.zodiac.sign} — ${data.zodiac.element}` },
      { icon: '🐐', label: 'Chinese Zodiac', value: data.chineseZodiac.year },
      { icon: '💎', label: 'Birthstone', value: data.birthstone.name },
      { icon: '🌺', label: 'Birth Flower', value: data.birthFlower.name },
      { icon: data.moonPhase.emoji, label: 'Moon Phase', value: data.moonPhase.phase },
      { icon: '🌟', label: 'Zodiac Traits', value: data.zodiac.traits.split(',').slice(0, 3).join(', ') },
    ];

    cards.forEach((card, index) => {
      const el = document.createElement('div');
      el.className = 'snapshot-card reveal-item';
      el.dataset.delay = String(index * 80);
      el.innerHTML = `
        <span class="snapshot-card-icon">${card.icon}</span>
        <span class="snapshot-card-label">${card.label}</span>
        <span class="snapshot-card-value">${card.value}</span>
      `;
      grid.appendChild(el);
    });
  }

  /* ─── LIVE COUNTERS ──────────────────────────────────────── */
  function initLiveCounters() {
    const container = document.getElementById('snapshot-counters');
    if (!container) return;

    // Create cards for each counter
    const counters = [
      { id: 'counter-age', label: 'Approximate Age Today' },
      { id: 'counter-days', label: 'Days Lived' },
      { id: 'counter-weeks', label: 'Weeks Lived' },
      { id: 'counter-months', label: 'Months Lived' },
      { id: 'counter-heartbeats', label: 'Heartbeats Lived (est.)' }
    ];

    container.innerHTML = counters.map(c => {
      if (c.id === 'counter-heartbeats') {
        return `
          <div class="counter-card heartbeat-interactive-card" id="${c.id}-card">
            <span class="heart-pulse-icon">❤️</span>
            <span class="counter-value" id="${c.id}">0</span>
            <span class="counter-label">${c.label}</span>
            <span class="hover-hint-text">Hover to feel the rhythm 🎧</span>
          </div>
        `;
      }
      return `
        <div class="counter-card" id="${c.id}-card">
          <span class="counter-value" id="${c.id}">0</span>
          <span class="counter-label">${c.label}</span>
        </div>
      `;
    }).join('');

    const birthDate = BIRTHDAY_DATA.birthDateISO || new Date("2003-08-02T00:00:00+05:30");
    
    const duration = 2000; // 2 seconds count-up
    const startTime = performance.now();
    
    function animate(nowTime) {
      const elapsed = nowTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const now = Date.now();
      const diffMs = now - birthDate.getTime();
      
      const targetAge = diffMs / (1000 * 60 * 60 * 24 * 365.2425);
      const targetDays = diffMs / (1000 * 60 * 60 * 24);
      const targetWeeks = targetDays / 7;
      const targetMonths = targetDays / 30.436875;
      const targetHeartbeats = (diffMs / 60000) * 75; // average resting hr of 75 bpm
      
      const curAge = targetAge * ease;
      const curDays = targetDays * ease;
      const curWeeks = targetWeeks * ease;
      const curMonths = targetMonths * ease;
      const curHeartbeats = targetHeartbeats * ease;
      
      const ageEl = document.getElementById('counter-age');
      const daysEl = document.getElementById('counter-days');
      const weeksEl = document.getElementById('counter-weeks');
      const monthsEl = document.getElementById('counter-months');
      const heartEl = document.getElementById('counter-heartbeats');
      
      if (progress < 1) {
        if (ageEl) ageEl.textContent = Math.floor(curAge).toLocaleString();
        if (daysEl) daysEl.textContent = Math.floor(curDays).toLocaleString();
        if (weeksEl) weeksEl.textContent = Math.floor(curWeeks).toLocaleString();
        if (monthsEl) monthsEl.textContent = Math.floor(curMonths).toLocaleString();
        if (heartEl) heartEl.textContent = Math.floor(curHeartbeats).toLocaleString();
        
        requestAnimationFrame(animate);
      } else {
        updateLive();
      }
    }
    
    function updateLive() {
      const now = Date.now();
      const diffMs = now - birthDate.getTime();
      
      const age = diffMs / (1000 * 60 * 60 * 24 * 365.2425);
      const days = diffMs / (1000 * 60 * 60 * 24);
      const weeks = days / 7;
      const months = days / 30.436875;
      const heartbeats = (diffMs / 60000) * 75;
      
      const ageEl = document.getElementById('counter-age');
      const daysEl = document.getElementById('counter-days');
      const weeksEl = document.getElementById('counter-weeks');
      const monthsEl = document.getElementById('counter-months');
      const heartEl = document.getElementById('counter-heartbeats');
      
      if (ageEl) ageEl.textContent = Math.floor(age).toLocaleString();
      if (daysEl) daysEl.textContent = Math.floor(days).toLocaleString();
      if (weeksEl) weeksEl.textContent = Math.floor(weeks).toLocaleString();
      if (monthsEl) monthsEl.textContent = Math.floor(months).toLocaleString();
      if (heartEl) heartEl.textContent = Math.floor(heartbeats).toLocaleString();
      
      requestAnimationFrame(updateLive);
    }
    
    requestAnimationFrame(animate);

    // Play heartbeat sound on hover
    const heartCard = document.getElementById('counter-heartbeats-card');
    if (heartCard) {
      let audioCtx = null;
      let heartbeatInterval = null;

      const playHeartbeatSound = () => {
        try {
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          }
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
          
          const now = audioCtx.currentTime;
          
          // Use a lowpass filter to make it sound muffled/warm
          const filter = audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(100, now);
          filter.connect(audioCtx.destination);
          
          // First beat (lub)
          const osc1 = audioCtx.createOscillator();
          const gain1 = audioCtx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(55, now);
          osc1.frequency.linearRampToValueAtTime(25, now + 0.12);
          
          gain1.gain.setValueAtTime(0, now);
          gain1.gain.linearRampToValueAtTime(0.8, now + 0.02);
          gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          
          osc1.connect(gain1);
          gain1.connect(filter);
          
          osc1.start(now);
          osc1.stop(now + 0.13);
          
          // Second beat (dub)
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(50, now + 0.15);
          osc2.frequency.linearRampToValueAtTime(20, now + 0.15 + 0.12);
          
          gain2.gain.setValueAtTime(0, now + 0.15);
          gain2.gain.linearRampToValueAtTime(0.6, now + 0.15 + 0.02);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15 + 0.12);
          
          osc2.connect(gain2);
          gain2.connect(filter);
          
          osc2.start(now + 0.15);
          osc2.stop(now + 0.15 + 0.13);
        } catch (e) {
          console.error("Failed to play synthesized heartbeat:", e);
        }
      };

      const fadeMusicVolume = (targetVolume, duration = 300) => {
        const bgMusic = document.getElementById('bg-music');
        if (!bgMusic) return;

        // Cancel any ongoing fade
        if (bgMusic.dataset.fadeTimer) {
          cancelAnimationFrame(parseInt(bgMusic.dataset.fadeTimer));
        }

        const startVolume = bgMusic.volume;
        const volumeDiff = targetVolume - startVolume;
        const startTime = performance.now();

        const step = (time) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress * (2 - progress); // easeOutQuad
          bgMusic.volume = startVolume + volumeDiff * ease;

          if (progress < 1) {
            bgMusic.dataset.fadeTimer = requestAnimationFrame(step);
          } else {
            bgMusic.volume = targetVolume;
            delete bgMusic.dataset.fadeTimer;
          }
        };

        bgMusic.dataset.fadeTimer = requestAnimationFrame(step);
      };

      heartCard.addEventListener('mouseenter', () => {
        fadeMusicVolume(0.05, 300);
        playHeartbeatSound();
        heartbeatInterval = setInterval(playHeartbeatSound, 800);
      });

      heartCard.addEventListener('mouseleave', () => {
        fadeMusicVolume(0.3, 400);
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }
      });
    }
  }

  /* ─── RENDER: SKY FACTS ─────────────────────────────────── */
  function renderSkyFacts() {
    const container = document.getElementById('sky-facts');
    if (!container) return;

    BIRTHDAY_DATA.sky.astronomyFacts.forEach(fact => {
      const el = document.createElement('div');
      el.className = 'sky-fact';
      el.innerHTML = `
        <span class="sky-fact-dot"></span>
        <span class="sky-fact-text">${fact}</span>
      `;
      container.appendChild(el);
    });
  }

  /* ─── INTERACTIVE SKY TIMELINE (iPhone Weather Style – 24hr) ── */
  function initInteractiveSky() {
    const slider = document.getElementById('sky-time-slider');
    const timeText = document.getElementById('sky-current-time');
    const statusText = document.getElementById('sky-time-status');
    const celestialBody = document.getElementById('sky-celestial-body');
    const sectionSky = document.getElementById('sky');
    const starCanvas = document.getElementById('star-canvas');
    const arcCanvas = document.getElementById('sky-arc-canvas');
    const arcContainer = document.getElementById('sky-arc-container');
    const hourLabelsContainer = document.getElementById('sky-hour-labels');

    if (!slider || !timeText || !statusText || !celestialBody || !sectionSky || !arcCanvas || !arcContainer) return;

    const ctx = arcCanvas.getContext('2d');

    // Sunrise / Sunset in minutes
    const SUNRISE = 358;  // 5:58 AM
    const SUNSET = 1118;  // 6:38 PM

    const sunSvg = `
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <circle cx="12" cy="12" r="5" fill="#ffeb3b"/>
        <g stroke="#ffeb3b" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
          <line x1="5" y1="5" x2="6.5" y2="6.5"/>
          <line x1="17.5" y1="17.5" x2="19" y2="19"/>
          <line x1="5" y1="19" x2="6.5" y2="17.5"/>
          <line x1="17.5" y1="6.5" x2="19" y2="5"/>
        </g>
      </svg>
    `;

    const moonSvg = `
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <path d="M12 3a9 9 0 1 0 9 9 9.9 9.9 0 0 1-9-9Z" fill="#f5f0e8"/>
      </svg>
    `;

    // Generate hour labels
    if (hourLabelsContainer) {
      const labelHours = [0, 3, 6, 9, 12, 15, 18, 21];
      labelHours.forEach(h => {
        const span = document.createElement('span');
        span.className = 'sky-hour-label';
        const displayH = h === 0 ? '12AM' : h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`;
        span.textContent = displayH;
        if (h === 6 || h === 18) span.classList.add('highlight');
        hourLabelsContainer.appendChild(span);
      });
    }

    const skyKeyframes = [
      { time: 0,    c1: [2, 1, 17],     c2: [9, 7, 40] },
      { time: 300,  c1: [15, 14, 45],   c2: [58, 28, 77] },
      { time: 358,  c1: [255, 110, 90],  c2: [254, 180, 120] },
      { time: 420,  c1: [110, 150, 220], c2: [190, 210, 245] },
      { time: 720,  c1: [50, 120, 210],  c2: [130, 180, 245] },
      { time: 1050, c1: [70, 110, 190],  c2: [220, 160, 110] },
      { time: 1118, c1: [45, 20, 80],    c2: [220, 70, 70] },
      { time: 1170, c1: [15, 10, 45],    c2: [50, 20, 75] },
      { time: 1320, c1: [5, 3, 25],      c2: [10, 8, 45] },
      { time: 1440, c1: [2, 1, 17],     c2: [9, 7, 40] }
    ];

    /** Convert time (minutes) to x position across the full width */
    function timeToX(minutes, w, pad) {
      return pad + (minutes / 1440) * (w - 2 * pad);
    }

    /** Get the Y position on the arc for a given time.
     *  Sun is above horizon between sunrise and sunset (arc peaks at midday).
     *  Below horizon otherwise (inverted arc). */
    function timeToY(minutes, w, h, pad) {
      const horizonY = h * 0.65;
      const arcHeight = h * 0.55;
      const belowDepth = h * 0.22;

      if (minutes >= SUNRISE && minutes <= SUNSET) {
        // Daytime: sinusoidal arc above horizon
        const dayProgress = (minutes - SUNRISE) / (SUNSET - SUNRISE);
        const sinVal = Math.sin(dayProgress * Math.PI);
        return horizonY - sinVal * arcHeight;
      } else {
        // Nighttime: gentle inverted arc below horizon
        let nightProgress;
        const nightLen = (1440 - SUNSET) + SUNRISE;
        if (minutes > SUNSET) {
          nightProgress = (minutes - SUNSET) / nightLen;
        } else {
          nightProgress = ((1440 - SUNSET) + minutes) / nightLen;
        }
        const sinVal = Math.sin(nightProgress * Math.PI);
        return horizonY + sinVal * belowDepth;
      }
    }

    function resizeCanvas() {
      const rect = arcContainer.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      arcCanvas.width = rect.width * dpr;
      arcCanvas.height = rect.height * dpr;
      arcCanvas.style.width = rect.width + 'px';
      arcCanvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawArc(currentMinutes) {
      const w = arcCanvas.width / (window.devicePixelRatio || 1);
      const h = arcCanvas.height / (window.devicePixelRatio || 1);
      const pad = w * 0.02;
      const horizonY = h * 0.65;

      ctx.clearRect(0, 0, w, h);

      // ── Draw the dashed path (full 24hr) ──
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 245, 230, 0.12)';
      ctx.lineWidth = 1.5;
      for (let m = 0; m <= 1440; m += 2) {
        const x = timeToX(m, w, pad);
        const y = timeToY(m, w, h, pad);
        if (m === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Draw the sunlit arc segment (golden, sunrise to sunset) ──
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(255, 200, 50, 0.3)';
      ctx.shadowBlur = 8;
      for (let m = SUNRISE; m <= SUNSET; m += 2) {
        const x = timeToX(m, w, pad);
        const y = timeToY(m, w, h, pad);
        if (m === SUNRISE) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Fill the area under the sunlit arc with a golden glow ──
      ctx.beginPath();
      for (let m = SUNRISE; m <= SUNSET; m += 2) {
        const x = timeToX(m, w, pad);
        const y = timeToY(m, w, h, pad);
        if (m === SUNRISE) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(timeToX(SUNSET, w, pad), horizonY);
      ctx.lineTo(timeToX(SUNRISE, w, pad), horizonY);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, h * 0.1, 0, horizonY);
      grad.addColorStop(0, 'rgba(255, 200, 50, 0.15)');
      grad.addColorStop(1, 'rgba(255, 200, 50, 0.02)');
      ctx.fillStyle = grad;
      ctx.fill();

      // ── Horizon line ──
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 245, 230, 0.2)';
      ctx.lineWidth = 1;
      ctx.moveTo(pad, horizonY);
      ctx.lineTo(w - pad, horizonY);
      ctx.stroke();

      // ── Hour tick marks ──
      for (let hr = 0; hr <= 24; hr += 3) {
        const m = hr === 24 ? 1440 : hr * 60;
        const x = timeToX(m, w, pad);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 245, 230, 0.15)';
        ctx.lineWidth = 1;
        ctx.moveTo(x, horizonY - 4);
        ctx.lineTo(x, horizonY + 4);
        ctx.stroke();
      }

      // ── Sunrise & Sunset markers ──
      const srX = timeToX(SUNRISE, w, pad);
      const ssX = timeToX(SUNSET, w, pad);

      // Sunrise dot
      ctx.beginPath();
      ctx.arc(srX, horizonY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 160, 60, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sunset dot
      ctx.beginPath();
      ctx.arc(ssX, horizonY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 100, 50, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 150, 80, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Current time indicator line ──
      const curX = timeToX(currentMinutes, w, pad);
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.moveTo(curX, 0);
      ctx.lineTo(curX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      return { w, h, pad };
    }

    function updateSky(minutes) {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      const displayMins = String(mins).padStart(2, '0');
      timeText.textContent = `${displayHrs}:${displayMins} ${ampm}`;

      const isDay = minutes >= SUNRISE && minutes < SUNSET;

      if (isDay) {
        celestialBody.innerHTML = sunSvg;
        celestialBody.className = "sky-celestial-body sun";
        statusText.textContent = minutes < 720 ? "Morning" : (minutes === 720 ? "Midday" : "Afternoon");
      } else {
        celestialBody.innerHTML = moonSvg;
        celestialBody.className = "sky-celestial-body moon";
        if (minutes >= SUNSET && minutes < 1200) statusText.textContent = "Evening / Dusk";
        else if (minutes >= 1200 || minutes < 180) statusText.textContent = "Late Night";
        else statusText.textContent = "Pre-Dawn";
      }

      // Resize and draw arc
      resizeCanvas();
      const { w, h, pad } = drawArc(minutes);

      // Position celestial body on the arc
      const posX = timeToX(minutes, w, pad);
      const posY = timeToY(minutes, w, h, pad);
      const leftPct = (posX / w) * 100;
      const topPct = (posY / h) * 100;
      celestialBody.style.left = `${leftPct}%`;
      celestialBody.style.top = `${topPct}%`;

      // Sky background colors
      let k1, k2;
      for (let i = 0; i < skyKeyframes.length - 1; i++) {
        if (minutes >= skyKeyframes[i].time && minutes <= skyKeyframes[i+1].time) {
          k1 = skyKeyframes[i];
          k2 = skyKeyframes[i+1];
          break;
        }
      }

      const range = k2.time - k1.time;
      const t = range === 0 ? 0 : (minutes - k1.time) / range;

      const r1 = Math.round(k1.c1[0] + t * (k2.c1[0] - k1.c1[0]));
      const g1 = Math.round(k1.c1[1] + t * (k2.c1[1] - k1.c1[1]));
      const b1 = Math.round(k1.c1[2] + t * (k2.c1[2] - k1.c1[2]));

      const r2 = Math.round(k1.c2[0] + t * (k2.c2[0] - k1.c2[0]));
      const g2 = Math.round(k1.c2[1] + t * (k2.c2[1] - k1.c2[1]));
      const b2 = Math.round(k1.c2[2] + t * (k2.c2[2] - k1.c2[2]));

      sectionSky.style.background = `linear-gradient(to bottom, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`;

      let starOpacity = 0;
      if (minutes >= 1170 || minutes < 300) {
        starOpacity = 1.0;
      } else if (minutes >= 300 && minutes < 358) {
        starOpacity = 1.0 - (minutes - 300) / (358 - 300);
      } else if (minutes >= 358 && minutes < 1118) {
        starOpacity = 0;
      } else if (minutes >= 1118 && minutes < 1170) {
        starOpacity = (minutes - 1118) / (1170 - 1118);
      }

      if (starCanvas) {
        starCanvas.style.opacity = starOpacity;
      }
    }

    slider.addEventListener('input', (e) => {
      updateSky(parseInt(e.target.value));
    });

    // Redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateSky(parseInt(slider.value));
      }, 100);
    });

    // Start initial state at 10:00 PM (1320 minutes)
    updateSky(1320);
  }

  /* ─── RENDER: WORLD LEADERS ─────────────────────────────── */
  function renderLeaders() {
    const grid = document.getElementById('leaders-grid');
    if (!grid) return;

    BIRTHDAY_DATA.leaders.forEach((leader, index) => {
      const card = document.createElement('div');
      card.className = 'leader-card reveal-item';
      card.dataset.delay = String(index * 120);
      card.innerHTML = `
        <div class="leader-image-container">
          ${leader.image ? `<img src="${leader.image}" alt="${leader.name}" class="leader-photo-img" loading="lazy">` : `<span class="leader-emoji">${leader.emoji}</span>`}
        </div>
        <div class="leader-info">
          <div class="leader-title">${leader.title}</div>
          <div class="leader-name">${leader.name}</div>
          <div class="leader-period">${leader.period}</div>
          <div class="leader-note">${leader.note}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* ─── RENDER: SOUNDTRACK ────────────────────────────────── */
  function renderSoundtrack() {
    renderBillboard();
    renderMusicGrid('music-indian', BIRTHDAY_DATA.music.indian);
    renderMusicGrid('music-tamil', BIRTHDAY_DATA.music.tamil);
  }

  function renderBillboard() {
    const container = document.getElementById('music-billboard');
    if (!container) return;

    const b = BIRTHDAY_DATA.music.billboard;
    container.innerHTML = `
      <div class="music-card-featured" style="--accent: ${b.color}">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg, transparent, ${b.color}, transparent);border-radius:20px 20px 0 0;"></div>
        <div class="music-artwork">
          ${b.image ? `<img src="${b.image}" alt="${b.song}" class="music-poster-img">` : '🎵'}
        </div>
        <div class="music-song-title">${b.song}</div>
        <div class="music-artist">${b.artist}</div>
        <div class="music-album">${b.album}</div>
        <div class="music-detail">${b.weeksAtOne} weeks at #1 on Billboard Hot 100</div>
        <div class="music-links">
          ${b.youtubeUrl ? `<a href="${b.youtubeUrl}" target="_blank" rel="noopener" class="music-link">▶ YouTube</a>` : ''}
        </div>
      </div>
    `;
  }

  function positionPopup(popup, e) {
    const popupWidth = 320;
    const popupHeight = 180;
    
    // Position 15px down and right from cursor
    let x = e.clientX + 15;
    let y = e.clientY + 15;
    
    // Keep within viewport boundaries
    if (x + popupWidth > window.innerWidth) {
      x = e.clientX - popupWidth - 15;
    }
    if (y + popupHeight > window.innerHeight) {
      y = e.clientY - popupHeight - 15;
    }
    
    // Fallback safety checks
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
  }

  function renderMusicGrid(containerId, songs) {
    const container = document.getElementById(containerId);
    if (!container || !songs) return;

    songs.forEach(song => {
      const card = document.createElement('div');
      card.className = 'music-card';
      card.innerHTML = `
        <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:${song.color};border-radius:12px 0 0 12px;"></div>
        <div class="music-card-artwork">
          ${song.image ? `<img src="${song.image}" alt="${song.song}" class="music-card-poster-img">` : '🎶'}
        </div>
        <div class="music-card-info">
          <div class="music-card-song">${song.song}</div>
          <div class="music-card-artist">${song.artist}</div>
          <div class="music-card-film">from "${song.film}"</div>
          <div class="music-links" style="margin-top: 0.6rem; justify-content: flex-start; gap: 0.5rem;">
            ${song.youtubeUrl ? `<a href="${song.youtubeUrl}" target="_blank" rel="noopener" class="music-link">▶ YouTube</a>` : ''}
          </div>
        </div>
      `;

      // Hover preview features only for Tamil songs
      if (containerId === 'music-tamil' && song.youtubeId) {
        let hoverTimeout;
        let wasPlaying = false;

        card.addEventListener('mouseenter', (e) => {
          card.classList.add('previewing');
          card.style.setProperty('--card-accent-glow', `${song.color}66`);

          hoverTimeout = setTimeout(() => {
            const player = previewPlayers[song.youtubeId];
            if (player && typeof player.playVideo === 'function') {
              // Pause background music if it is currently playing
              const bgAudio = document.getElementById('bg-music');
              wasPlaying = bgAudio && !bgAudio.paused;
              if (wasPlaying && typeof window.pauseMusic === 'function') {
                window.pauseMusic();
              }

              // Hide all other players, show this one
              document.querySelectorAll('.preview-player-wrapper').forEach(wrapper => {
                wrapper.style.display = 'none';
              });
              const activeWrapper = document.getElementById(`player-wrapper-${song.youtubeId}`);
              if (activeWrapper) {
                activeWrapper.style.display = 'block';
              }

              let popup = document.getElementById('youtube-hover-preview');
              if (popup) {
                popup.style.setProperty('--preview-accent', song.color);
                popup.style.display = 'block';
                requestAnimationFrame(() => {
                  popup.classList.add('show');
                });
                positionPopup(popup, e);
              }

              // Play cached player at start time
              player.seekTo(song.previewStart || 0, true);
              player.playVideo();
            }
          }, 200); // 200ms delay to start playing quickly
        });

        card.addEventListener('mousemove', (e) => {
          const popup = document.getElementById('youtube-hover-preview');
          if (popup && popup.style.display === 'block') {
            positionPopup(popup, e);
          }
        });

        card.addEventListener('mouseleave', () => {
          card.classList.remove('previewing');
          clearTimeout(hoverTimeout);

          const player = previewPlayers[song.youtubeId];
          if (player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
          }

          const popup = document.getElementById('youtube-hover-preview');
          if (popup) {
            popup.classList.remove('show');
            setTimeout(() => {
              if (!popup.classList.contains('show')) {
                popup.style.display = 'none';
              }
            }, 250);
          }

          // Resume background music if it was playing before
          if (wasPlaying && typeof window.playMusic === 'function') {
            window.playMusic();
            wasPlaying = false;
          }
        });
      }

      container.appendChild(card);
    });
  }

  /* ─── RENDER: CINEMA ────────────────────────────────────── */
  function renderCinema() {
    renderMovies('cinema-tamil', BIRTHDAY_DATA.movies.tamil);
    renderMovies('cinema-bollywood', BIRTHDAY_DATA.movies.bollywood);
    renderMovies('cinema-hollywood', BIRTHDAY_DATA.movies.hollywood);
  }

  function renderMovies(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container || !movies) return;

    movies.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="movie-poster">
          ${movie.image ? `<img src="${movie.image}" alt="${movie.title}" class="movie-poster-img">` : `<span>${movie.icon}</span>`}
        </div>
        <div class="movie-info">
          <div class="movie-title">${movie.title}</div>
          <div class="movie-director">Dir: ${movie.director}</div>
          <div class="movie-cast">${movie.cast}</div>
          <span class="movie-genre" style="background: ${movie.color}15; color: ${movie.color}; border: 1px solid ${movie.color}30;">${movie.genre}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  /* ─── RENDER: TAMIL NADU 2003 ───────────────────────────── */
  function renderTamilNadu() {
    const grid = document.getElementById('nostalgia-grid');
    if (!grid) return;

    const tn = BIRTHDAY_DATA.tamilNadu;

    const sections = [
      {
        icon: `<img src="assets/icons/tv_channels_icon_1781939827613.png" alt="TV Channels" class="tamilnadu-icon" loading="lazy">`,
        title: 'TV Channels',
        content: 'The golden era of Tamil television was just beginning.',
        tags: tn.tvChannels,
      },
      {
        icon: `<img src="assets/icons/serials_icon_1781939858308.png" alt="Serials" class="tamilnadu-icon" loading="lazy">`,
        title: 'Popular Serials',
        content: 'Families gathered every evening for their favourite serials.',
        tags: tn.serials,
      },
      {
        icon: `<img src="assets/icons/snacks_icon_1781939874577.png" alt="Snacks" class="tamilnadu-icon" loading="lazy">`,
        title: 'Favourite Snacks',
        content: 'The taste of childhood — before fancy imports took over.',
        tags: tn.snacks,
      },
      {
        icon: `<img src="assets/icons/petrol_icon_1781939890194.png" alt="Petrol Price" class="tamilnadu-icon" loading="lazy">`,
        title: 'Petrol Price',
        content: tn.petrolPrice + ' — Imagine filling your tank for a few hundred rupees!',
        tags: [],
      },
      {
        icon: `<img src="assets/icons/mobile_icon_1781939904683.png" alt="Mobile Phone" class="tamilnadu-icon" loading="lazy">`,
        title: 'Mobile Phones',
        content: tn.mobilePhones,
        tags: [],
      },
      {
        icon: `<img src="assets/icons/technology_icon_1781939957175.png" alt="Technology" class="tamilnadu-icon" loading="lazy">`,
        title: 'Technology',
        content: tn.technology,
        tags: [],
      },
    ];

    sections.forEach((section, index) => {
      const card = document.createElement('div');
      card.className = 'nostalgia-card reveal-item';
      card.dataset.delay = String(index * 100);
      
      card.innerHTML = `
        <span class="nostalgia-icon">${section.icon}</span>
        <div class="nostalgia-title">${section.title}</div>
        <div class="nostalgia-content">${section.content}</div>
        ${section.tags.length > 0 ? `
          <div class="nostalgia-tags">
            ${section.tags.map(tag => `<span class="nostalgia-tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      `;
      grid.appendChild(card);
    });
  }


  /* ─── RENDER: INDIA EVENTS ──────────────────────────────── */
  function renderEvents() {
    const timeline = document.getElementById('events-timeline');
    if (!timeline) return;

    BIRTHDAY_DATA.indiaEvents.forEach((event, index) => {
      const item = document.createElement('div');
      item.className = 'event-item reveal-item';
      item.dataset.delay = String(index * 150);
      item.innerHTML = `
        <div class="event-dot">${event.icon}</div>
        <div class="event-date">${event.date}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-description">${event.description}</div>
      `;
      timeline.appendChild(item);
    });
  }


  /* ─── LOAD: LETTER ──────────────────────────────────────── */
  function loadLetter() {
    fetch('data/letter.json?v=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('Letter not found');
        return res.json();
      })
      .then(data => {
        const greeting = document.getElementById('letter-greeting');
        const body = document.getElementById('letter-body');
        const closing = document.getElementById('letter-closing');
        const sender = document.getElementById('letter-sender');

        if (greeting && data.greeting) greeting.textContent = data.greeting;
        if (closing && data.closing) closing.textContent = data.closing;
        if (sender && data.senderName) sender.textContent = data.senderName;

        if (body && data.paragraphs) {
          body.innerHTML = data.paragraphs
            .map(p => `<p class="letter-paragraph">${p}</p>`)
            .join('');
        }
      })
      .catch(err => {
        console.log('Letter: Using default content.', err.message);
        // Default letter content (fallback for file:// protocol)
        const body = document.getElementById('letter-body');
        if (body) {
          const defaultParagraphs = [
            "On August 2, 2003, somewhere in this vast, spinning world — you arrived. And just like that, everything shifted. The stars realigned, the universe made a little more sense, and a story that would change lives forever quietly began.",
            "You probably don't realize how much light you carry. The kind that doesn't announce itself — it just fills the room. The kind that makes ordinary moments feel like they matter. That's your magic.",
            "This little corner of the internet was built to remind you of something: the world was waiting for you. Every song that played, every headline that was written, every star that shone on that August night — they were all part of the prologue to your story.",
            "Happy Birthday. Not just today, but every single day you exist — because the world is better with you in it."
          ];
          body.innerHTML = defaultParagraphs
            .map(p => `<p class="letter-paragraph">${p}</p>`)
            .join('');
        }
      });
  }

  /* ─── LOAD: PHOTOS ──────────────────────────────────────── */
  function loadPhotos() {
    fetch('data/photos.json?v=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('Photos manifest not found');
        return res.json();
      })
      .then(data => {
        const grid = document.getElementById('gallery-grid');
        const empty = document.getElementById('gallery-empty');
        const title = document.getElementById('gallery-title');
        const subtitle = document.getElementById('gallery-subtitle');

        if (title && data.title) title.textContent = data.title;
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

        if (!data.photos || data.photos.length === 0 || (data.photos.length === 1 && data.photos[0].src === 'photos/sample.jpg')) {
          if (grid) grid.style.display = 'none';
          if (empty) empty.style.display = 'block';
          return;
        }

        if (grid) {
          data.photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'gallery-item reveal-item';
            item.innerHTML = `
              <img src="${photo.src}" alt="${photo.caption || 'Photo memory'}" loading="lazy">
            `;
            grid.appendChild(item);
          });
          
          // Re-trigger scroll reveal for newly added DOM elements
          if (typeof Animations !== 'undefined' && typeof Animations.initScrollReveal === 'function') {
            Animations.initScrollReveal();
          }
        }
      })
      .catch(err => {
        console.log('Photos: No gallery loaded. Using local fallback.', err.message);
        const grid = document.getElementById('gallery-grid');
        const empty = document.getElementById('gallery-empty');
        
        const fallbackPhotos = [
          { "src": "photos/akshu/1.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/2.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/3.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/4.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/5.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/6.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/7.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/8.jpg", "caption": "", "year": "" },
          { "src": "photos/akshu/9.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/10.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/11.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/12.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/13.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/14.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/15.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/16.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/17.jpeg", "caption": "", "year": "" },
          { "src": "photos/akshu/18.jpeg", "caption": "", "year": "" }
        ];

        if (grid) {
          grid.style.display = 'grid';
          if (empty) empty.style.display = 'none';
          grid.innerHTML = ''; // clear any sample templates

          fallbackPhotos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'gallery-item reveal-item';
            item.innerHTML = `
              <img src="${photo.src}" alt="${photo.caption || 'Photo memory'}" loading="lazy">
            `;
            grid.appendChild(item);
          });

          // Re-trigger scroll reveal for fallback DOM elements
          if (typeof Animations !== 'undefined' && typeof Animations.initScrollReveal === 'function') {
            Animations.initScrollReveal();
          }
        }
      });
  }

  /* ─── BOTTOM SCROLL Surpirse Modal ───────────────────────── */
  let scrollTriggered = false;

  function initScrollToBottomModal() {
    window.addEventListener('scroll', () => {
      if (scrollTriggered) return;
      
      const mainContent = document.getElementById('main-content');
      if (!mainContent || window.getComputedStyle(mainContent).display === 'none') return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPos = window.scrollY || window.pageYOffset || document.body.scrollTop;
      
      // Trigger when within 25px of the bottom of the page
      if (scrollHeight - clientHeight - scrollPos <= 25) {
        scrollTriggered = true;
        showHappyQuestionModal();
      }
    });
  }

  function showHappyQuestionModal() {
    if (document.getElementById('happy-question-overlay')) return;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'happy-question-overlay';
    overlay.className = 'happy-modal-overlay';
    
    // Create content element
    const modal = document.createElement('div');
    modal.className = 'happy-modal-content';
    modal.innerHTML = `
      <div class="happy-modal-flourish">✦</div>
      <h2 class="happy-modal-question">Happy ?????</h2>
      <div class="happy-modal-buttons">
        <button id="happy-yes-btn" class="happy-btn happy-btn-yes">Yes</button>
        <button id="happy-no-btn" class="happy-btn happy-btn-no">No</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const noBtn = modal.querySelector('#happy-no-btn');
    const yesBtn = modal.querySelector('#happy-yes-btn');
    
    let isMoving = false;
    let originalLeft = null;
    let originalTop = null;
    
    // Mouse movement repel logic allowing button to escape cursor push smoothly
    const handleNoButtonRepel = (e) => {
      if (!noBtn || isMoving) return;
      
      const rect = noBtn.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      
      const distanceToCursor = Math.sqrt(Math.pow(e.clientX - buttonCenterX, 2) + Math.pow(e.clientY - buttonCenterY, 2));
      
      // Repel if the cursor gets within 105px of the button center
      if (distanceToCursor < 105) {
        isMoving = true;
        
        // Convert to fixed coordinate mapping once to establish layout anchor
        if (originalLeft === null) {
          // Temporarily disable transitions to prevent transition anomalies from auto layout styles
          noBtn.style.transition = 'none';
          
          originalLeft = rect.left;
          originalTop = rect.top;
          
          // Reparent to document.body to bypass parent modal transforms
          document.body.appendChild(noBtn);
          
          noBtn.style.position = 'fixed';
          noBtn.style.left = `${originalLeft}px`;
          noBtn.style.top = `${originalTop}px`;
          noBtn.style.margin = '0';
          noBtn.style.zIndex = '999999';
          
          // Force layout reflow
          noBtn.offsetHeight;
          
          // Re-enable stylesheet transitions
          noBtn.style.transition = '';
        }
        
        // Calculate angle of push away from cursor
        const angle = Math.atan2(buttonCenterY - e.clientY, buttonCenterX - e.clientX);
        // Add a slight random variation to the angle (up to 20 degrees) so it drifts organically
        const driftAngle = angle + (Math.random() - 0.5) * 0.35;
        // Escape distance: Leap between 180px and 280px
        const leapDistance = 180 + Math.random() * 100;
        
        let targetX = rect.left + Math.cos(driftAngle) * leapDistance;
        let targetY = rect.top + Math.sin(driftAngle) * leapDistance;
        
        // Boundaries with screen margin
        const pad = 40;
        const maxX = window.innerWidth - rect.width - pad;
        const maxY = window.innerHeight - rect.height - pad;
        
        // Bounce off screen boundaries
        if (targetX < pad) targetX = pad + Math.random() * 40;
        if (targetX > maxX) targetX = maxX - Math.random() * 40;
        if (targetY < pad) targetY = pad + Math.random() * 40;
        if (targetY > maxY) targetY = maxY - Math.random() * 40;
        
        // Yes button rectangle
        const yesRect = yesBtn.getBoundingClientRect();
        
        const overlapsYes = (x, y) => {
          const buffer = 85; // Buffer to prevent button landing on/behind the Yes button
          return !(x + rect.width < yesRect.left - buffer || 
                   x > yesRect.right + buffer || 
                   y + rect.height < yesRect.top - buffer || 
                   y > yesRect.bottom + buffer);
        };
        
        let attempts = 0;
        let foundValid = false;
        // Adjust angle if it overlaps the Yes button, falling back to viewport coordinates if stuck
        while (attempts < 50) {
          if (attempts > 10) {
            // Fallback: Generate completely random viewport coordinates that are safe
            targetX = pad + Math.random() * (maxX - pad);
            targetY = pad + Math.random() * (maxY - pad);
          } else {
            // Leap away direction with search drift increments
            const testAngle = driftAngle + (attempts * Math.PI / 4) + (Math.random() - 0.5) * 0.2;
            targetX = rect.left + Math.cos(testAngle) * leapDistance;
            targetY = rect.top + Math.sin(testAngle) * leapDistance;
            
            // Clamp to viewport edges
            if (targetX < pad) targetX = pad;
            if (targetX > maxX) targetX = maxX;
            if (targetY < pad) targetY = pad;
            if (targetY > maxY) targetY = maxY;
          }
          
          const distToCursor = Math.sqrt(Math.pow(targetX + rect.width/2 - e.clientX, 2) + Math.pow(targetY + rect.height/2 - e.clientY, 2));
          
          if (distToCursor >= 130 && !overlapsYes(targetX, targetY)) {
            foundValid = true;
            break;
          }
          attempts++;
        }
        
        // Apply GPU-accelerated translation relative to original anchor layout
        const dx = targetX - originalLeft;
        const dy = targetY - originalTop;
        noBtn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        
        // Cool down timer matches CSS transition speed (220ms)
        setTimeout(() => {
          isMoving = false;
        }, 220);
      }
    };
    
    document.addEventListener('mousemove', handleNoButtonRepel);
    
    // Yes button action
    yesBtn.addEventListener('click', () => {
      document.removeEventListener('mousemove', handleNoButtonRepel);
      
      // Clean up the repelled No button from document body if it exists
      if (noBtn && noBtn.parentNode) {
        noBtn.remove();
      }
      
      // Play a quick whoosh transition sound on click if sound FX is loaded
      if (typeof SFX !== 'undefined' && typeof SFX.whoosh === 'function') {
        SFX.whoosh();
      }
      
      modal.innerHTML = `
        <div class="happy-modal-flourish">✦</div>
        <div id="gift-box-wrapper" class="gift-box-container">
          <div class="gift-box">
            <div class="gift-bow"></div>
            <div class="gift-lid"></div>
            <div class="gift-ribbon-vertical"></div>
            <div class="gift-ribbon-horizontal"></div>
            <div class="gift-body"></div>
          </div>
        </div>
        <h2 class="happy-modal-gift-text">Ask Devi for your gift</h2>
        <div class="happy-modal-flourish">✦</div>
      `;
      
      // Wait for 1 minute (60,000ms) in background silently
      setTimeout(() => {
        // Trigger box opening lid-pop transition first
        const giftContainer = modal.querySelector('#gift-box-wrapper');
        if (giftContainer) {
          giftContainer.classList.add('open');
        }
        
        // Play final opening whoosh sound FX
        if (typeof SFX !== 'undefined' && typeof SFX.whoosh === 'function') {
          setTimeout(() => SFX.whoosh(), 100);
        }
        
        // Short delay for the lid pop transition to complete (800ms) before the title blast
        setTimeout(() => {
          // Re-trigger celebration confetti blast once again (continuous)
          if (typeof Animations !== 'undefined' && Animations.Celebration) {
            Animations.Celebration.start();
          }
          
          // Display Once again happy birthday madam with id for fading
          modal.innerHTML = `
            <div class="happy-modal-flourish flourish-gold-blast">✦ ✦ ✦</div>
            <h1 id="final-bday-title" class="happy-modal-final-title">Once again happy birthday madam</h1>
            <div class="happy-modal-flourish">✦</div>
          `;
          
          // Slowly fade out the title after 5 seconds and display the Tamil message
          setTimeout(() => {
            const titleEl = modal.querySelector('#final-bday-title');
            if (titleEl) {
              titleEl.classList.add('faded');
              
              // Wait 1.5s for fade-out to complete, then replace and fade in Tamil text
              setTimeout(() => {
                titleEl.className = 'happy-modal-tamil-text';
                titleEl.textContent = 'indha ilippu eppavum un moonji la irundhutee irukanum';
                
                // Force layout reflow before triggering fade-in transition
                titleEl.offsetHeight;
                titleEl.classList.add('visible');
              }, 1500);
            }
          }, 5000);
        }, 800);
      }, 60000);
    });
  }

})();
