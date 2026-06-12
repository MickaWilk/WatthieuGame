import React from 'react';
import { Timer } from 'lucide-react';

interface GameUIProps {
  score: number;
  timeLeft: number;
}

export const GameUI: React.FC<GameUIProps> = ({ score, timeLeft }) => {
  const isUrgent = timeLeft <= 10;

  return (
    <div className="fixed top-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-md flex justify-between items-center border-b border-white/10">
      <div>
        <div className="text-2xl font-bold text-white">Score: {score}</div>
        <div className="text-xs text-white/70 mt-0.5">&#x1F7E2; Bonne bulle &nbsp; &#x1F534; Mauvaise bulle</div>
      </div>
      <div className={`flex items-center gap-2 ${isUrgent ? 'animate-pulse text-red-400' : 'text-white'}`}>
        <Timer className="w-6 h-6" />
        <span className="text-2xl font-bold">{timeLeft}s</span>
      </div>
    </div>
  );
};
