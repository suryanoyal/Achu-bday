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
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  };

  function init(onComplete) {
    onCompleteCallback = onComplete;

    elements.overlay = document.getElementById('countdown-overlay');
    elements.days = document.getElementById('countdown-days');
    elements.hours = document.getElementById('countdown-hours');
    elements.minutes = document.getElementById('countdown-minutes');
    elements.seconds = document.getElementById('countdown-seconds');

    if (!elements.overlay) return;

    // Hook up bypass button for test purposes
    const bypassBtn = document.getElementById('bypass-countdown');
    if (bypassBtn) {
      bypassBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        hideCountdown();
      });
    }
    // Developer shortcut: Ctrl+Shift+D to bypass countdown
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        console.info('Developer shortcut triggered: bypass countdown');
        hideCountdown();
      }
    });

    // Developer bypass via URL param ?devbypass
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('devbypass')) {
      console.info('Developer bypass triggered');
      hideCountdown();
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
      clearInterval(timerInterval);
      hideCountdown();
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
