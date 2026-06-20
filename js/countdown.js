/* ╔══════════════════════════════════════════════════════════════╗
   ║  COUNTDOWN TIMER — IST Timezone                            ║
   ║  Target: August 2, 2026, 12:00:00 AM IST                  ║
   ╚══════════════════════════════════════════════════════════════╝ */

const CountdownTimer = (() => {
  // Target: Aug 2, 2026 at midnight IST (UTC+5:30)
  const TARGET_DATE = new Date('2026-08-02T00:00:00+05:30');

  let timerInterval = null;
  let onCompleteCallback = null;

  // DOM elements
  const elements = {
    overlay: null,
    info: null,
    reveal: null,
    enterBtn: null,
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  };

  function init(onComplete) {
    onCompleteCallback = onComplete;

    elements.overlay = document.getElementById('countdown-overlay');
    elements.info = document.getElementById('countdown-info');
    elements.reveal = document.getElementById('birthday-reveal');
    elements.enterBtn = document.getElementById('enter-capsule-btn');
    elements.days = document.getElementById('countdown-days');
    elements.hours = document.getElementById('countdown-hours');
    elements.minutes = document.getElementById('countdown-minutes');
    elements.seconds = document.getElementById('countdown-seconds');

    if (!elements.overlay) return;

    // Stop click propagation on overlay to avoid triggering document click autoplay early (e.g. on bypass click)
    elements.overlay.addEventListener('click', (e) => {
      if (e.target.closest('#enter-capsule-btn')) {
        return; // Allow the enter button click to bubble and trigger standard interaction
      }
      e.stopPropagation();
    });

    // Hook up bypass button for test purposes
    const bypassBtn = document.getElementById('bypass-countdown');
    if (bypassBtn) {
      bypassBtn.addEventListener('click', () => {
        revealBirthdayCelebration();
      });
    }

    // Developer shortcut: Ctrl+Shift+V to bypass countdown
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'v' || e.key === 'V')) {
        console.info('Developer shortcut triggered: bypass countdown');
        revealBirthdayCelebration();
      }
    });

    // Developer bypass via URL param ?devbypass
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('devbypass')) {
      console.info('Developer bypass triggered');
      revealBirthdayCelebration();
      return;
    }

    // Check if birthday has already passed
    if (isBirthdayTime()) {
      hideCountdown();
      return;
    }

    // Start the countdown
    update();
    timerInterval = setInterval(update, 1000);
  }

  function getISTNow() {
    // Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    return new Date(utc + istOffset);
  }

  function isBirthdayTime() {
    const now = new Date();
    return now >= TARGET_DATE;
  }

  function update() {
    const now = new Date();
    const diff = TARGET_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      revealBirthdayCelebration();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Update with animated transitions
    updateValue(elements.days, padNumber(days, 2));
    updateValue(elements.hours, padNumber(hours, 2));
    updateValue(elements.minutes, padNumber(minutes, 2));
    updateValue(elements.seconds, padNumber(seconds, 2));
  }

  function updateValue(element, newValue) {
    if (!element) return;
    if (element.textContent !== newValue) {
      element.style.transform = 'translateY(-4px)';
      element.style.opacity = '0.6';
      setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
      }, 100);
    }
  }

  function padNumber(num, length) {
    return String(num).padStart(length, '0');
  }

  function revealBirthdayCelebration() {
    clearInterval(timerInterval);

    // Fade out countdown content
    if (elements.info) {
      elements.info.classList.add('fade-out');
      
      // Wait for fade-out animation to complete (800ms)
      setTimeout(() => {
        elements.info.style.display = 'none';

        // Start celebration confetti
        if (typeof Animations !== 'undefined' && Animations.Celebration) {
          Animations.Celebration.start();
        }

        // Fade in "Happy Birthday Akshaya" reveal content
        if (elements.reveal) {
          elements.reveal.style.display = 'flex';
          // Trigger a reflow to start transition
          elements.reveal.offsetHeight;
          elements.reveal.classList.add('visible');
        }
      }, 800);
    } else {
      // Fallback
      if (typeof Animations !== 'undefined' && Animations.Celebration) {
        Animations.Celebration.start();
      }
      if (elements.reveal) {
        elements.reveal.style.display = 'flex';
        elements.reveal.classList.add('visible');
      }
    }

    // Bind entering the capsule
    if (elements.enterBtn) {
      elements.enterBtn.addEventListener('click', () => {
        // Stop celebration confetti rendering
        if (typeof Animations !== 'undefined' && Animations.Celebration) {
          Animations.Celebration.stop();
        }
        // Start background music
        if (typeof window.playMusic === 'function') {
          window.playMusic();
        }
        hideCountdown();
      }, { once: true });
    } else {
      // Fallback if button is missing
      setTimeout(hideCountdown, 4000);
    }
  }

  function hideCountdown() {
    if (elements.overlay) {
      elements.overlay.classList.add('hidden');
      // Remove from DOM after transition
      setTimeout(() => {
        elements.overlay.style.display = 'none';
        if (onCompleteCallback) {
          onCompleteCallback();
        }
      }, 1500);
    } else {
      if (onCompleteCallback) {
        onCompleteCallback();
      }
    }
  }

  // Public API
  return {
    init,
    isBirthdayTime,
  };
})();
