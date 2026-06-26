import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { Bubble } from '@/components/Bubble';
import { GameUI } from '@/components/GameUI';
import { Friend, BubbleData, GameState, BonusType } from '@/types';
import { playPositiveEffect, playNegativeEffect, playTickSound, playComboSound, playMilestoneSound, playMilestoneConfetti, playMilestoneFailSound, playMilestoneFailConfetti, createAmbientMusic, AmbientMusic, playBubbleEffect } from '@/utils/effects';
import { generateBubblePosition } from '@/utils/bubbleUtils';
import { MILESTONES, NEGATIVE_MILESTONES } from '@/utils/milestones';

type ComboVariant = 'positive' | 'negative' | 'mixed';

// Échelle crescendo couvrant toutes les sommes possibles (-75 à +90).
// Trois familles : 3 bonnes (allPos), 3 mauvaises (allNeg), mixte.
const getComboMessage = (poppedPoints: number[]): { text: string; variant: ComboVariant } => {
  const total = poppedPoints.reduce((a, b) => a + b, 0);
  const allPos = poppedPoints.every(p => p > 0);
  const allNeg = poppedPoints.every(p => p < 0);

  // 3 bonnes bulles : crescendo de gloire
  if (allPos) {
    if (total >= 85) return { text: 'TRIFORCE DIVINE ! 🏆👑🔥', variant: 'positive' };
    if (total >= 70) return { text: 'TRIFORCE LÉGENDAIRE ! 🏆🔥', variant: 'positive' };
    if (total >= 55) return { text: 'TRIPLE PARFAIT ! ⭐⭐⭐', variant: 'positive' };
    if (total >= 40) return { text: 'COMBO EN OR ! 🥇', variant: 'positive' };
    if (total >= 25) return { text: 'Triplé propre ! 💪', variant: 'positive' };
    return { text: 'Trois bonnes, joli 😎', variant: 'positive' };
  }

  // 3 mauvaises bulles : crescendo de honte
  if (allNeg) {
    if (total <= -65) return { text: 'AUTODESTRUCTION TOTALE ☠️💀☠️', variant: 'negative' };
    if (total <= -50) return { text: 'COMPLÈTEMENT ÉCLATÉ AU SOL 💀💀', variant: 'negative' };
    if (total <= -35) return { text: 'Catastrophe intégrale 🔥💀', variant: 'negative' };
    if (total <= -20) return { text: "T'as fait exprès ou quoi ? 😱", variant: 'negative' };
    return { text: 'Trois mauvaises... vraiment ? 🤦', variant: 'negative' };
  }

  // Mixte : crescendo selon le bilan net
  if (total >= 50) return { text: 'Énorme malgré tout ! 🚀', variant: 'positive' };
  if (total >= 35) return { text: 'Très bien joué ! 🔥', variant: 'positive' };
  if (total >= 20) return { text: 'Combo solide 😎', variant: 'mixed' };
  if (total >= 5)  return { text: 'Combo correct 👍', variant: 'mixed' };
  if (total >= -5) return { text: "Pile à l'équilibre ⚖️", variant: 'mixed' };
  if (total >= -20) return { text: 'Mitigé... 😬', variant: 'mixed' };
  if (total >= -35) return { text: 'Pas terrible ça 😕', variant: 'negative' };
  return { text: 'Combo raté 😅', variant: 'negative' };
};

const GAME_DURATION = 60;

const SOUND_URLS = Array.from({ length: 29 }, (_, i) => `${import.meta.env.BASE_URL}added_sounds/${i + 1}.mp3`);

