import React, { useState, useEffect } from 'react';
import { Bubble } from './components/Bubble';
import { GameUI } from './components/GameUI';
import { Friend, GameState, BubblePosition } from './types';
import { playPositiveEffect, playNegativeEffect } from './utils/effects';
import { generateBubblePosition } from './utils/bubbleUtils';

const GAME_DURATION = 60;
const BUBBLE_SPAWN_INTERVAL = 3000;

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
const generateAllBubbles = () => {
  return friends.map((friend) => ({
    ...friend,
    soundUrl: getRandomSound(), // Son aléatoire attribué à chaque bulle
    position: generateBubblePosition(), // Position aléatoire pour chaque bulle
  }));
};

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_DURATION,
    isPlaying: false,
  });
  const [bubbles, setBubbles] = useState<BubbleWithPosition[]>([]);
  const [lastSpawnTime, setLastSpawnTime] = useState(0);

  // Fonction pour démarrer le jeu
  const startGame = () => {
    const initialBubbles = generateAllBubbles();
    setBubbles(initialBubbles);
    setLastSpawnTime(Date.now());
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      isPlaying: true,
    });
  };

  // Gestion du timer et des bulles
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      const currentTime = Date.now();

      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          return { ...prev, timeLeft: 0, isPlaying: false };
        }

        // Régénérer les bulles toutes les 5 secondes
        if (currentTime - lastSpawnTime >= BUBBLE_SPAWN_INTERVAL) {
          setBubbles(generateAllBubbles());
          setLastSpawnTime(currentTime);
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, lastSpawnTime]);

  // Fonction appelée lors du clic sur une bulle
  const handlePop = (points: number) => {
    if (points > 0) {
      playPositiveEffect(points);
    } else {
      playNegativeEffect();
    }

    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
    }));

    setBubbles((prev) => prev.filter((bubble) => bubble.points !== points));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
      {!gameState.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h1 className="text-3xl font-bold mb-4">
              {gameState.timeLeft === 0 ? 'Game Over!' : 'Bubble Pop!'}
            </h1>
            {gameState.timeLeft === 0 && (
              <p className="text-xl mb-4">Score final: {gameState.score}</p>
            )}
            <button
              onClick={startGame}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl hover:bg-blue-600 transition-colors"
            >
              {gameState.timeLeft === 0 ? 'Rejouer' : 'Commencer'}
            </button>
          </div>
        </div>
      )}

      {gameState.isPlaying && (
        <>
          <GameUI score={gameState.score} timeLeft={gameState.timeLeft} />
          {bubbles.map((bubble, index) => (
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
