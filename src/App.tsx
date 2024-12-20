import React, { useState, useEffect } from 'react';
import { Bubble } from './components/Bubble';
import { GameUI } from './components/GameUI';
import { Friend, GameState } from './types';
import { playPositiveEffect, playNegativeEffect } from './utils/effects';

const GAME_DURATION = 60;
const BUBBLE_SPAWN_INTERVAL = 1000;

const friends: Friend[] = [
  { id: 1, name: "Ami 1", imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80", points: 15 },
  { id: 2, name: "Ami 2", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", points: -5 },
  { id: 3, name: "Ami 3", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", points: 10 },
  { id: 4, name: "Ami 4", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", points: -10 },
];

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_DURATION,
    isPlaying: false,
  });
  const [bubbles, setBubbles] = useState<Friend[]>([]);

  const startGame = () => {
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      isPlaying: true,
    });
    setBubbles([]);
  };

  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          return { ...prev, timeLeft: 0, isPlaying: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying]);

  useEffect(() => {
    if (!gameState.isPlaying) return;

    const spawnBubble = () => {
      const randomFriend = friends[Math.floor(Math.random() * friends.length)];
      setBubbles((prev) => [...prev, randomFriend]);
    };

    const interval = setInterval(spawnBubble, BUBBLE_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

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
          {bubbles.map((friend, index) => (
            <Bubble key={`${friend.id}-${index}`} friend={friend} onPop={handlePop} />
          ))}
        </>
      )}
    </div>
  );
}

export default App;