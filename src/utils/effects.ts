import confetti from 'canvas-confetti';

const POSITIVE_COLORS = ['#00ff00', '#26ff00', '#73ff00', '#9eff00'];
const NEGATIVE_COLORS = ['#ff0000', '#ff5500', '#ff8800'];

// Singleton AudioContext - évite la création de centaines de contextes
let _ctx: AudioContext | null = null;
const getCtx = (): AudioContext => {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') {
    _ctx.resume();
  }
  return _ctx;
};

const createExplosion = (angle: number, origin: { x: number }) => {
  confetti({
    particleCount: 7,
    angle,
    spread: 55,
    origin,
    colors: NEGATIVE_COLORS
  });
};

export const playPositiveEffect = (points: number) => {
  const intensity = Math.min(points / 5, 2);
  confetti({
    particleCount: Math.floor(50 * intensity),
    spread: 70,
    origin: { y: 0.6 },
    colors: POSITIVE_COLORS,
  });
};

export const playNegativeEffect = () => {
  const end = Date.now() + 200;

  const frame = () => {
    createExplosion(60, { x: 0 });
    createExplosion(120, { x: 1 });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

const createCustomExplosion = (x: number, y: number, colors: string[], particleCount: number) => {
  confetti({
    particleCount,
    startVelocity: 20,
    spread: 360,
    origin: { 
      x: x / window.innerWidth,
      y: y / window.innerHeight
    },
    colors,
    ticks: 200
  });
};

export const playBubbleEffect = (points: number, x: number, y: number) => {
  const colors = points > 0 ? POSITIVE_COLORS : NEGATIVE_COLORS;
  const particleCount = Math.abs(points) * 2;
  createCustomExplosion(x, y, colors, particleCount);
};

export const playTickSound = () => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = 880;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch (_) { /* audio non bloquant */ }
};

export const playComboSound = (variant: 'positive' | 'negative' | 'mixed' = 'positive') => {
  try {
    const ctx = getCtx();
    const freqSets = {
      positive: [600, 800, 1000, 1400],
      negative: [400, 300, 250, 180],
      mixed:    [500, 600, 550, 700],
    };
    freqSets[variant].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = variant === 'negative' ? 'sawtooth' : 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch (_) { /* audio non bloquant */ }
};

export const playMilestoneSound = (level: number) => {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    if (level >= 7) {
      const fanfare = [523, 659, 784, 1047, 1319, 1568];
      fanfare.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const t = now + i * 0.07;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
      });
      [523, 784, 1047, 1568].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + 0.55;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.8);
      });
    } else if (level >= 5) {
      [523, 659, 784, 1047, 1319].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq + level * 25;
        const t = now + i * 0.09;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } else {
      // intervalle fixe 0.1s, plus de calcul qui peut devenir négatif
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq + level * 30;
        const t = now + i * 0.1;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    }
  } catch (_) { /* audio non bloquant */ }
};

export const playMilestoneConfetti = (level: number) => {
  if (level < 5) return;
  const epicColors = ['#FFD700', '#FF00FF', '#00FFFF', '#FF4500', '#FFFFFF'];
  const warmColors = ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF'];
  const colors = level >= 7 ? epicColors : warmColors;

  confetti({
    particleCount: 60 + level * 25,
    spread: 90 + level * 10,
    startVelocity: 38 + level * 4,
    origin: { x: 0.88, y: 0.88 },
    colors,
    ticks: 200 + level * 40,
  });

  if (level >= 7) {
    setTimeout(() => confetti({
      particleCount: 300,
      spread: 360,
      startVelocity: 65,
      origin: { x: 0.5, y: 0.4 },
      colors,
      ticks: 500,
      gravity: 0.7,
    }), 200);
  }
};

export interface AmbientMusic {
  setVolume: (v: number) => void;
  stop: () => void;
}

export const createAmbientMusic = (type: 'home' | 'game'): AmbientMusic | null => {
  try {
    const ctx = getCtx();
    const targetVolume = type === 'home' ? 0.15 : 0.12;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    // Fade in progressif
    masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.5);

    // Couche 1 : bruit blanc filtré très bas = texture "bulle / underwater"
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = type === 'home' ? 130 : 180;
    noiseFilter.Q.value = 0.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.25;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();

    // Couche 2 : carillons aléatoires en pentatonique, decay long = son "eau / jeu"
    const pentatonic = type === 'home'
      ? [261.6, 293.7, 329.6, 392, 440, 523.3]     // Do4 pentatonique - doux
      : [329.6, 370, 415.3, 493.9, 554.4, 659.3];   // Mi4 pentatonique - plus vif

    let active = true;
    const scheduleChime = () => {
      if (!active) return;
      const delay = type === 'home'
        ? Math.random() * 2000 + 1500   // 1.5-3.5s entre notes
        : Math.random() * 1500 + 800;   // 0.8-2.3s entre notes

      setTimeout(() => {
        if (!active) return;
        try {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.connect(env);
          env.connect(masterGain);
          osc.type = 'sine';
          osc.frequency.value = pentatonic[Math.floor(Math.random() * pentatonic.length)];
          const t = ctx.currentTime;
          env.gain.setValueAtTime(0, t);
          env.gain.linearRampToValueAtTime(0.3, t + 0.015);
          env.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
          osc.start(t);
          osc.stop(t + 3.0);
        } catch (_) {}
        scheduleChime();
      }, delay);
    };
    scheduleChime();

    return {
      setVolume: (v: number) => {
        masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.3);
      },
      stop: () => {
        active = false;
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
        setTimeout(() => { try { noise.stop(); } catch (_) {} }, 2000);
      }
    };
  } catch (_) {
    return null;
  }
};