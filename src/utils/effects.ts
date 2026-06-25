import confetti from 'canvas-confetti';

const POSITIVE_COLORS = ['#00ff00', '#26ff00', '#73ff00', '#9eff00'];
const NEGATIVE_COLORS = ['#ff0000', '#ff5500', '#ff8800'];

// Singleton AudioContext - évite la création de centaines de contextes
let _ctx: AudioContext | null = null;
const getCtx = (): AudioContext => {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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

// ─── Variantes d'explosion positives (vertes, festives) ───────────────────────

// Variante 1 : Burst radial 360° - style de base, toutes directions
const positiveBurst360 = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount,
    startVelocity: 20,
    spread: 360,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: POSITIVE_COLORS,
    ticks: 200,
  });
};

// Variante 2 : Fontaine verticale - jaillit vers le haut, spread étroit
const positiveFountain = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount,
    angle: 90,
    spread: 28,
    startVelocity: 45,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: POSITIVE_COLORS,
    ticks: 260,
    gravity: 0.8,
  });
};

// Variante 3 : Pluie d'étoiles - shapes star, scalaire large, longue durée
const positiveStars = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount: Math.max(particleCount, 12),
    spread: 180,
    startVelocity: 18,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: POSITIVE_COLORS,
    shapes: ['star'],
    scalar: 1.4,
    ticks: 340,
    gravity: 0.6,
  });
};

// Variante 4 : Double canon latéral - deux tirs depuis le point, angles 60° et 120°
const positiveDoubleCanon = (x: number, y: number, particleCount: number) => {
  const origin = { x: x / window.innerWidth, y: y / window.innerHeight };
  const half = Math.max(Math.floor(particleCount / 2), 6);
  confetti({ particleCount: half, angle: 60,  spread: 35, startVelocity: 32, origin, colors: POSITIVE_COLORS, ticks: 220 });
  confetti({ particleCount: half, angle: 120, spread: 35, startVelocity: 32, origin, colors: POSITIVE_COLORS, ticks: 220 });
};

// Variante 5 : Explosion scintillante lente - gravité faible, dérive, longue
const positiveGlitter = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount: Math.max(particleCount, 14),
    spread: 360,
    startVelocity: 12,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: POSITIVE_COLORS,
    ticks: 320,
    gravity: 0.4,
    drift: 0.8,
    scalar: 0.9,
  });
};

const POSITIVE_VARIANTS = [
  positiveBurst360,
  positiveFountain,
  positiveStars,
  positiveDoubleCanon,
  positiveGlitter,
] as const;

// ─── Variantes d'explosion négatives (rouges, sèches/lourdes) ─────────────────

// Variante 1 : Explosion radiale rouge - style de base
const negativeBurstRadial = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount,
    startVelocity: 20,
    spread: 360,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: NEGATIVE_COLORS,
    ticks: 200,
  });
};

// Variante 2 : Burst sec et rapide - haute vélocité, ticks courts
const negativeDryBurst = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount: Math.max(Math.floor(particleCount * 0.7), 8),
    startVelocity: 50,
    spread: 80,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: NEGATIVE_COLORS,
    ticks: 80,
    gravity: 1.2,
  });
};

// Variante 3 : Éclats lourds qui chutent - gravité forte, vers le bas
const negativeHeavyFall = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount,
    angle: 270,
    spread: 100,
    startVelocity: 22,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#8b0000', '#cc0000', '#ff0000', '#1a0000'],
    ticks: 180,
    gravity: 2.2,
    scalar: 1.1,
  });
};

// Variante 4 : Nuage dispersé terne - spread large, petites particules, peu nombreuses
const negativeDullCloud = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount: Math.max(Math.floor(particleCount * 0.6), 6),
    spread: 120,
    startVelocity: 10,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#7f0000', '#991a00', '#aa3300'],
    ticks: 140,
    gravity: 1.0,
    scalar: 0.7,
  });
};

// Variante 5 : "Fumée" qui dérive et retombe - drift fort, ticks modérés
const negativeSmokey = (x: number, y: number, particleCount: number) => {
  confetti({
    particleCount: Math.max(particleCount, 10),
    spread: 60,
    startVelocity: 14,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#660000', '#440000', '#ff2200', '#330000'],
    ticks: 200,
    gravity: 1.5,
    drift: 1.4,
    scalar: 0.85,
  });
};

