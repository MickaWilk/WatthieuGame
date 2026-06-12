import React from 'react';
import { Timer, Volume2, VolumeX } from 'lucide-react';

interface GameUIProps {
  score: number;
  timeLeft: number;
  muted: boolean;
  onToggleMute: () => void;
}

const MILESTONES_THRESHOLDS = [50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000];
const MAX_SCORE = 3000;

export const GameUI: React.FC<GameUIProps> = ({ score, timeLeft, muted, onToggleMute }) => {
  const isUrgent = timeLeft <= 10;

  const clampedScore = Math.max(0, Math.min(score, MAX_SCORE));
  const pct = (clampedScore / MAX_SCORE) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-md flex justify-between items-center border-b border-white/10">
      <div>
        <div className="text-2xl font-bold text-white">Score: {score}</div>
        {/* Barre de progression 0-3000 */}
        <div className="mt-1 w-48 relative">
          <div className="h-2 rounded-full bg-white/10 relative overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
            {MILESTONES_THRESHOLDS.map(t => (
              <div
                key={t}
                className="absolute top-0 w-px h-full bg-white/30"
                style={{ left: `${(t / MAX_SCORE) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-0.5">
            <span>0</span>
            <span>{score > MAX_SCORE ? `${score} 🔥` : `${clampedScore}/${MAX_SCORE}`}</span>
            <span>3k</span>
          </div>
        </div>
        <div className="text-xs text-white/70 mt-0.5">&#x1F7E2; Bonne bulle &nbsp; &#x1F534; Mauvaise bulle</div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 ${isUrgent ? 'animate-pulse text-red-400' : 'text-white'}`}>
          <Timer className="w-6 h-6" />
          <span className="text-2xl font-bold">{timeLeft}s</span>
        </div>
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white ml-2"
          title={muted ? 'Activer le son' : 'Couper le son'}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
