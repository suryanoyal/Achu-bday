/* ╔══════════════════════════════════════════════════════════════╗
   ║  SFX ENGINE — Web Audio API Synthesized Sound Effects      ║
   ║  Ambient Drone · Tick · Chime · Whoosh                     ║
   ╚══════════════════════════════════════════════════════════════╝ */

const SFX = (() => {
  let audioCtx = null;
  let masterGain = null;
  let ambientNodes = null;
  let unlocked = false;
  let ambientPlaying = false;
  let tickEnabled = true;

  /* ─── Initialize Audio Context (call on first user gesture or page load) ── */
  function unlock() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      
      if (!audioCtx) {
        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(audioCtx.destination);
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (audioCtx.state === 'running') {
        unlocked = true;
      }
    } catch (e) {
      console.warn('SFX: AudioContext init failed', e);
    }
  }

  function isReady() {
    return unlocked && audioCtx && audioCtx.state === 'running';
  }

  /* ─── Master Volume ──────────────────────────────────────────── */
  function setVolume(v) {
    if (masterGain) {
      masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), audioCtx.currentTime, 0.1);
    }
  }

  /* ─── AMBIENT DRONE ──────────────────────────────────────────── */
  function ambientDrone() {
    if (!isReady() || ambientPlaying) return;
    ambientPlaying = true;

    const now = audioCtx.currentTime;

    // Create a lush pad with multiple detuned oscillators
    const voices = [];
    const frequencies = [55, 82.41, 110, 164.81]; // A1, E2, A2, E3
    const detunes = [-8, -3, 3, 7];

    const droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.06, now + 4); // Slow fade in

    // Reverb simulation via delay feedback
    const delay = audioCtx.createDelay(1.0);
    delay.delayTime.value = 0.4;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.3;
    const delayFilter = audioCtx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 800;

    droneGain.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(masterGain);
    droneGain.connect(masterGain);

    frequencies.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detunes[i];

      // Subtle LFO for gentle movement
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.15 + i * 0.05;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 2 + i; // subtle pitch wobble
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      // Individual voice filter for warmth
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400 + i * 100;
      filter.Q.value = 0.5;

      osc.connect(filter);
      filter.connect(droneGain);
      osc.start(now);

      voices.push({ osc, lfo, filter });
    });

    // Sub bass layer
    const subOsc = audioCtx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = 36.71; // D1
    const subGain = audioCtx.createGain();
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.04, now + 6);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now);

    ambientNodes = { voices, droneGain, subOsc, subGain, delay, feedback };
  }

  function stopAmbient() {
    if (!ambientNodes || !audioCtx) return;
    const now = audioCtx.currentTime;

    ambientNodes.droneGain.gain.linearRampToValueAtTime(0, now + 2);
    ambientNodes.subGain.gain.linearRampToValueAtTime(0, now + 2);

    setTimeout(() => {
      try {
        ambientNodes.voices.forEach(v => {
          v.osc.stop();
          v.lfo.stop();
        });
        ambientNodes.subOsc.stop();
      } catch (e) { /* already stopped */ }
      ambientPlaying = false;
      ambientNodes = null;
    }, 2500);
  }

  /* ─── TICK (every second) ────────────────────────────────────── */
  function tick() {
    if (!isReady() || !tickEnabled) return;

    const now = audioCtx.currentTime;

    // Metallic click — short filtered noise burst + sine ping
    const bufferSize = audioCtx.sampleRate * 0.03;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    const tickFilter = audioCtx.createBiquadFilter();
    tickFilter.type = 'bandpass';
    tickFilter.frequency.value = 4200;
    tickFilter.Q.value = 12;

    const tickGain = audioCtx.createGain();
    tickGain.gain.setValueAtTime(0.12, now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noiseSource.connect(tickFilter);
    tickFilter.connect(tickGain);
    tickGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.06);

    // Subtle sine ping for tonal quality
    const ping = audioCtx.createOscillator();
    ping.type = 'sine';
    ping.frequency.value = 2800;
    const pingGain = audioCtx.createGain();
    pingGain.gain.setValueAtTime(0.04, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    ping.connect(pingGain);
    pingGain.connect(masterGain);
    ping.start(now);
    ping.stop(now + 0.05);
  }

  /* ─── CHIME (hover on timer cards) ──────────────────────────── */
  function chime(pitch = 0) {
    if (!isReady()) return;

    const now = audioCtx.currentTime;
    const baseFreqs = [1047, 1319, 1568, 2093]; // C6, E6, G6, C7
    const freq = baseFreqs[pitch % baseFreqs.length];

    // Main bell tone
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    // Harmonic overtone
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.756; // bell-like inharmonic ratio
    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.02, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    // Third partial
    const osc3 = audioCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 5.404;
    const gain3 = audioCtx.createGain();
    gain3.gain.setValueAtTime(0.008, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);

    osc.start(now);
    osc2.start(now);
    osc3.start(now);
    osc.stop(now + 1);
    osc2.stop(now + 0.5);
    osc3.stop(now + 0.3);
  }

  /* ─── WHOOSH (cinematic transition) ─────────────────────────── */
  function whoosh() {
    if (!isReady()) return;

    const now = audioCtx.currentTime;

    // Filtered noise sweep
    const duration = 1.5;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(100, now + duration);
    filter.Q.value = 3;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(now);
    source.stop(now + duration);

    // Low cinematic boom
    const boom = audioCtx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(80, now);
    boom.frequency.exponentialRampToValueAtTime(20, now + 0.8);
    const boomGain = audioCtx.createGain();
    boomGain.gain.setValueAtTime(0.2, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    boom.connect(boomGain);
    boomGain.connect(masterGain);
    boom.start(now);
    boom.stop(now + 1);
  }

  /* ─── DIGIT CHANGE BLIP ─────────────────────────────────────── */
  function digitBlip() {
    if (!isReady()) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /* ─── Tick Toggle ────────────────────────────────────────────── */
  function setTickEnabled(enabled) {
    tickEnabled = enabled;
  }

  /* ─── Public API ─────────────────────────────────────────────── */
  return {
    unlock,
    isReady,
    setVolume,
    ambientDrone,
    stopAmbient,
    tick,
    chime,
    whoosh,
    digitBlip,
    setTickEnabled,
  };
})();
