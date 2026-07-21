/* ╔══════════════════════════════════════════════════════════════╗
   ║  COUNTDOWN TIMER v2.0 — IST Timezone                      ║
   ║  Target: August 2, 2026, 12:00:00 AM IST                  ║
   ║  With SFX · 3D Flip · Particle Bursts                     ║
   ╚══════════════════════════════════════════════════════════════╝ */

const CountdownTimer = (() => {
  // Target: Aug 2, 2026 at midnight IST (UTC+5:30)
  const TARGET_DATE = new Date('2026-08-02T00:00:00+05:30');

  let timerInterval = null;
  let onCompleteCallback = null;
  let sfxUnlocked = false;
  let previousValues = { days: '', hours: '', minutes: '', seconds: '' };

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

    // Initialize 3D background
    if (typeof Abstract3D !== 'undefined') {
      Abstract3D.init();
    }

    // Initialize custom cursor
    if (typeof GoldCursor !== 'undefined') {
      GoldCursor.init();
    }

    // Unlock SFX (either on page load or on user interaction)
    const tryUnlockSFX = () => {
      if (sfxUnlocked || typeof SFX === 'undefined') return;

      SFX.unlock();
      if (SFX.isReady()) {
        sfxUnlocked = true;
        // Start ambient drone after a brief delay
        setTimeout(() => {
          SFX.ambientDrone();
        }, 500);
        
        // Successfully unlocked, so remove fallback gesture listeners
        removeInteractionListeners();
      }
    };

    const removeInteractionListeners = () => {
      document.removeEventListener('click', tryUnlockSFX, true);
      document.removeEventListener('touchstart', tryUnlockSFX, { capture: true });
      document.removeEventListener('keydown', tryUnlockSFX, true);
    };

    // 1. Try to unlock immediately on load (succeeds if browser allows autoplay)
    tryUnlockSFX();

    // 2. Set up fallback interaction listeners in case browser blocks autoplay
    if (!sfxUnlocked) {
      document.addEventListener('click', tryUnlockSFX, true);
      document.addEventListener('touchstart', tryUnlockSFX, { capture: true, passive: true });
      document.addEventListener('keydown', tryUnlockSFX, true);
    }

    // Stop click propagation on overlay (preserve existing behavior)
    elements.overlay.addEventListener('click', (e) => {
      tryUnlockSFX(); // Ensure audio context unlocks on click anywhere on overlay
      if (e.target.closest('#enter-capsule-btn')) {
        return;
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

    // Add hover SFX to timer segments
    initTimerCardSFX();
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

    const newDays = padNumber(days, 2);
    const newHours = padNumber(hours, 2);
    const newMinutes = padNumber(minutes, 2);
    const newSeconds = padNumber(seconds, 2);

    // Animate changed values with flip effect + SFX
    updateValue(elements.days, newDays, 'days');
    updateValue(elements.hours, newHours, 'hours');
    updateValue(elements.minutes, newMinutes, 'minutes');
    updateValue(elements.seconds, newSeconds, 'seconds');

    // Play tick SFX on every second
    if (sfxUnlocked && typeof SFX !== 'undefined') {
      SFX.tick();
    }
  }

  function updateValue(element, newValue, key) {
    if (!element) return;

    if (previousValues[key] !== newValue) {
      const wrapper = element.closest('.countdown-value-wrapper');

      // Add flip animation class
      if (wrapper) {
        wrapper.classList.add('flip-animate');
        setTimeout(() => wrapper.classList.remove('flip-animate'), 500);
      }

      // Digit change micro-animation
      element.style.transform = 'translateY(-6px) scale(1.05)';
      element.style.opacity = '0.5';
      element.style.filter = 'blur(2px)';

      setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'translateY(0) scale(1)';
        element.style.opacity = '1';
        element.style.filter = 'blur(0)';
      }, 120);

      // Play digit blip SFX for major changes (not seconds)
      if (key !== 'seconds' && sfxUnlocked && typeof SFX !== 'undefined') {
        SFX.digitBlip();
      }

      previousValues[key] = newValue;
    }
  }

  function padNumber(num, length) {
    return String(num).padStart(length, '0');
  }

  /** Add hover chime SFX to each timer card */
  function initTimerCardSFX() {
    const segments = document.querySelectorAll('.countdown-segment');
    segments.forEach((seg, index) => {
      const wrapper = seg.querySelector('.countdown-value-wrapper');
      if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
          if (sfxUnlocked && typeof SFX !== 'undefined') {
            SFX.chime(index);
          }
        });
      }
    });
  }

  function revealBirthdayCelebration() {
    clearInterval(timerInterval);

    // Stop ambient drone
    if (typeof SFX !== 'undefined') {
      SFX.stopAmbient();
      SFX.setTickEnabled(false);
      // Play whoosh transition
      setTimeout(() => {
        if (SFX.isReady()) SFX.whoosh();
      }, 300);
    }

    // Destroy custom cursor
    // if (typeof GoldCursor !== 'undefined') {
    //   GoldCursor.destroy();
    // }

    // Fade out countdown content
    if (elements.info) {
      elements.info.classList.add('fade-out');
      
      // Wait for fade-out animation
      setTimeout(() => {
        elements.info.style.display = 'none';

        // Start celebration confetti
        if (typeof Animations !== 'undefined' && Animations.Celebration) {
          Animations.Celebration.start();
        }

        // Fade in birthday reveal content
        if (elements.reveal) {
          elements.reveal.style.display = 'flex';
          elements.reveal.offsetHeight;
          elements.reveal.classList.add('visible');
        }
      }, 800);
    } else {
      if (typeof Animations !== 'undefined' && Animations.Celebration) {
        Animations.Celebration.start();
      }
      if (elements.reveal) {
        elements.reveal.style.display = 'flex';
        elements.reveal.classList.add('visible');
      }
    }

    // Bind entering the capsule via Virtual Birthday Cake screen
    if (elements.enterBtn) {
      elements.enterBtn.addEventListener('click', () => {
        if (typeof SFX !== 'undefined' && typeof SFX.whoosh === 'function') {
          SFX.whoosh();
        }

        // Render Virtual Cake Screen inside reveal container
        if (typeof CakeBlowSystem !== 'undefined' && elements.reveal) {
          CakeBlowSystem.renderCakeScreen(elements.reveal, () => {
            // Callback when candles are blown out
            if (typeof Animations !== 'undefined' && Animations.Celebration) {
              Animations.Celebration.stop();
            }
            if (typeof Abstract3D !== 'undefined') {
              Abstract3D.destroy();
            }
            if (typeof window.playMusic === 'function') {
              window.playMusic();
            }
            hideCountdown();
          });
        } else {
          // Fallback if CakeBlowSystem is unavailable
          if (typeof Animations !== 'undefined' && Animations.Celebration) {
            Animations.Celebration.stop();
          }
          if (typeof Abstract3D !== 'undefined') {
            Abstract3D.destroy();
          }
          if (typeof window.playMusic === 'function') {
            window.playMusic();
          }
          hideCountdown();
        }
      }, { once: true });
    } else {
      setTimeout(hideCountdown, 4000);
    }
  }

  function hideCountdown() {
    if (elements.overlay) {
      elements.overlay.classList.add('hidden');
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
