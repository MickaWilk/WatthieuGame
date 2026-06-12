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