/* ╔══════════════════════════════════════════════════════════════╗
   ║  VIRTUAL BIRTHDAY CAKE & MIC CANDLE BLOW SYSTEM             ║
   ║  Web Audio API · Microphone Blow Detection · Candle Smoke    ║
   ╚══════════════════════════════════════════════════════════════╝ */

const CakeBlowSystem = (() => {
  let audioStream = null;
  let audioCtx = null;
  let analyser = null;
  let animFrameId = null;
  let blownOut = false;
  let onCompleteCallback = null;

  function renderCakeScreen(containerElement, onComplete) {
    onCompleteCallback = onComplete;
    blownOut = false;

    containerElement.innerHTML = `
      <div class="cake-screen-container">
        <h1 class="cake-title">Make a Wish, Akshayaaaa! 🎂</h1>
        <p class="cake-subtitle" id="cake-prompt-text">Blow into your microphone to blow out the candles! 🌬️✨</p>

        <div class="cake-wrapper">
          <div class="candles-row">
            <div class="candle">
              <div class="candle-wick"></div>
              <div class="flame-container" id="flame-1">
                <div class="flame-glow"></div>
                <div class="flame"></div>
              </div>
              <div class="smoke-puff"></div>
            </div>
            <div class="candle">
              <div class="candle-wick"></div>
              <div class="flame-container" id="flame-2">
                <div class="flame-glow"></div>
                <div class="flame"></div>
              </div>
              <div class="smoke-puff"></div>
            </div>
            <div class="candle">
              <div class="candle-wick"></div>
              <div class="flame-container" id="flame-3">
                <div class="flame-glow"></div>
                <div class="flame"></div>
              </div>
              <div class="smoke-puff"></div>
            </div>
          </div>

          <div class="cake-tier-top"></div>
          <div class="cake-tier-bottom"></div>
          <div class="cake-plate"></div>
        </div>

        <div class="mic-meter-container">
          <div id="mic-meter-fill" class="mic-meter-fill"></div>
        </div>

        <div id="mic-instruction-badge" class="mic-instruction-badge">
          <span class="mic-icon-pulse">🎙️</span> Blow into your mic to blow out the candles! 💨
        </div>

        <button id="emergency-blow-btn" class="emergency-blow-btn" title="Emergency blow if mic fails">
          💨 (Emergency Blow)
        </button>
      </div>
    `;

    const emergencyBtn = containerElement.querySelector('#emergency-blow-btn');
    if (emergencyBtn) {
      emergencyBtn.addEventListener('click', () => {
        triggerCandleExtinguish();
      });
    }

    // Start listening to microphone
    initMicListener();
  }

  async function initMicListener() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Mic API not supported on this browser.');
        return;
      }

      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      audioCtx = new AC();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(audioStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let blowSustainedFrames = 0;
      let calibrationFrames = 0;
      let ambientNoiseFloor = 20;

      function checkAudio() {
        if (blownOut) return;

        analyser.getByteFrequencyData(dataArray);

        // Focus on low-mid frequency bins (plosive breath/wind turbulence noise)
        // Bins 0..16 represent 0Hz to ~1.3kHz where blowing air has strong energy
        let lowFreqSum = 0;
        const lowBinsCount = Math.floor(bufferLength * 0.35); // lower 35% of spectrum
        for (let i = 0; i < lowBinsCount; i++) {
          lowFreqSum += dataArray[i];
        }
        const lowFreqAverage = lowFreqSum / lowBinsCount;

        // Calibrate ambient noise floor for the first 25 frames (~400ms)
        if (calibrationFrames < 25) {
          calibrationFrames++;
          ambientNoiseFloor = Math.max(ambientNoiseFloor, lowFreqAverage);
          animFrameId = requestAnimationFrame(checkAudio);
          return;
        }

        // Update visual mic meter bar relative to dynamic range
        const meterFill = document.getElementById('mic-meter-fill');
        if (meterFill) {
          const effectiveVal = Math.max(0, lowFreqAverage - ambientNoiseFloor);
          const pct = Math.min(100, Math.max(0, (effectiveVal / 70) * 100));
          meterFill.style.width = pct + '%';
        }

        // Blow detection threshold:
        // Must exceed both absolute threshold (75) and be significantly above ambient noise floor (+45)
        const blowThreshold = Math.max(75, ambientNoiseFloor + 45);

        if (lowFreqAverage > blowThreshold) {
          blowSustainedFrames++;
          // Require sustained blow for ~150-200ms (10 consecutive frames at 60fps)
          if (blowSustainedFrames >= 10) {
            triggerCandleExtinguish();
            return;
          }
        } else {
          blowSustainedFrames = Math.max(0, blowSustainedFrames - 1);
        }

        animFrameId = requestAnimationFrame(checkAudio);
      }

      checkAudio();
    } catch (err) {
      console.warn('Mic access not granted:', err);
      const promptText = document.getElementById('cake-prompt-text');
      if (promptText) {
        promptText.textContent = 'Please allow microphone access to blow out your candles! 🎙️✨';
      }
    }
  }

  function triggerCandleExtinguish() {
    if (blownOut) return;
    blownOut = true;

    // Stop mic stream
    stopMic();

    // Extinguish flames with staggered animation
    const flames = document.querySelectorAll('.flame-container');
    flames.forEach((flame, index) => {
      setTimeout(() => {
        flame.classList.add('blown-out');
      }, index * 120);
    });

    // Play blow wind sound FX
    if (typeof SFX !== 'undefined' && typeof SFX.whoosh === 'function') {
      SFX.whoosh();
    }

    // Update prompt title text
    const promptText = document.getElementById('cake-prompt-text');
    if (promptText) {
      promptText.textContent = '🎉 Your wish is on its way! Happy Birthday Akshayaaaa! ❤️';
    }

    // Trigger full celebration gold confetti blast
    setTimeout(() => {
      if (typeof Animations !== 'undefined' && Animations.Celebration) {
        Animations.Celebration.burst();
      }
    }, 400);

    // Call onComplete to proceed after 2.5 seconds
    setTimeout(() => {
      if (onCompleteCallback) {
        onCompleteCallback();
      }
    }, 2500);
  }

  function stopMic() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      audioStream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  }

  return {
    renderCakeScreen,
    triggerCandleExtinguish,
    stopMic,
  };
})();