const NEGATIVE_VARIANTS = [
  negativeBurstRadial,
  negativeDryBurst,
  negativeHeavyFall,
  negativeDullCloud,
  negativeSmokey,
] as const;

export const playBubbleEffect = (points: number, x: number, y: number) => {
  const particleCount = Math.max(Math.abs(points) * 2, 8);
  if (points > 0) {
    const variant = POSITIVE_VARIANTS[Math.floor(Math.random() * POSITIVE_VARIANTS.length)];
    variant(x, y, particleCount);
  } else {
    const variant = NEGATIVE_VARIANTS[Math.floor(Math.random() * NEGATIVE_VARIANTS.length)];
    variant(x, y, particleCount);
  }
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

// Son d'humiliation : descente sawtooth qui s'effondre, façon "trombone triste"
export const playMilestoneFailSound = (level: number) => {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    // Plus on s'enfonce, plus la chute est grave et longue
    const base = 220 - level * 12;
    const notes = [base, base * 0.84, base * 0.7, base * 0.55];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = now + i * 0.13;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
    // "Splat" final pour les paliers les plus bas
    if (level >= 6) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.9);
      gain.gain.setValueAtTime(0.18, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc.start(now + 0.5);
      osc.stop(now + 0.95);
    }
  } catch (_) { /* audio non bloquant */ }
};

export const playMilestoneFailConfetti = (level: number) => {
  if (level < 4) return;
  const dark = ['#4b5563', '#1f2937', '#7f1d1d', '#451a03', '#000000'];
  // Pluie morne qui tombe depuis le haut
  confetti({
    particleCount: 40 + level * 15,
    spread: 80 + level * 8,
    startVelocity: 12,
    origin: { x: 0.88, y: 0.1 },
    colors: dark,
    gravity: 1.4,
    ticks: 200 + level * 30,
    scalar: 0.9,
  });
};

// Son doré distinctif : arpège ascendant brillant type carillon (sine/triangle)
export const playBonusSound = () => {
  try {
    const ctx = getCtx();
    // 5 notes montantes : Mi3 Sol3 Si3 Re4 Fa#4 - arpège lumineux
    const notes = [164.81, 196, 246.94, 293.66, 369.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      gainNode.gain.setValueAtTime(0.0, t);
      gainNode.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.37);
    });
    // Scintillement final : accord de quinte en triangle, léger
    const chord = [523.25, 783.99];
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + 0.5;
      gainNode.gain.setValueAtTime(0.0, t);
      gainNode.gain.linearRampToValueAtTime(0.15, t + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.55);
    });
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

// Notes (Hz). Rest = 0.
const N = {
  A2: 110, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880,
} as const;
const R = 0;

