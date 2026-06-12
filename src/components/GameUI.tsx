import React from 'react';
import { Timer } from 'lucide-react';

interface GameUIProps {
  score: number;
  timeLeft: number;
}

export const GameUI: React.FC<GameUIProps> = ({ score, timeLeft }) => {
  return (
    <div className="fixed top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm flex justify-between items-center">
      <div>
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="text-xs text-gray-500 mt-0.5">&#x1F7E2; Bonne bulle &nbsp; &#x1F534; Mauvaise bulle</div>
      </div>
      <div className="flex items-center gap-2">
        <Timer className="w-6 h-6" />
        <span className="text-2xl font-bold">{timeLeft}s</span>
      </div>
    </div>
  );
};
