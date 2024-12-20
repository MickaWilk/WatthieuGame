import React, { useState, useEffect } from 'react';  
import { Bubble } from './components/Bubble';  
import { GameUI } from './components/GameUI';  
import { Friend, GameState } from './types';  
import { playPositiveEffect, playNegativeEffect } from './utils/effects';  
  
const GAME_DURATION = 60;  
const BUBBLE_SPAWN_INTERVAL = 5000;  
  
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
  
interface PositionedFriend extends Friend {  
  x: number;  
  y: number;  
}  
  
function App() {  
  const [gameState, setGameState] = useState<GameState>({  
    score: 0,  
    timeLeft: GAME_DURATION,  
    isPlaying: false,  
  });  
  const [bubbles, setBubbles] = useState<PositionedFriend[]>([]);  
  
  const startGame = () => {  
    setGameState({  
      score: 0,  
      timeLeft: GAME_DURATION,  
      isPlaying: true,  
    });  
    generateInitialBubbles();  
  };  
  
  const generateRandomPosition = () => {  
    const x = Math.random() * (window.innerWidth - 100);  
    const y = Math.random() * (window.innerHeight - 100);  
    return { x, y };  
  };  
  
  const generateInitialBubbles = () => {  
    const initialBubbles = friends.map((friend) => {  
      const { x, y } = generateRandomPosition();  
      return { ...friend, x, y };  
    });  
    setBubbles(initialBubbles);  
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
  
    const spawnBubbles = () => {  
      setBubbles((prevBubbles) => {  
        const newBubbles = friends.map((friend) => {  
          if (prevBubbles.find((bubble) => bubble.id === friend.id)) {  
            return prevBubbles.find((bubble) => bubble.id === friend.id)!;  
          }  
          const { x, y } = generateRandomPosition();  
          return { ...friend, x, y };  
        });  
        return newBubbles;  
      });  
    };  
  
    spawnBubbles();  
    const interval = setInterval(spawnBubbles, BUBBLE_SPAWN_INTERVAL);  
  
    return () => clearInterval(interval);  
  }, [gameState.isPlaying]);  
  
  const handlePop = (id: number) => {  
    const poppedBubble = bubbles.find((bubble) => bubble.id === id);  
    if (poppedBubble) {  
      const points = poppedBubble.points;  
      if (points > 0) {  
        playPositiveEffect(points);  
      } else {  
        playNegativeEffect();  
      }  
  
      setGameState((prev) => ({  
        ...prev,  
        score: prev.score + points,  
      }));  
  
      setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));  
    }  
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
          {bubbles.map((friend) => (  
            <Bubble key={friend.id} friend={friend} onPop={() => handlePop(friend.id)} />  
          ))}  
        </>  
      )}  
    </div>  
  );  
}  
  
export default App;  