const friends: Friend[] = [
  { id: 1, name: 'Alix', imageUrl: `${import.meta.env.BASE_URL}images/Alix.png`, points: 15 },
  { id: 2, name: 'Anaelle', imageUrl: `${import.meta.env.BASE_URL}images/Anaelle.png`, points: -5 },
  { id: 3, name: 'Charline', imageUrl: `${import.meta.env.BASE_URL}images/Charline.png`, points: 10 },
  { id: 4, name: 'Coco', imageUrl: `${import.meta.env.BASE_URL}images/coco.png`, points: -10 },
  { id: 5, name: 'Dodo', imageUrl: `${import.meta.env.BASE_URL}images/dodo.png`, points: 20 },
  { id: 6, name: 'Elena', imageUrl: `${import.meta.env.BASE_URL}images/Elena.png`, points: -15 },
  { id: 7, name: 'Julia', imageUrl: `${import.meta.env.BASE_URL}images/Julia.png`, points: 25 },
  { id: 8, name: 'Léa', imageUrl: `${import.meta.env.BASE_URL}images/lea.png`, points: -20 },
  { id: 9, name: 'Lilian', imageUrl: `${import.meta.env.BASE_URL}images/Lilian.png`, points: 30 },
  { id: 10, name: 'Matt', imageUrl: `${import.meta.env.BASE_URL}images/Matt.png`, points: -25 },
  { id: 11, name: 'Mel', imageUrl: `${import.meta.env.BASE_URL}images/Mel.png`, points: 35 },
  { id: 12, name: 'Steevens', imageUrl: `${import.meta.env.BASE_URL}images/Steevens.png`, points: -30 },
];

const getRandomSound = () => SOUND_URLS[Math.floor(Math.random() * SOUND_URLS.length)];

const shuffleFriendPoints = (): Friend[] => {
  const pointValues = friends.map(f => f.points);
  const shuffled = [...pointValues].sort(() => Math.random() - 0.5);
  return friends.map((friend, i) => ({ ...friend, points: shuffled[i] }));
};

const BONUS_TYPES: BonusType[] = ['time', 'multiplier', 'megapop', 'goldrush'];

const generateBubbles = (roster: Friend[]): BubbleData[] => {
  const base: BubbleData[] = roster.map((friend) => ({
    ...friend,
    soundUrl: getRandomSound(),
    position: generateBubblePosition(),
  }));

  // 18% de chance de spawn d'une bulle bonus par vague
  if (Math.random() < 0.18) {
    const bonusType = BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)];
    const bonusBubble: BubbleData = {
      id: 1000 + Math.floor(Math.random() * 100000),
      name: 'BONUS',
      imageUrl: '',
      points: 0,
      soundUrl: getRandomSound(),
      position: generateBubblePosition(),
      bonus: bonusType,
    };
    base.push(bonusBubble);
  }

  return base;
};

const getMilestoneClasses = (level: number): string => {
  if (level <= 1) return "text-sm px-4 py-2 rounded-xl font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30";
  if (level <= 3) return "text-base px-5 py-3 rounded-xl font-bold text-white bg-linear-to-r from-yellow-500/90 to-orange-500/90 shadow-lg";
  if (level <= 4) return "text-lg px-6 py-3 rounded-xl font-extrabold text-white bg-linear-to-r from-orange-500 to-red-500 shadow-xl shadow-orange-500/40 animate-pulse";
  if (level <= 5) return "text-xl px-6 py-4 rounded-2xl font-extrabold text-white bg-linear-to-r from-red-500 via-pink-500 to-purple-500 shadow-2xl shadow-pink-500/50 milestone-epic";
  if (level === 6) return "text-2xl px-7 py-4 rounded-2xl font-extrabold text-white bg-linear-to-r from-purple-400 via-pink-400 to-yellow-300 shadow-2xl milestone-epic";
  if (level === 7) return "text-3xl px-8 py-5 rounded-2xl font-extrabold text-white bg-linear-to-r from-yellow-300 via-orange-400 to-pink-500 shadow-2xl milestone-godlike";
  return "text-4xl px-8 py-5 rounded-2xl font-extrabold text-white milestone-godlike-max";
};

