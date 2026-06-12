import React, { useState, useEffect, useRef } from 'react';
import { Bubble } from './components/Bubble';
import { GameUI } from './components/GameUI';
import { Friend, BubbleData, GameState } from './types';
import { playPositiveEffect, playNegativeEffect, playTickSound, playComboSound, playMilestoneSound, playMilestoneConfetti, createAmbientMusic, AmbientMusic } from './utils/effects';

type ComboVariant = 'positive' | 'negative' | 'mixed';

const getComboMessage = (poppedPoints: number[]): { text: string; variant: ComboVariant } => {
  const total = poppedPoints.reduce((a, b) => a + b, 0);
  const allPos = poppedPoints.every(p => p > 0);
  const allNeg = poppedPoints.every(p => p < 0);

  if (allPos && total >= 60)  return { text: 'TRIFORCE LÉGENDAIRE ! 🏆🔥', variant: 'positive' };
  if (allPos && total >= 30)  return { text: 'COMBO PARFAIT ! ⭐⭐⭐', variant: 'positive' };
  if (allPos)                 return { text: 'Propre ! 💪', variant: 'positive' };
  if (allNeg && total <= -50) return { text: 'COMPLÈTEMENT ÉCLATÉ AU SOL. 💀💀', variant: 'negative' };
  if (allNeg && total <= -20) return { text: "T'as fait exprès ou quoi ? 💀", variant: 'negative' };
  if (allNeg)                 return { text: 'Vraiment ? 🤦', variant: 'negative' };
  if (total >= 30)            return { text: 'Bien joué ! 🔥', variant: 'positive' };
  if (total >= 0)             return { text: 'Combo correct ! 😎', variant: 'mixed' };
  if (total < -20)            return { text: "C'était pas la bonne idée... 😬", variant: 'negative' };
  return { text: 'Combo raté de peu 😅', variant: 'mixed' };
};
import { generateBubblePosition } from './utils/bubbleUtils';

const GAME_DURATION = 60;

// Bug fix : le dossier s'appelle added_sounds, pas sounds
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

const MILESTONES = [
  { threshold: 50,   message: "OK." },
  { threshold: 100,  message: "Pas mal du tout ! 👍" },
  { threshold: 250,  message: "Tu commences à cartonner ! 🔥" },
  { threshold: 500,  message: "C'est chaud là ! 🚀" },
  { threshold: 750,  message: "Impressionnant ! 🌟" },
  { threshold: 1000, message: "T'es un monstre ! 💥" },
  { threshold: 1500, message: "LÉGENDE. 👑" },
  { threshold: 2000, message: "T'es pas humain... ⚡" },
  { threshold: 2500, message: "ON EST PLUS DANS LE MÊME SPORT. 🤯" },
  { threshold: 3000, message: "YOU'RE FUCKING GODLIKE. 👁️" },
];

const getRandomSound = () => SOUND_URLS[Math.floor(Math.random() * SOUND_URLS.length)];

const shuffleFriendPoints = (): Friend[] => {
  const pointValues = friends.map(f => f.points);
  const shuffled = [...pointValues].sort(() => Math.random() - 0.5);
  return friends.map((friend, i) => ({ ...friend, points: shuffled[i] }));
};

const generateBubbles = (roster: Friend[]): BubbleData[] => {
  return roster.map((friend) => ({
    ...friend,
    soundUrl: getRandomSound(),
    position: generateBubblePosition(),
  }));
};

