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

  function renderCakeScreen(containerElement, onComplete, startUnlit = true) {
    onCompleteCallback = onComplete;
    blownOut = false;

    const unlitClass = startUnlit ? 'unlit' : '';

    containerElement.innerHTML = `
      <div class="cake-screen-container">
        <h1 class="cake-title">Make a Wish, Achuuu! 🎂</h1>
        <p class="cake-subtitle" id="cake-prompt-text">Come near to the screen and blow the candles! 🌬️✨</p>

        <div class="cake-wrapper" id="interactive-cake" style="cursor: pointer;" title="Click or tap to blow out candles">
          <div class="candles-row">
            <div class="candle">
              <div class="candle-wick"></div>
              <div class="flame-container ${unlitClass}" id="flame-1">
                <div class="flame-glow"></div>
                <div class="flame"></div>
              </div>
              <div class="smoke-puff"></div>
            </div>
            <div class="candle">
              <div class="candle-wick"></div>
              <div class="flame-container ${unlitClass}" id="flame-2">
                <div class="flame-glow"></div>
                <div class="flame"></div>
              </div>
              <div class="smoke-puff"></div>
            </div>
            <div class="candle">
              <div class="candle-wick"></div>
              <div class="flame-container ${unlitClass}" id="flame-3">
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
      </div>
    `;

    const cakeWrapper = containerElement.querySelector('#interactive-cake');
    if (cakeWrapper) {
      cakeWrapper.addEventListener('click', () => {
        triggerCandleExtinguish();
      });
    }

    // Start listening to microphone
    initMicListener();
  }

  async function requestMicPermission() {
    if (audioStream) return audioStream;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return null;
      }
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && !audioCtx) {
        audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      return audioStream;
    } catch (err) {
      console.warn('Mic permission not granted yet:', err);
      return null;
    }
  }

  async function initMicListener() {
    try {
      if (!audioStream) {
        await requestMicPermission();
      }
      if (!audioStream) return;

      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      if (!audioCtx) {
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      if (!analyser) {
        const source = audioCtx.createMediaStreamSource(audioStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.2;
        source.connect(analyser);
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let blowSustainedFrames = 0;
      let calibrationFrames = 0;
      let ambientNoiseFloor = 15;

      function checkAudio() {
        if (blownOut) return;

        analyser.getByteFrequencyData(dataArray);

        // 1. Low Voice/Vowel Band (100Hz - 1000Hz): Speech formants
        let lowSum = 0;
        const lowStart = 1;
        const lowEnd = Math.floor(bufferLength * 0.06); // ~1000Hz
        for (let i = lowStart; i < lowEnd; i++) {
          lowSum += dataArray[i];
        }
        const lowAvg = lowSum / (lowEnd - lowStart);

        // 2. High Wind Friction Band (2200Hz - 7500Hz): Blowing "Uff" turbulent noise
        let highSum = 0;
        const highStart = Math.floor(bufferLength * 0.14); // ~2200Hz
        const highEnd = Math.floor(bufferLength * 0.45);   // ~7500Hz
        for (let i = highStart; i < highEnd; i++) {
          highSum += dataArray[i];
        }
        const highAvg = highSum / (highEnd - highStart);

        // Calibrate ambient noise floor for initial 25 frames (~400ms)
        if (calibrationFrames < 25) {
          calibrationFrames++;
          ambientNoiseFloor = Math.max(ambientNoiseFloor, highAvg);
          animFrameId = requestAnimationFrame(checkAudio);
          return;
        }

        // Spectral Ratio: High Friction Noise vs Low Vocal Formants
        // Normal Speech talking has ratio < 0.40. Blowing "uff" sound has ratio > 0.55
        const blowNoiseRatio = highAvg / (lowAvg + 1);

        // Update visual mic meter bar for blowing intensity
        const meterFill = document.getElementById('mic-meter-fill');
        if (meterFill) {
          const effectiveVal = Math.max(0, highAvg - ambientNoiseFloor);
          const pct = Math.min(100, Math.max(0, (effectiveVal / 60) * 100));
          meterFill.style.width = pct + '%';
        }

        // Strict "Uff" / Blowing Sound Criteria:
        // - High frequency air friction energy > 48
        // - High frequency energy significantly above ambient noise (+28)
        // - High/Low Noise ratio > 0.52 (filters out human vocal speech, singing, talking)
        const isBlowingSound = (highAvg > 48) && 
                               (highAvg > ambientNoiseFloor + 28) && 
                               (blowNoiseRatio > 0.52);

        if (isBlowingSound) {
          blowSustainedFrames++;
          if (blowSustainedFrames >= 8) {
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
      promptText.textContent = '🎉 Your wish is on its way! Happy Birthday Achuuu! ❤️';
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

  function lightCandle(index) {
    const flame = document.getElementById(`flame-${index}`);
    if (flame) {
      flame.classList.remove('unlit');
    }
  }

  function lightAllCandles() {
    [1, 2, 3].forEach(i => lightCandle(i));
  }

  return {
    renderCakeScreen,
    triggerCandleExtinguish,
    stopMic,
    requestMicPermission,
    lightCandle,
    lightAllCandles,
  };
})();