const getNegativeMilestoneClasses = (level: number): string => {
  if (level <= 1) return "text-sm px-4 py-2 rounded-xl font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30";
  if (level <= 3) return "text-base px-5 py-3 rounded-xl font-bold text-white bg-linear-to-r from-slate-600/90 to-zinc-700/90 shadow-lg";
  if (level <= 4) return "text-lg px-6 py-3 rounded-xl font-extrabold text-white bg-linear-to-r from-red-800 to-red-600 shadow-xl shadow-red-900/40 animate-pulse";
  if (level <= 5) return "text-xl px-6 py-4 rounded-2xl font-extrabold text-white bg-linear-to-r from-red-900 via-rose-800 to-stone-800 shadow-2xl shadow-red-900/50 milestone-doom";
  if (level === 6) return "text-2xl px-7 py-4 rounded-2xl font-extrabold text-white bg-linear-to-r from-stone-800 via-red-900 to-black shadow-2xl milestone-doom";
  if (level === 7) return "text-3xl px-8 py-5 rounded-2xl font-extrabold text-white bg-linear-to-r from-red-950 via-black to-red-900 shadow-2xl milestone-doom";
  return "text-4xl px-8 py-5 rounded-2xl font-extrabold text-white milestone-doom-max";
};

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_DURATION,
    isPlaying: false,
  });
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [sessionBest, setSessionBest] = useState<number | null>(null);
  const [comboMessage, setComboMessage] = useState<{ text: string; variant: ComboVariant } | null>(null);
  const [milestoneToast, setMilestoneToast] = useState<{ message: string; level: number; kind: 'positive' | 'negative' } | null>(null);
  const [mutedMusic, setMutedMusic] = useState(false);
  const [mutedSfx, setMutedSfx] = useState(false);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [goldRushActive, setGoldRushActive] = useState(false);
  const [bonusToast, setBonusToast] = useState<string | null>(null);

  const isPlayingRef = useRef(false);
  const rosterRef = useRef<Friend[]>(friends);
  const comboGenRef = useRef(0);
  const currentScoreRef = useRef(0);
  const waveClicksRef = useRef(0);
  const lastWavePointsRef = useRef<number[]>([]);
  const ambientRef = useRef<AmbientMusic | null>(null);
  const mutedSfxRef = useRef(mutedSfx);
  // Ref pour lire mutedMusic sans le mettre en dep des effects musique
  const mutedMusicRef = useRef(mutedMusic);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const milestoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreMultiplierRef = useRef<number>(1);
  const goldRushRef = useRef<boolean>(false);
  const multiplierTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goldRushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bonusToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref stable vers les bulles courantes pour lecture synchrone (évite les effets de bord dans setBubbles)
  const bubblesRef = useRef<BubbleData[]>([]);

  useEffect(() => { isPlayingRef.current = gameState.isPlaying; }, [gameState.isPlaying]);
  useEffect(() => { mutedSfxRef.current = mutedSfx; }, [mutedSfx]);
  useEffect(() => { mutedMusicRef.current = mutedMusic; }, [mutedMusic]);
  // Tient bubblesRef à jour après chaque rendu
  useEffect(() => { bubblesRef.current = bubbles; }, [bubbles]);

  // Musique unifiée : home vs game selon isPlaying.
  // mutedMusic est lu via mutedMusicRef pour éviter de recréer la musique à chaque toggle.
  useEffect(() => {
    ambientRef.current?.stop();
    const music = createAmbientMusic(gameState.isPlaying ? 'game' : 'home');
    ambientRef.current = music;
    if (mutedMusicRef.current && music) music.setVolume(0);
  }, [gameState.isPlaying]);
  // mutedMusic intentionnellement hors deps - lu via mutedMusicRef pour éviter
  // de recréer l'instance audio à chaque mute/unmute (géré par handleToggleMusic).

  const handleToggleMusic = () => {
    setMutedMusic(prev => {
      const next = !prev;
      if (ambientRef.current) {
        ambientRef.current.setVolume(next ? 0 : (isPlayingRef.current ? 0.12 : 0.15));
      }
      return next;
    });
  };

  const handleToggleSfx = () => {
    setMutedSfx(prev => !prev);
  };

  const showBonusToast = (text: string) => {
    if (bonusToastTimeoutRef.current) clearTimeout(bonusToastTimeoutRef.current);
    setBonusToast(text);
    bonusToastTimeoutRef.current = setTimeout(() => setBonusToast(null), 1800);
  };

  const showComboFeedback = (points: number[]) => {
    const { text, variant } = getComboMessage(points);
    // Clear le timeout précédent pour ne pas couper un message qui vient d'apparaître
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    setComboMessage({ text, variant });
    if (!mutedSfxRef.current) playComboSound(variant);
    comboTimeoutRef.current = setTimeout(() => setComboMessage(null), 1800);
  };

  // Régénère les bulles et remet le compteur de vague à zéro
  const doWave = () => {
    waveClicksRef.current = 0;
    lastWavePointsRef.current = [];
    const newRoster = shuffleFriendPoints();
    rosterRef.current = newRoster;
    setBubbles(generateBubbles(newRoster));
  };

  // Repart le timer automatique de vague à zéro - appelé au combo pour resynchroniser
  const resetWaveTimer = () => {
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    waveIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;
      doWave();
    }, 2500);
  };

  const startGame = () => {
    rosterRef.current = shuffleFriendPoints();
    comboGenRef.current = 0;
    currentScoreRef.current = 0;
    waveClicksRef.current = 0;
    lastWavePointsRef.current = [];
    // Réinitialise les bonus
    scoreMultiplierRef.current = 1;
    goldRushRef.current = false;
    if (multiplierTimeoutRef.current) clearTimeout(multiplierTimeoutRef.current);
    if (goldRushTimeoutRef.current) clearTimeout(goldRushTimeoutRef.current);
    if (bonusToastTimeoutRef.current) clearTimeout(bonusToastTimeoutRef.current);
    setMultiplierActive(false);
    setGoldRushActive(false);
    setBonusToast(null);
    const initialBubbles = generateBubbles(rosterRef.current);
    setBubbles(initialBubbles);
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      isPlaying: true,
    });
  };

  // Timer (1s) + vague (2.5s) décorrélés - waveIntervalRef permet le reset au combo
  useEffect(() => {
    if (!gameState.isPlaying) return;

    resetWaveTimer();

    const timerInterval = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 10 && prev.timeLeft > 1) {
          if (!mutedSfxRef.current) playTickSound();
        }
        if (prev.timeLeft <= 1) {
          // Updater pur : retourne uniquement le nouvel état, sans effets de bord
          return { ...prev, timeLeft: 0, isPlaying: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
      if (multiplierTimeoutRef.current) clearTimeout(multiplierTimeoutRef.current);
      if (goldRushTimeoutRef.current) clearTimeout(goldRushTimeoutRef.current);
      if (bonusToastTimeoutRef.current) clearTimeout(bonusToastTimeoutRef.current);
    };
  }, [gameState.isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fin de partie : détecte la transition isPlaying=false + timeLeft=0.
  // Les mutations de refs sont synchrones (ok dans effect).
  // Les setState sont différés dans un microtask pour satisfaire react-hooks/set-state-in-effect
  // et éviter les renders en cascade synchrones.
  useEffect(() => {
    if (!gameState.isPlaying && gameState.timeLeft === 0) {
      // Mutations de refs : synchrones, pas de render
      scoreMultiplierRef.current = 1;
      goldRushRef.current = false;
      if (multiplierTimeoutRef.current) clearTimeout(multiplierTimeoutRef.current);
      if (goldRushTimeoutRef.current) clearTimeout(goldRushTimeoutRef.current);
      if (bonusToastTimeoutRef.current) clearTimeout(bonusToastTimeoutRef.current);
      // setState différés : React les batch ensemble, pas de cascade
      const finalScore = gameState.score;
      queueMicrotask(() => {
        setMultiplierActive(false);
        setGoldRushActive(false);
        setBonusToast(null);
        setSessionBest((best) => (best === null || finalScore > best ? finalScore : best));
      });
    }
  }, [gameState.isPlaying, gameState.timeLeft, gameState.score]);

  const handlePop = (id: number, points: number, bonus?: BonusType) => {
    // ── Branche BONUS : traitement isolé, pas de scoring normal, pas de combo ──
    if (bonus !== undefined) {
      // playBonusSound est déclenché directement dans Bubble.tsx avant le onPop
      setBubbles((prev) => prev.filter((b) => b.id !== id));

      switch (bonus) {
        case 'time': {
          setGameState((prev) => ({ ...prev, timeLeft: prev.timeLeft + 5 }));
          showBonusToast('⏱️ +5 SECONDES');
          break;
        }
        case 'multiplier': {
          scoreMultiplierRef.current = 2;
          setMultiplierActive(true);
          if (multiplierTimeoutRef.current) clearTimeout(multiplierTimeoutRef.current);
          multiplierTimeoutRef.current = setTimeout(() => {
            scoreMultiplierRef.current = 1;
            setMultiplierActive(false);
          }, 5000);
          showBonusToast('✨ SCORE x2');
          break;
        }
        case 'megapop': {
          // Lit les bulles courantes via ref (hors updater - évite la double exécution StrictMode)
          const currentBubbles = bubblesRef.current;
          const normalBubbles = currentBubbles.filter((b) => b.bonus === undefined && b.points !== 0);
          const sum = normalBubbles.reduce((acc, b) => acc + Math.abs(b.points), 0);
          if (sum > 0) {
            // Effets visuels pour chaque bulle explosée
            normalBubbles.forEach((b) => {
              const cx = b.position.x + b.position.size / 2;
              const cy = b.position.y + b.position.size / 2;
              playBubbleEffect(b.points, cx, cy);
            });
            // Mise à jour score + milestone
            const prevScore = currentScoreRef.current;
            const newScore = prevScore + sum;
            currentScoreRef.current = newScore;
            setGameState((gs) => ({ ...gs, score: gs.score + sum }));
            // Vérification milestone positif (un seul palier)
            const posIdx = MILESTONES.findIndex(
              (m) => prevScore < m.threshold && newScore >= m.threshold
            );
            if (posIdx !== -1) {
              const duration = posIdx >= 6 ? 2500 : posIdx >= 4 ? 2000 : 1500;
              if (milestoneTimeoutRef.current) clearTimeout(milestoneTimeoutRef.current);
              setMilestoneToast({ message: MILESTONES[posIdx].message, level: posIdx, kind: 'positive' });
              playMilestoneConfetti(posIdx);
              if (!mutedSfxRef.current) playMilestoneSound(posIdx);
              milestoneTimeoutRef.current = setTimeout(() => setMilestoneToast(null), duration);
            }
          }
          // Retire toutes les bulles normales + la bulle bonus cliquée (updater pur)
          setBubbles((prev) => prev.filter((b) => b.bonus !== undefined && b.id !== id));
          showBonusToast('💥 MÉGA-POP');
          break;
        }
        case 'goldrush': {
          goldRushRef.current = true;
          setGoldRushActive(true);
          if (goldRushTimeoutRef.current) clearTimeout(goldRushTimeoutRef.current);
          goldRushTimeoutRef.current = setTimeout(() => {
            goldRushRef.current = false;
            setGoldRushActive(false);
          }, 4000);
          showBonusToast('🪙 TOUT EN OR');
          break;
        }
      }
      return; // Pas de scoring normal, pas de combo
    }

    // ── Branche NORMALE ──────────────────────────────────────────────────────
    // Scoring effectif : goldrush rend positif, multiplier double les gains positifs
    let effective = points;
    if (goldRushRef.current) effective = Math.abs(points);
    if (scoreMultiplierRef.current > 1 && effective > 0) effective *= scoreMultiplierRef.current;

    // Confetti basé sur le signe ORIGINAL des points (intention visuelle)
    if (points > 0) playPositiveEffect(points);
    else playNegativeEffect();

    const prevScore = currentScoreRef.current;
    const newScore = prevScore + effective;
    // Mise à jour synchrone de la ref - évite le double-tap milestone (une frame de retard avec useEffect seul)
    currentScoreRef.current = newScore;

    // Montée : palier de gloire ; descente : palier de honte (un seul franchi par pop)
    const posIndex = MILESTONES.findIndex(m => prevScore < m.threshold && newScore >= m.threshold);
    const negIndex = NEGATIVE_MILESTONES.findIndex(m => prevScore > m.threshold && newScore <= m.threshold);
    if (posIndex !== -1) {
      const duration = posIndex >= 6 ? 2500 : posIndex >= 4 ? 2000 : 1500;
      if (milestoneTimeoutRef.current) clearTimeout(milestoneTimeoutRef.current);
      setMilestoneToast({ message: MILESTONES[posIndex].message, level: posIndex, kind: 'positive' });
      playMilestoneConfetti(posIndex);
      if (!mutedSfxRef.current) playMilestoneSound(posIndex);
      milestoneTimeoutRef.current = setTimeout(() => setMilestoneToast(null), duration);
    } else if (negIndex !== -1) {
      const duration = negIndex >= 6 ? 2500 : negIndex >= 4 ? 2000 : 1500;
      if (milestoneTimeoutRef.current) clearTimeout(milestoneTimeoutRef.current);
      setMilestoneToast({ message: NEGATIVE_MILESTONES[negIndex].message, level: negIndex, kind: 'negative' });
      playMilestoneFailConfetti(negIndex);
      if (!mutedSfxRef.current) playMilestoneFailSound(negIndex);
      milestoneTimeoutRef.current = setTimeout(() => setMilestoneToast(null), duration);
    }

    setGameState((prev) => ({
      ...prev,
      score: prev.score + effective,
    }));

    setBubbles((prev) => prev.filter((b) => b.id !== id));

    lastWavePointsRef.current.push(effective);
    waveClicksRef.current += 1;

    if (waveClicksRef.current >= 3) {
      const comboPoints = lastWavePointsRef.current.slice(-3);
      comboGenRef.current += 1;
      doWave();         // Régénération immédiate
      resetWaveTimer(); // Repart le timer de 2.5s depuis ce combo
      showComboFeedback(comboPoints);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden" data-goldrush={goldRushActive ? 'true' : undefined}>
      {!gameState.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-10 rounded-2xl text-center shadow-2xl max-w-sm w-full mx-4">
            {gameState.timeLeft === 0 ? (
              <>
                <h1 className="text-4xl font-extrabold mb-2 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Game Over !
                </h1>
                <p className="text-white/60 mb-4 text-sm">Temps &eacute;coul&eacute;</p>
                <div className="bg-white/10 rounded-xl p-5 mb-4 border border-white/10">
                  <p className="text-sm text-white/50 uppercase tracking-wide font-semibold mb-1">Score final</p>
                  <p className="text-5xl font-extrabold text-purple-300">{gameState.score}</p>
                </div>
                {sessionBest !== null && sessionBest > gameState.score && (
                  <p className="text-sm text-white/50 mb-4">
                    Record de session : <span className="font-bold text-blue-400">{sessionBest}</span>
                  </p>
                )}
                {sessionBest !== null && sessionBest === gameState.score && (
                  <p className="text-sm text-yellow-400 font-semibold mb-4">
                    &#x1F3C6; Nouveau record de session !
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-4xl font-extrabold mb-3 bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Bubble Pop !
                </h1>
                <p className="text-white/70 mb-6 text-base">
                  Poppez les bonnes bulles &#x1F7E2;, &eacute;vitez les mauvaises &#x1F534;
                </p>
              </>
            )}
            <button
              onClick={startGame}
              className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-purple-500/30 hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-150 w-full"
            >
              {gameState.timeLeft === 0 ? 'Rejouer' : 'Commencer'}
            </button>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleToggleMusic}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/10 transition-all duration-150"
              >
                {mutedMusic ? <VolumeX className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                Musique
              </button>
              <button
                onClick={handleToggleSfx}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/10 transition-all duration-150"
              >
                {mutedSfx ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                Sons
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState.isPlaying && (
        <>
          {/* Voile doré gold rush */}
          {goldRushActive && (
            <div
              className="absolute inset-0 pointer-events-none z-40"
              style={{ background: 'rgba(251, 191, 36, 0.12)', mixBlendMode: 'screen' }}
            />
          )}
          {/* Indicateur x2 multiplier */}
          {multiplierActive && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
              <div className="px-4 py-2 rounded-xl font-extrabold text-white text-lg bg-linear-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/40 animate-pulse">
                SCORE ×2
              </div>
            </div>
          )}
          <GameUI
            score={gameState.score}
            timeLeft={gameState.timeLeft}
            mutedMusic={mutedMusic}
            mutedSfx={mutedSfx}
            onToggleMusic={handleToggleMusic}
            onToggleSfx={handleToggleSfx}
          />
          {bubbles.map((bubble) => (
            <Bubble
              key={bubble.id}
              friend={bubble}
              position={bubble.position}
              onPop={handlePop}
              mutedSfx={mutedSfx}
            />
          ))}
        </>
      )}

      {bonusToast && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50" style={{ paddingTop: '6rem' }}>
          <div className="px-6 py-3 rounded-2xl font-extrabold text-white text-2xl shadow-2xl border border-yellow-400/60 bg-linear-to-r from-yellow-500/90 to-amber-500/90 backdrop-blur-xs animate-bounce">
            {bonusToast}
          </div>
        </div>
      )}

      {comboMessage && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`text-3xl font-extrabold px-6 py-3 rounded-2xl shadow-2xl bg-black/70 backdrop-blur-xs border ${
            comboMessage.variant === 'positive' ? 'text-yellow-300 border-yellow-500/50' :
            comboMessage.variant === 'negative' ? 'text-red-400 border-red-500/50' :
            'text-blue-300 border-blue-500/50'
          } animate-bounce`}>
            {comboMessage.text}
          </div>
        </div>
      )}

      {milestoneToast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm text-center">
          <div className={milestoneToast.kind === 'negative'
            ? getNegativeMilestoneClasses(milestoneToast.level)
            : getMilestoneClasses(milestoneToast.level)}>
            {milestoneToast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