const getMilestoneClasses = (level: number): string => {
  if (level <= 1) return "text-sm px-4 py-2 rounded-xl font-semibold text-white bg-white/20 backdrop-blur border border-white/30";
  if (level <= 3) return "text-base px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-500/90 to-orange-500/90 shadow-lg";
  if (level <= 4) return "text-lg px-6 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-xl shadow-orange-500/40 animate-pulse";
  if (level <= 5) return "text-xl px-6 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 shadow-2xl shadow-pink-500/50 milestone-epic";
  if (level === 6) return "text-2xl px-7 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 shadow-2xl milestone-epic";
  if (level === 7) return "text-3xl px-8 py-5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 shadow-2xl milestone-godlike";
  return "text-4xl px-8 py-5 rounded-2xl font-extrabold text-white milestone-godlike-max";
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
  const [milestoneToast, setMilestoneToast] = useState<{ message: string; level: number } | null>(null);
  const [muted, setMuted] = useState(false);

  const isPlayingRef = useRef(false);
  const rosterRef = useRef<Friend[]>(friends);
  const comboGenRef = useRef(0);
  const currentScoreRef = useRef(0);
  const waveClicksRef = useRef(0);
  const lastWavePointsRef = useRef<number[]>([]);
  const ambientRef = useRef<AmbientMusic | null>(null);
  const mutedRef = useRef(muted);

  useEffect(() => {
    isPlayingRef.current = gameState.isPlaying;
  }, [gameState.isPlaying]);

  useEffect(() => {
    currentScoreRef.current = gameState.score;
  }, [gameState.score]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Musique d'accueil quand pas en jeu
  useEffect(() => {
    if (!gameState.isPlaying) {
      ambientRef.current?.stop();
      const music = createAmbientMusic('home');
      ambientRef.current = music;
      if (muted && music) music.setVolume(0);
    }
  }, [gameState.isPlaying]); // muted géré séparément

  // Musique en jeu
  useEffect(() => {
    if (gameState.isPlaying) {
      ambientRef.current?.stop();
      const music = createAmbientMusic('game');
      ambientRef.current = music;
      if (muted && music) music.setVolume(0);
    }
  }, [gameState.isPlaying]);

  // Mute toggle
  const handleToggleMute = () => {
    setMuted(prev => {
      const next = !prev;
      if (ambientRef.current) {
        ambientRef.current.setVolume(next ? 0 : (gameState.isPlaying ? 0.10 : 0.12));
      }
      return next;
    });
  };

  const showComboFeedback = (points: number[]) => {
    const { text, variant } = getComboMessage(points);
    setComboMessage({ text, variant });
    if (!muted) playComboSound(variant);
    setTimeout(() => setComboMessage(null), 1800);
  };

  const startGame = () => {
    rosterRef.current = shuffleFriendPoints();
    comboGenRef.current = 0;
    currentScoreRef.current = 0;
    waveClicksRef.current = 0;
    lastWavePointsRef.current = [];
    const initialBubbles = generateBubbles(rosterRef.current);
    setBubbles(initialBubbles);
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      isPlaying: true,
    });
  };

  // Timer + régénération de vague à chaque seconde
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 10 && prev.timeLeft > 1) {
          if (!mutedRef.current) playTickSound();
        }
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          setSessionBest((best) => (best === null || prev.score > best ? prev.score : best));
          return { ...prev, timeLeft: 0, isPlaying: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });

      // Régénération de vague à chaque seconde
      waveClicksRef.current = 0;
      lastWavePointsRef.current = [];
      const newRoster = shuffleFriendPoints();
      rosterRef.current = newRoster;
      setBubbles(generateBubbles(newRoster));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying]);

  const handlePop = (id: number, points: number) => {
    if (!muted) {
      if (points > 0) {
        playPositiveEffect(points);
      } else {
        playNegativeEffect();
      }
    }

    // Vérification des paliers
    const prevScore = currentScoreRef.current;
    const newScore = prevScore + points;
    const milestoneIndex = MILESTONES.findIndex(m => prevScore < m.threshold && newScore >= m.threshold);
    if (milestoneIndex !== -1) {
      const duration = milestoneIndex >= 6 ? 2500 : milestoneIndex >= 4 ? 2000 : 1500;
      setMilestoneToast({ message: MILESTONES[milestoneIndex].message, level: milestoneIndex });
      if (!muted) {
        playMilestoneSound(milestoneIndex);
        playMilestoneConfetti(milestoneIndex);
      }
      setTimeout(() => setMilestoneToast(null), duration);
    }

    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
    }));

    setBubbles((prev) => prev.filter((b) => b.id !== id));

    // Logique vague
    lastWavePointsRef.current.push(points);
    waveClicksRef.current += 1;

    if (waveClicksRef.current >= 3) {
      // Combo ! Régénération immédiate
      const comboPoints = lastWavePointsRef.current.slice(-3);
      waveClicksRef.current = 0;
      lastWavePointsRef.current = [];
      comboGenRef.current += 1;
      const newRoster = shuffleFriendPoints();
      rosterRef.current = newRoster;
      setBubbles(generateBubbles(newRoster));
      showComboFeedback(comboPoints);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {!gameState.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-10 rounded-2xl text-center shadow-2xl max-w-sm w-full mx-4">
            {gameState.timeLeft === 0 ? (
              <>
                <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
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
                <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Bubble Pop !
                </h1>
                <p className="text-white/70 mb-6 text-base">
                  Poppez les bonnes bulles &#x1F7E2;, &eacute;vitez les mauvaises &#x1F534;
                </p>
              </>
            )}
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg shadow-purple-500/30 hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-150 w-full"
            >
              {gameState.timeLeft === 0 ? 'Rejouer' : 'Commencer'}
            </button>
          </div>
        </div>
      )}

      {gameState.isPlaying && (
        <>
          <GameUI
            score={gameState.score}
            timeLeft={gameState.timeLeft}
            muted={muted}
            onToggleMute={handleToggleMute}
          />
          {bubbles.map((bubble) => (
            <Bubble
              key={bubble.id}
              friend={bubble}
              position={bubble.position}
              onPop={handlePop}
              muted={muted}
            />
          ))}
        </>
      )}

      {/* Overlay combo */}
      {comboMessage && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`text-3xl font-extrabold px-6 py-3 rounded-2xl shadow-2xl bg-black/70 backdrop-blur-sm border ${
            comboMessage.variant === 'positive' ? 'text-yellow-300 border-yellow-500/50' :
            comboMessage.variant === 'negative' ? 'text-red-400 border-red-500/50' :
            'text-blue-300 border-blue-500/50'
          } animate-bounce`}>
            {comboMessage.text}
          </div>
        </div>
      )}

      {/* Toast palier - coin bas-droit, intensité crescendo */}
      {milestoneToast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-xs text-right">
          <div className={getMilestoneClasses(milestoneToast.level)}>
            {milestoneToast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
