import React, { useState, useEffect, useRef } from 'react';
import { Bubble } from './components/Bubble';
import { GameUI } from './components/GameUI';
import { Friend, GameState, BubblePosition } from './types';
import { playPositiveEffect, playNegativeEffect } from './utils/effects';
import { generateBubblePosition } from './utils/bubbleUtils';

const GAME_DURATION = 60;

// Générer la liste des URLs de sons disponibles
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

interface BubbleWithPosition extends Friend {
  position: BubblePosition;
}

// Fonction pour choisir un son aléatoire
const getRandomSound = () => SOUND_URLS[Math.floor(Math.random() * SOUND_URLS.length)];

// Fonction pour générer toutes les bulles avec des positions et sons aléatoires
const generateAllBubbles = (): BubbleWithPosition[] => {
  return friends.map((friend) => ({
    ...friend,
    soundUrl: getRandomSound(),
    position: generateBubblePosition(),
  }));
};

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_DURATION,
    isPlaying: false,
  });
  const [bubbles, setBubbles] = useState<BubbleWithPosition[]>([]);
  const [sessionBest, setSessionBest] = useState<number | null>(null);

  // Ref pour accéder à isPlaying sans stale closure dans les setTimeout
  const isPlayingRef = useRef(false);

  // Synchroniser le ref avec l'état
  useEffect(() => {
    isPlayingRef.current = gameState.isPlaying;
  }, [gameState.isPlaying]);

  // Fonction pour démarrer le jeu
  const startGame = () => {
    const initialBubbles = generateAllBubbles();
    setBubbles(initialBubbles);
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      isPlaying: true,
    });
  };

  // Gestion du timer
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          // Mettre à jour le record de session
          setSessionBest((best) => (best === null || prev.score > best ? prev.score : best));
          return { ...prev, timeLeft: 0, isPlaying: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying]);

  // Fonction appelée lors du clic sur une bulle
  const handlePop = (id: number, points: number) => {
    if (points > 0) {
      playPositiveEffect(points);
    } else {
      playNegativeEffect();
    }

    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
    }));

    // Retirer la bulle poppée
    setBubbles((prev) => prev.filter((b) => b.id !== id));

    // Respawn après 2s avec nouvelle position
    setTimeout(() => {
      if (!isPlayingRef.current) return;
      const friend = friends.find((f) => f.id === id);
      if (!friend) return;
      setBubbles((prev) => [
        ...prev,
        { ...friend, soundUrl: getRandomSound(), position: generateBubblePosition() },
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
      {!gameState.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl text-center shadow-2xl max-w-sm w-full mx-4">
            {gameState.timeLeft === 0 ? (
              <>
                <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Game Over !
                </h1>
                <p className="text-gray-500 mb-4 text-sm">Temps écoulé</p>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 mb-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Score final</p>
                  <p className="text-5xl font-extrabold text-purple-600">{gameState.score}</p>
                </div>
                {sessionBest !== null && sessionBest > gameState.score && (
                  <p className="text-sm text-gray-400 mb-4">
                    Record de session : <span className="font-bold text-blue-500">{sessionBest}</span>
                  </p>
                )}
                {sessionBest !== null && sessionBest === gameState.score && (
                  <p className="text-sm text-yellow-500 font-semibold mb-4">
                    &#x1F3C6; Nouveau record de session !
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Bubble Pop !
                </h1>
                <p className="text-gray-600 mb-6 text-base">
                  Poppez les bonnes bulles &#x1F7E2;, évitez les mauvaises &#x1F534;
                </p>
              </>
            )}
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 hover:scale-105 transition-all duration-150 w-full"
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
    </div>
  );
}

export default App;
