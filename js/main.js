/* ╔══════════════════════════════════════════════════════════════╗
   ║  MAIN.JS — App Orchestration                               ║
   ║  Initialization · Data Rendering · Section Assembly         ║
   ╚══════════════════════════════════════════════════════════════╝ */

(function () {
  'use strict';

  /* ─── INITIALIZATION ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles (always visible, even during countdown)
    Animations.ParticleSystem.init();

    // Initialize countdown
    CountdownTimer.init(onBirthdayReached);

    // If birthday already, show content immediately
    if (CountdownTimer.isBirthdayTime()) {
      onBirthdayReached();
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

    container.innerHTML = counters.map(c => `
      <div class="counter-card" id="${c.id}-card">
        <span class="counter-value" id="${c.id}">0</span>
        <span class="counter-label">${c.label}</span>
      </div>
    `).join('');

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

  /* ─── INTERACTIVE SKY TIMELINE (iPhone Weather Style) ────── */
  function initInteractiveSky() {
    const slider = document.getElementById('sky-time-slider');
    const timeText = document.getElementById('sky-current-time');
    const statusText = document.getElementById('sky-time-status');
    const celestialBody = document.getElementById('sky-celestial-body');
    const sectionSky = document.getElementById('sky');
    const starCanvas = document.getElementById('star-canvas');

    if (!slider || !timeText || !statusText || !celestialBody || !sectionSky) return;

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

    const centerX = 160;
    const centerY = 140;
    const radiusX = 140;
    const radiusY = 100;

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

    function updateSky(minutes) {
      const hrs = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
      const displayMins = String(mins).padStart(2, '0');
      timeText.textContent = `${displayHrs}:${displayMins} ${ampm}`;

      const isDay = minutes >= 358 && minutes < 1118;
      
      let progress, angle;
      if (isDay) {
        progress = (minutes - 358) / (1118 - 358);
        angle = Math.PI - (progress * Math.PI);
        celestialBody.innerHTML = sunSvg;
        celestialBody.className = "sky-celestial-body sun";
        statusText.textContent = minutes === 720 ? "Midday" : (minutes < 720 ? "Morning" : "Afternoon");
      } else {
        let nightProgress;
        const nightLength = (1440 - 1118) + 358;
        if (minutes >= 1118) {
          nightProgress = (minutes - 1118) / nightLength;
        } else {
          nightProgress = ((1440 - 1118) + minutes) / nightLength;
        }
        angle = Math.PI - (nightProgress * Math.PI);
        celestialBody.innerHTML = moonSvg;
        celestialBody.className = "sky-celestial-body moon";
        statusText.textContent = minutes >= 1118 || minutes < 60 ? "Evening / Dusk" : "Late Night";
      }

      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY - radiusY * Math.sin(angle);
      
      const leftPct = (x / 320) * 100;
      const topPct = (y / 160) * 100;
      celestialBody.style.left = `${leftPct}%`;
      celestialBody.style.top = `${topPct}%`;

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
          ${b.spotifyUrl ? `<a href="${b.spotifyUrl}" target="_blank" rel="noopener" class="music-link">▶ Spotify</a>` : ''}
          ${b.youtubeUrl ? `<a href="${b.youtubeUrl}" target="_blank" rel="noopener" class="music-link">▶ YouTube</a>` : ''}
        </div>
      </div>
    `;
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
          ${song.youtubeUrl ? `<div class="music-card-link"><a href="${song.youtubeUrl}" target="_blank" rel="noopener" class="music-link">▶ YouTube</a></div>` : ''}
        </div>
      `;
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
        icon: `<img src="assets/icons/internet_icon_1781939918379.png" alt="Internet" class="tamilnadu-icon" loading="lazy">`,
        title: 'Internet & Cyber Cafés',
        content: tn.internet,
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

})();