export const createAmbientMusic = (type: 'home' | 'game'): AmbientMusic | null => {
  try {
    const ctx = getCtx();
    const targetVolume = type === 'home' ? 0.14 : 0.12;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.2);

    // Texture de fond très discrète
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = type === 'home' ? 140 : 220;
    noiseFilter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = type === 'home' ? 0.18 : 0.1;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();

    // ─── Batterie synthétisée ─────────────────────────────────────────────────

    // Kick : sine avec sweep freq 150→50 Hz, enveloppe percussive ~0.15s
    const playKick = () => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env);
      env.connect(masterGain);
      osc.type = 'sine';
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
      const kickVol = type === 'game' ? 0.55 : 0.28;
      env.gain.setValueAtTime(kickVol, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.2);
    };

    // Snare/clap : burst de bruit blanc filtré bandpass ~1.8kHz
    const playSnare = () => {
      const snareSize = ctx.sampleRate * 0.1;
      const snareBuf = ctx.createBuffer(1, snareSize, ctx.sampleRate);
      const sd = snareBuf.getChannelData(0);
      for (let i = 0; i < snareSize; i++) sd[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = snareBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800;
      bp.Q.value = 1.2;
      const env = ctx.createGain();
      src.connect(bp);
      bp.connect(env);
      env.connect(masterGain);
      const t = ctx.currentTime;
      const snareVol = type === 'game' ? 0.35 : 0.16;
      env.gain.setValueAtTime(snareVol, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      src.start(t);
      src.stop(t + 0.12);
    };

    // Hi-hat : burst de bruit high-pass ~8kHz, très court ~0.04s
    const playHihat = (open = false) => {
      const hatSize = ctx.sampleRate * 0.06;
      const hatBuf = ctx.createBuffer(1, hatSize, ctx.sampleRate);
      const hd = hatBuf.getChannelData(0);
      for (let i = 0; i < hatSize; i++) hd[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = hatBuf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7800;
      hp.Q.value = 0.8;
      const env = ctx.createGain();
      src.connect(hp);
      hp.connect(env);
      env.connect(masterGain);
      const t = ctx.currentTime;
      const hatVol = type === 'game' ? 0.18 : 0.09;
      const hatDecay = open ? 0.12 : 0.04;
      env.gain.setValueAtTime(hatVol, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + hatDecay);
      src.start(t);
      src.stop(t + hatDecay + 0.01);
    };

    // ─── Mélodie et basse ────────────────────────────────────────────────────

    // Joue une note ponctuelle (avec filtre lowpass synthwave en mode game)
    const playNote = (
      freq: number,
      wave: OscillatorType,
      attack: number,
      release: number,
      vel: number,
      filterFreq?: number,
    ) => {
      if (freq <= 0) return;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;

      if (filterFreq !== undefined) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = filterFreq;
        lp.Q.value = 2.0;
        osc.connect(lp);
        lp.connect(env);
      } else {
        osc.connect(env);
      }
      env.connect(masterGain);

      const t = ctx.currentTime;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(vel, t + attack);
      env.gain.exponentialRampToValueAtTime(0.001, t + release);
      osc.start(t);
      osc.stop(t + release + 0.05);
    };

    // Séquences : La mineur pentatonique. 16 pas, 1 basse par bar (4 pas).
    // Game = vif et groove ; Home = même gamme, plus lent et doux.
    const melody = type === 'game'
      ? [N.A4, R,     N.C5,  N.E5,  R,     N.D5,  N.C5,  R,
         N.E5,  N.G5,  R,     N.A5,  N.G5,  N.E5,  N.D5,  R]
      : [N.A4, R,     R,     N.C5,  R,     R,     N.E5,  R,
         N.D5,  R,     R,     N.G4,  R,     R,     N.E4,  R];

    const bassline = type === 'game'
      ? [N.A2, N.F3, N.C3, N.G3]      // i - VI - III - VII
      : [N.A2, N.F3, N.C3, N.E3];

    const stepMs = type === 'game' ? 200 : 380; // ~150 vs ~80 BPM (croches)
    // Mode game : sawtooth filtré pour grain synthwave mordant
    // Mode home : triangle/sine doux
    const melVel = type === 'game' ? 0.14 : 0.13;
    const melRelease = type === 'game' ? 0.45 : 1.0;
    const melWave: OscillatorType = type === 'game' ? 'sawtooth' : 'sine';
    const melFilter = type === 'game' ? 1800 : undefined;
    const bassWave: OscillatorType = type === 'game' ? 'square' : 'sine';
    const bassFilter = type === 'game' ? 600 : undefined;

    let active = true;
    let step = 0;
    const tick = () => {
      if (!active) return;

      const noteFreq = melody[step % melody.length];
      playNote(noteFreq, melWave, 0.01, melRelease, melVel, melFilter);

      // Basse + section rythmique sur les temps structurels
      if (step % 4 === 0) {
        const bass = bassline[(step / 4) % bassline.length];
        const bassVel = type === 'game' ? 0.28 : 0.2;
        const bassRelease = type === 'game' ? 0.6 : 1.1;
        playNote(bass, bassWave, 0.005, bassRelease, bassVel, bassFilter);

        // Kick sur les 4 temps (downbeats)
        playKick();
      }

      // Snare/clap sur les contretemps (pas 4 et 12 dans le cycle 16)
      if (step % 8 === 4) {
        playSnare();
      }

      // Hi-hat : croches en mode game (chaque pas impair), discrets en home (chaque 2 pas impairs)
      if (type === 'game') {
        if (step % 2 === 1) playHihat(false);
        // Open hi-hat sur les "et" de 3 et 4 pour groove synthwave
        if (step % 16 === 11 || step % 16 === 15) playHihat(true);
      } else {
        // Home : hi-hat très léger sur les pas 2 et 6 de chaque cycle de 8
        if (step % 8 === 2 || step % 8 === 6) playHihat(false);
      }

      step = (step + 1) % melody.length;
      setTimeout(tick, stepMs);
    };
    setTimeout(tick, 100);

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
