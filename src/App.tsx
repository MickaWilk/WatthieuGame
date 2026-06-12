import React, { useState, useEffect, useRef } from 'react';
import { Bubble } from './components/Bubble';
import { GameUI } from './components/GameUI';
import { Friend, GameState, BubblePosition } from './types';
import { playPositiveEffect, playNegativeEffect, playTickSound, playComboSound, playMilestoneSound, playMilestoneConfetti } from './utils/effects';
import { generateBubblePosition } from './utils/bubbleUtils';

const GAME_DURATION = 60;

const SOUND_URLS = Array.from({ length: 29 }, (_, i) => `${import.meta.env.BASE_URL}sounds/${i + 1}.mp3`);

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

interface BubbleWithPosition extends Friend {
  position: BubblePosition;
}

const getRandomSound = () => SOUND_URLS[Math.floor(Math.random() * SOUND_URLS.length)];

const shuffleFriendPoints = (): Friend[] => {
  const pointValues = friends.map(f => f.points);
  const shuffled = [...pointValues].sort(() => Math.random() - 0.5);
  return friends.map((friend, i) => ({ ...friend, points: shuffled[i] }));
};

const generateBubbles = (roster: Friend[]): BubbleWithPosition[] => {
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
  const [bubbles, setBubbles] = useState<BubbleWithPosition[]>([]);
  const [sessionBest, setSessionBest] = useState<number | null>(null);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [milestoneToast, setMilestoneToast] = useState<{ message: string; level: number } | null>(null);

  const isPlayingRef = useRef(false);
  const rosterRef = useRef<Friend[]>(friends);
  const recentPopsRef = useRef<number[]>([]);
  const comboGenRef = useRef(0);
  const currentScoreRef = useRef(0);

  useEffect(() => {
    isPlayingRef.current = gameState.isPlaying;
  }, [gameState.isPlaying]);

  useEffect(() => {
    currentScoreRef.current = gameState.score;
  }, [gameState.score]);

  const showComboFeedback = () => {
    setComboMessage('COMBO ! 🔥');
    playComboSound();
    setTimeout(() => setComboMessage(null), 1500);
  };

  const startGame = () => {
    rosterRef.current = shuffleFriendPoints();
    recentPopsRef.current = [];
    comboGenRef.current = 0;
    currentScoreRef.current = 0;
    const initialBubbles = generateBubbles(rosterRef.current);
    setBubbles(initialBubbles);
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      isPlaying: true,
    });
  };

  // Timer
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 10 && prev.timeLeft > 1) {
          playTickSound();
        }
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          setSessionBest((best) => (best === null || prev.score > best ? prev.score : best));
          return { ...prev, timeLeft: 0, isPlaying: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying]);

  const handlePop = (id: number, points: number) => {
    if (points > 0) {
      playPositiveEffect(points);
    } else {
      playNegativeEffect();
    }

    // Vérification des paliers
    const prevScore = currentScoreRef.current;
    const newScore = prevScore + points;
    const milestoneIndex = MILESTONES.findIndex(m => prevScore < m.threshold && newScore >= m.threshold);
    if (milestoneIndex !== -1) {
      const duration = milestoneIndex >= 6 ? 2500 : milestoneIndex >= 4 ? 2000 : 1500;
      setMilestoneToast({ message: MILESTONES[milestoneIndex].message, level: milestoneIndex });
      playMilestoneSound(milestoneIndex);
      playMilestoneConfetti(milestoneIndex);
      setTimeout(() => setMilestoneToast(null), duration);
    }

    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
    }));

    setBubbles((prev) => prev.filter((b) => b.id !== id));

    // Gestion combo 3 bulles en 2 secondes
    const now = Date.now();
    recentPopsRef.current = [...recentPopsRef.current.filter(t => now - t < 2000), now];

    if (recentPopsRef.current.length >= 3) {
      recentPopsRef.current = [];
      comboGenRef.current += 1;
      const newRoster = shuffleFriendPoints();
      rosterRef.current = newRoster;
      setBubbles(generateBubbles(newRoster));
      showComboFeedback();
      return;
    }

    // Respawn individuel - capturer la gen avant le timeout
    const gen = comboGenRef.current;
    setTimeout(() => {
      if (!isPlayingRef.current || comboGenRef.current !== gen) return;
      const friend = rosterRef.current.find((f) => f.id === id);
      if (!friend) return;
      setBubbles((prev) => [
        ...prev,
        { ...friend, soundUrl: getRandomSound(), position: generateBubblePosition() },
      ]);
    }, 2000);
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
          <GameUI score={gameState.score} timeLeft={gameState.timeLeft} />
          {bubbles.map((bubble) => (
            <Bubble
              key={bubble.id}
              friend={bubble}
              position={bubble.position}
              onPop={handlePop}
            />
          ))}
        </>
      )}

      {/* Overlay combo */}
      {comboMessage && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-bounce">
            {comboMessage}
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
