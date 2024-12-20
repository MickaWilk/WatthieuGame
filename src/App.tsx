import React, { useState, useEffect } from 'react';  
import { Bubble } from './components/Bubble';  
import { GameUI } from './components/GameUI';  
import { Friend, GameState } from './types';  
import { playPositiveEffect, playNegativeEffect } from './utils/effects';  
  
const GAME_DURATION = 60;  
const BUBBLE_SPAWN_INTERVAL = 1000;  
  
const friends: Friend[] = [  
  { id: 1, name: 'Ami 1', imageUrl: '/WatthieuGame/public/images/Alix.png', points: 15 },  
  { id: 2, name: 'Ami 2', imageUrl: '/WatthieuGame/public/images/Anaelle.png', points: -5 },  
  { id: 3, name: 'Ami 3', imageUrl: '/WatthieuGame/public/images/Charline.png', points: 10 },  
  { id: 4, name: 'Ami 4', imageUrl: '/WatthieuGame/public/images/coco.png', points: -10 },  
  { id: 5, name: 'Ami 5', imageUrl: '/WatthieuGame/public/images/dodo.png', points: 20 },  
  { id: 6, name: 'Ami 6', imageUrl: '/WatthieuGame/public/images/Elena.png', points: -15 },  
  { id: 7, name: 'Ami 7', imageUrl: '/WatthieuGame/public/images/Julia.png', points: 25 },  
  { id: 8, name: 'Ami 8', imageUrl: '/WatthieuGame/public/images/lea.png', points: -20 },  
  { id: 9, name: 'Ami 9', imageUrl: '/WatthieuGame/public/images/Lilian.png', points: 30 },  
  { id: 10, name: 'Ami 10', imageUrl: '/WatthieuGame/public/images/Matt.png', points: -25 },  
  { id: 11, name: 'Ami 11', imageUrl: '/WatthieuGame/public/images/Mel.png', points: 35 },  
  { id: 12, name: 'Ami 12', imageUrl: '/WatthieuGame/public/images/Steevens.png', points: -30 },  
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